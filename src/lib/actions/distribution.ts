"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type DistributionUserPageParams = {
  query?: string;
  page?: number;
  limit?: number;
};

type DistributionTargetsPageParams = {
  targetType: "question_bank" | "exam";
  query?: string;
  page?: number;
  limit?: number;
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: profile } = await (supabase.from("profiles") as any)
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Not authorized");
  }

  return { supabase, userId: user.id };
}

export async function createDistribution(
  targetType: "question_bank" | "exam",
  targetId: number,
  visibility: "public" | "assigned_only",
  userIds: string[],
  note?: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Check if admin
  const { data: profile } = await (supabase.from("profiles") as any)
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Not authorized");
  }

  // 1. Create distribution record
  const { data: distribution, error: distError } = await (supabase.from("distributions") as any)
    .insert({
      target_type: targetType,
      target_id: targetId,
      visibility,
      note,
      created_by: user.id,
    })
    .select()
    .single();

  if (distError || !distribution) {
    throw new Error(distError?.message || "Failed to create distribution");
  }

  // 2. Create distribution users
  if (userIds.length > 0) {
    const userEntries = userIds.map((uid) => ({
      distribution_id: distribution.id,
      user_id: uid,
    }));

    const { error: usersError } = await (supabase.from("distribution_users") as any)
      .insert(userEntries);

    if (usersError) {
      // Cleanup
      await (supabase.from("distributions") as any).delete().eq("id", distribution.id);
      throw new Error(usersError.message);
    }

    // 3. If public visibility, also unlock for users
    if (visibility === "public") {
      // Need to insert into user_bank_unlocks or user_exam_unlocks
      // We should check existing unlocks to avoid duplicates (though simple insert with ignore/on conflict might be easier if supported, but RLS might block if conflict handling isn't perfect)
      // Actually, my unlock tables have UNIQUE constraints. `insert().select()` or `.upsert()` with `ignoreDuplicates: true` is best.

      if (targetType === "question_bank") {
        const unlockEntries = userIds.map((uid) => ({
          user_id: uid,
          bank_id: targetId,
          unlock_type: "admin", // Using 'admin' as unlock type
        }));

        await (supabase.from("user_bank_unlocks") as any)
          .upsert(unlockEntries, { onConflict: "user_id, bank_id", ignoreDuplicates: true });
      } else {
        const unlockEntries = userIds.map((uid) => ({
          user_id: uid,
          exam_id: targetId,
          unlock_type: "admin",
        }));

        await (supabase.from("user_exam_unlocks") as any)
          .upsert(unlockEntries, { onConflict: "user_id, exam_id", ignoreDuplicates: true });
      }
    }

    // 4. Create notifications
    // Fetch target title for notification
    let targetTitle = "";
    if (targetType === "question_bank") {
      const { data: bank } = await (supabase.from("question_banks") as any)
        .select("title, slug")
        .eq("id", targetId)
        .single();
      targetTitle = bank?.title || "Question Bank";
      
      // Notify users
      const notifications = userIds.map((uid) => ({
        user_id: uid,
        type: "distribution",
        title: "New Question Bank Available",
        message: `You have been granted access to "${targetTitle}".`,
        link: `/question-banks/${bank?.slug || targetId}`,
      }));
       await (supabase.from("notifications") as any).insert(notifications);

    } else {
      // Exam
      // We need to fetch subject slug for the link: /library/[subjectSlug]/exams/[examSlug]
      // or /practice/...
      // Let's get exam with subject
      const { data: exam } = await (supabase.from("exams") as any)
        .select("title, slug, subject:subjects(slug)")
        .eq("id", targetId)
        .single();
      
      targetTitle = exam?.title || "Mock Exam";
      // @ts-ignore - subject is joined
      const subjectSlug = exam?.subject?.slug || "subject"; 
      
      // Notify users
      const notifications = userIds.map((uid) => ({
        user_id: uid,
        type: "distribution",
        title: "New Mock Exam Available",
        message: `You have been granted access to "${targetTitle}".`,
        link: `/library/${subjectSlug}/exams/${exam?.slug || targetId}`,
      }));

      await (supabase.from("notifications") as any).insert(notifications);
    }
  }

  revalidatePath("/admin/distributions");
  return { success: true, distributionId: distribution.id };
}

export async function getDistributionUsersPage({
  query = "",
  page = 1,
  limit = 20,
}: DistributionUserPageParams) {
  const { supabase } = await requireAdmin();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 20;
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
  const searchText = query.trim();

  let request = (supabase
    .from("profiles") as any)
    .select("id, username, avatar_url, is_vip", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: true });

  if (searchText) {
    request = request.ilike("username", `%${searchText}%`);
  }

  const { data, count, error } = await request.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    users: data || [],
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

export async function getDistributionTargetsPage({
  targetType,
  query = "",
  page = 1,
  limit = 10,
}: DistributionTargetsPageParams) {
  const { supabase } = await requireAdmin();
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 10;
  const from = (safePage - 1) * safeLimit;
  const to = from + safeLimit - 1;
  const searchText = query.trim();

  const baseQuery =
    targetType === "question_bank"
      ? (supabase.from("question_banks") as any)
      : (supabase.from("exams") as any);

  let request = baseQuery
    .select("id, title, slug", { count: "exact" })
    .order("title", { ascending: true });

  if (searchText) {
    request = request.ilike("title", `%${searchText}%`);
  }

  const { data, count, error } = await request.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const total = count || 0;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));

  return {
    targets: ((data as any[] | null) || []).map((item: any) => ({
      ...item,
      type: targetType,
    })),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages,
  };
}

export async function getDistributions(
  targetType?: "question_bank" | "exam",
  targetId?: number,
  page = 1,
  limit = 20
) {
  const supabase = await createClient();
  let query = (supabase
    .from("distributions") as any)
    .select(
      `
      *,
      users:distribution_users(count)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (targetType) {
    query = query.eq("target_type", targetType);
  }
  if (targetId) {
    query = query.eq("target_id", targetId);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await query.range(from, to);

  if (error) {
    console.error("Error fetching distributions:", error);
    return { distributions: [], total: 0 };
  }
  
  // Need to fetch target names manually or via join if relations were set up in Supabase types perfectly 
  // but target_id is polymorphic (can be bank or exam). Polymorphic relations are tricky in standard Supabase joins without separate foreign keys.
  // We'll fetch titles in a second pass or just return IDs and let client fetch if needed, 
  // OR we can fetch basic info. 
  // For the list, it's better to fetch names.
  
  const distributionsWithNames = await Promise.all(
    ((data as any[] | null) || []).map(async (dist: any) => {
    let targetName = "Unknown";
    if (dist.target_type === "question_bank") {
        const { data: bank } = await (supabase.from("question_banks") as any).select("title").eq("id", dist.target_id).single();
        targetName = bank?.title || "Unknown Bank";
    } else {
        const { data: exam } = await (supabase.from("exams") as any).select("title").eq("id", dist.target_id).single();
        targetName = exam?.title || "Unknown Exam";
    }
    return { ...dist, target_name: targetName };
  }),
  );

  return { distributions: distributionsWithNames, total: count || 0 };
}

export async function getDistributionDetail(distributionId: number) {
  const supabase = await createClient();
  
  const { data: distribution, error } = await (supabase.from("distributions") as any)
    .select("*")
    .eq("id", distributionId)
    .single();

  if (error || !distribution) {
    return null;
  }

  // Get users
  const { data: distributionUsers } = await (supabase.from("distribution_users") as any)
    .select(`
      user_id,
      user:profiles(id, username, avatar_url, is_vip)
    `)
    .eq("distribution_id", distributionId);

  // Get target info
  let targetInfo = { title: "", slug: "" };
  if (distribution.target_type === "question_bank") {
    const { data: bank } = await (supabase.from("question_banks") as any).select("title, slug").eq("id", distribution.target_id).single();
    if (bank) targetInfo = bank;
  } else {
    const { data: exam } = await (supabase.from("exams") as any).select("title, slug").eq("id", distribution.target_id).single();
    if (exam) targetInfo = exam;
  }

  return {
    ...distribution,
    users: distributionUsers?.map((u: any) => u.user) || [],
    target: targetInfo
  };
}

export async function deleteDistribution(distributionId: number) {
  const supabase = await createClient();
  
  // Check admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  const { data: profile } = await (supabase.from("profiles") as any).select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Not authorized");

  // RLS allows admin to delete. Cascade will handle distribution_users.
  // Note: We do NOT revoke unlocks if they were granted in 'public' mode, 
  // because manual unlocks might have existed before or been intended to persist.
  // If we wanted to revoke, we'd need to track which unlocks came specifically from this distribution 
  // (maybe via a new column in user_bank_unlocks, or just leave it).
  // For now, simple delete of distribution record.
  
  const { error } = await (supabase.from("distributions") as any).delete().eq("id", distributionId);
  
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/distributions");
  return { success: true };
}
