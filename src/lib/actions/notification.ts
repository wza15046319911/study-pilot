"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type NotificationRow = {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export async function getUserNotifications(limit = 20) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: notifications } = await (supabase.from("notifications") as any)
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (notifications as NotificationRow[] | null) || [];
}

export async function getUnreadCount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count } = await (supabase.from("notifications") as any)
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return count || 0;
}

export async function markNotificationRead(notificationId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile/notifications");
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile/notifications");
  return { success: true };
}

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message?: string,
  link?: string
) {
  // This function is intended to be called by other server actions (like distribution),
  // which might run as admin or the user triggering the action.
  // We use createClient() which uses standard auth.
  // Ensure the caller has permission (Admin RLS policy handles insertion).
  const supabase = await createClient();

  const { error } = await (supabase.from("notifications") as any).insert({
    user_id: userId,
    type,
    title,
    message,
    link,
  });

  if (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
