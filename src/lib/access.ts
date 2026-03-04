type ExplanationAccessUser = {
  is_vip?: boolean | null;
  is_admin?: boolean | null;
} | null | undefined;

export function canViewExplanation(user: ExplanationAccessUser): boolean {
  return Boolean(user?.is_vip || user?.is_admin);
}

export function maskExplanationsForUser<T extends { explanation: string | null }>(
  items: T[],
  user: ExplanationAccessUser,
): T[] {
  if (canViewExplanation(user)) {
    return items;
  }

  return items.map((item) => ({
    ...item,
    explanation: null,
  }));
}
