export interface UserLite {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_vip: boolean | null;
}

export interface TargetOption {
  id: number;
  title: string;
  slug: string | null;
  type: "question_bank" | "exam";
}

export interface UsersPageResult {
  users: UserLite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TargetsPageResult {
  targets: TargetOption[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
