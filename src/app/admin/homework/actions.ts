"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sendHomeworkPushEmails } from "@/lib/email/sendHomeworkPushEmails";

type HomeworkPayload = {
  homeworkId?: number;
  subjectId: number;
  title: string;
  slug: string;
  description?: string;
  dueAt: string | null;
  allowedModes: string[];
  isPublished: boolean;
  questionIds: number[];
};

type HomeworkAudience =
  | { type: "all_premium" }
  | { type: "selected"; userIds: string[] };

const dedupe = (ids: string[]) => Array.from(new Set(ids));

const getAdminOrSessionClient = async () => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  return createClient();
};

const getPremiumUserIds = async () => {
  const admin = await getAdminOrSessionClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .eq("is_vip", true);
  return (profiles || []).map((p: any) => p.id);
};

const filterPremiumUserIds = async (userIds: string[]) => {
  if (userIds.length === 0) return [];
  const admin = await getAdminOrSessionClient();
  const { data: profiles } = await admin
    .from("profiles")
    .select("id")
    .in("id", userIds)
    .eq("is_vip", true);
  return (profiles || []).map((p: any) => p.id);
};

const getUserEmailMap = async () => {
  const admin = createAdminClient();
  const emailMap = new Map<string, string>();
  const perPage = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw new Error(error.message);
    }
    const users = data?.users || [];
    users.forEach((user) => {
      if (user.id && user.email) {
        emailMap.set(user.id, user.email);
      }
    });
    if (users.length < perPage) {
      break;
    }
    page += 1;
  }
  return emailMap;
};

const getEmailNotificationPreferenceMap = async (userIds: string[]) => {
  if (userIds.length === 0) {
    return new Map<string, boolean>();
  }

  const admin = createAdminClient();
  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, email_notifications_enabled")
    .in("id", userIds);

  if (error) {
    throw new Error(error.message);
  }

  const preferenceMap = new Map<string, boolean>();
  (profiles || []).forEach(
    (profile: { id: string; email_notifications_enabled: boolean | null }) => {
      preferenceMap.set(profile.id, profile.email_notifications_enabled !== false);
    },
  );

  return preferenceMap;
};

const upsertHomework = async (data: HomeworkPayload) => {
  const supabase = await createClient();
  const payload = {
    title: data.title,
    slug: data.slug,
    description: data.description,
    subject_id: data.subjectId,
    is_premium: true,
    is_published: data.isPublished,
    due_at: data.dueAt,
    allowed_modes: data.allowedModes,
    updated_at: new Date().toISOString(),
  };

  if (data.homeworkId) {
    const { error: updateError } = await (supabase.from("homeworks") as any)
      .update(payload)
      .eq("id", data.homeworkId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const { error: deleteError } = await (
      supabase.from("homework_items") as any
    )
      .delete()
      .eq("homework_id", data.homeworkId);

    if (deleteError) {
      throw new Error("Failed to clear homework items: " + deleteError.message);
    }

    if (data.questionIds.length > 0) {
      const items = data.questionIds.map((questionId, index) => ({
        homework_id: data.homeworkId,
        question_id: questionId,
        order_index: index,
      }));
      const { error: insertError } = await (
        supabase.from("homework_items") as any
      ).insert(items);

      if (insertError) {
        throw new Error("Failed to insert homework items: " + insertError.message);
      }
    }

    return data.homeworkId;
  }

  const { data: homework, error: insertError } = await (
    supabase.from("homeworks") as any
  )
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError || !homework) {
    throw new Error(insertError?.message || "Failed to create homework");
  }

  if (data.questionIds.length > 0) {
    const items = data.questionIds.map((questionId, index) => ({
      homework_id: homework.id,
      question_id: questionId,
      order_index: index,
    }));
    const { error: itemsError } = await (
      supabase.from("homework_items") as any
    ).insert(items);

    if (itemsError) {
      await supabase.from("homeworks").delete().eq("id", homework.id);
      throw new Error(itemsError.message);
    }
  }

  return homework.id as number;
};

const assignHomework = async (
  homeworkId: number,
  audience: HomeworkAudience
) => {
  const admin = await getAdminOrSessionClient();
  const userIds =
    audience.type === "all_premium"
      ? await getPremiumUserIds()
      : await filterPremiumUserIds(audience.userIds);
  const uniqueUserIds = dedupe(userIds);

  if (uniqueUserIds.length === 0) {
    return { assignedCount: 0, skipped: 0 };
  }

  const assignments = uniqueUserIds.map((userId) => ({
    homework_id: homeworkId,
    user_id: userId,
  }));

  const { error: assignmentError } = await (
    admin.from("homework_assignments") as any
  ).upsert(assignments, { onConflict: "homework_id,user_id" });

  if (assignmentError) {
    throw new Error(assignmentError.message);
  }

  return { assignedCount: uniqueUserIds.length, skipped: 0, userIds: uniqueUserIds };
};

export async function saveHomeworkDraft(data: HomeworkPayload) {
  const homeworkId = await upsertHomework({ ...data, isPublished: false });
  revalidatePath("/admin/homework");
  return { success: true, homeworkId };
}

export async function pushHomework(
  data: HomeworkPayload,
  audience: HomeworkAudience
) {
  const homeworkId = await upsertHomework({ ...data, isPublished: true });
  const assignmentResult = await assignHomework(homeworkId, audience);

  let emailResult = { sent: 0, skipped: 0, errors: [] as string[] };

  try {
    const canSendEmail =
      Boolean(process.env.RESEND_API_KEY) &&
      Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!canSendEmail) {
      emailResult = {
        sent: 0,
        skipped: assignmentResult.assignedCount || 0,
        errors: ["EMAIL_NOT_CONFIGURED"],
      };
    } else if (assignmentResult.userIds?.length) {
      const notificationPreferenceMap = await getEmailNotificationPreferenceMap(
        assignmentResult.userIds,
      );
      const optedInUserIds = assignmentResult.userIds.filter(
        (userId) => notificationPreferenceMap.get(userId) !== false,
      );
      const optedOutCount = assignmentResult.userIds.length - optedInUserIds.length;

      const emailMap = await getUserEmailMap();
      const recipients = optedInUserIds
        .map((userId) => ({
          id: userId,
          email: emailMap.get(userId),
        }))
        .filter((recipient): recipient is { id: string; email: string } =>
          Boolean(recipient.email)
        );

      const sendResult = await sendHomeworkPushEmails({
        recipients,
        homeworkTitle: data.title,
        dueAt: data.dueAt,
      });

      emailResult = {
        ...sendResult,
        skipped: sendResult.skipped + optedOutCount,
      };
    }
  } catch (error) {
    emailResult = {
      sent: 0,
      skipped: assignmentResult.assignedCount || 0,
      errors: [
        error instanceof Error ? error.message : "Failed to send emails",
      ],
    };
  }

  revalidatePath("/admin/homework");
  revalidatePath("/profile/homework");

  return {
    success: true,
    homeworkId,
    assignedCount: assignmentResult.assignedCount || 0,
    email: emailResult,
  };
}

export async function deleteHomework(homeworkId: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("homeworks").delete().eq("id", homeworkId);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath("/admin/homework");
  return { success: true };
}
