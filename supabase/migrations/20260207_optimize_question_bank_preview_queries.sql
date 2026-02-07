-- Speed up preview page lookups used by /library/[subjectSlug]/question-banks/[questionBankSlug]
create index if not exists question_banks_slug_idx
  on public.question_banks (slug);

create index if not exists question_bank_items_bank_id_idx
  on public.question_bank_items (bank_id);

create index if not exists question_bank_items_question_id_idx
  on public.question_bank_items (question_id);

create index if not exists user_question_bank_collections_user_bank_idx
  on public.user_question_bank_collections (user_id, bank_id);

create index if not exists user_bank_unlocks_user_bank_idx
  on public.user_bank_unlocks (user_id, bank_id);
