"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Type definitions
export interface UserFilters {
  role?: "all" | "admin" | "regular";
  vipStatus?: "all" | "vip" | "non-vip";
}

// Ensure the caller is an admin
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Forbidden: Admin access required");
  }

  return user;
}

// Get paginated users with search and filters
export async function getUsers(
  page = 1,
  limit = 20,
  searchQuery = "",
  filters: UserFilters = { role: "all", vipStatus: "all" }
) {
  await requireAdmin();

  const supabase = createAdminClient();
  const offset = (page - 1) * limit;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" });

  if (searchQuery) {
    query = query.ilike("username", `%${searchQuery}%`);
  }

  if (filters.role === "admin") {
    query = query.eq("is_admin", true);
  } else if (filters.role === "regular") {
    query = query.eq("is_admin", false);
  }

  if (filters.vipStatus === "vip") {
    query = query.eq("is_vip", true);
  } else if (filters.vipStatus === "non-vip") {
    query = query.eq("is_vip", false);
  }

  query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

  const { data: profiles, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  // Fetch emails from auth.users if service role is available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const adminAuth = createAdminClient().auth.admin;
    const { data: authData } = await adminAuth.listUsers({
      page: 1,
      perPage: 1000,
    });

    const emailMap = new Map<string, string>();
    (authData?.users || []).forEach((u) => {
      if (u.id && u.email) {
        emailMap.set(u.id, u.email);
      }
    });

    return {
      users: (profiles || []).map((p) => ({
        ...p,
        email: emailMap.get(p.id) || null,
      })),
      total: count || 0,
      pages: Math.ceil((count || 0) / limit),
    };
  }

  return {
    users: (profiles || []).map((p) => ({ ...p, email: null })),
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  };
}

// Update user role (admin status)
export async function updateUserRole(userId: string, isAdmin: boolean) {
  const currentUser = await requireAdmin();

  // Prevent self-demotion
  if (userId === currentUser.id && !isAdmin) {
    throw new Error("You cannot remove your own admin privileges.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: isAdmin })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// Update user VIP status
export async function updateUserVip(
  userId: string,
  isVip: boolean,
  expiresAt: string | null = null
) {
  await requireAdmin();

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      is_vip: isVip,
      vip_expires_at: expiresAt,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user VIP status: ${error.message}`);
  }

  revalidatePath("/admin/users");
  return { success: true };
}

// Get user statistics
export async function getUserStats() {
  await requireAdmin();

  const supabase = createAdminClient();

  // Total users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // VIP users
  const { count: vipUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_vip", true);

  // Admin users
  const { count: adminUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_admin", true);

  // New users today (UTC)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const { count: newUsersToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  return {
    totalUsers: totalUsers || 0,
    vipUsers: vipUsers || 0,
    adminUsers: adminUsers || 0,
    newUsersToday: newUsersToday || 0,
  };
}
