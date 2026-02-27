-- Grant separate referral unlock credits to both inviter (referrer) and invitee (referee).
-- Keep legacy columns for backward compatibility.

ALTER TABLE "public"."referrals"
ADD COLUMN IF NOT EXISTS "referrer_used_for_unlock" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."referrals"
ADD COLUMN IF NOT EXISTS "referee_used_for_unlock" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."referrals"
ADD COLUMN IF NOT EXISTS "referrer_unlocked_bank_id" bigint REFERENCES "public"."question_banks"("id") ON DELETE SET NULL;

ALTER TABLE "public"."referrals"
ADD COLUMN IF NOT EXISTS "referee_unlocked_bank_id" bigint REFERENCES "public"."question_banks"("id") ON DELETE SET NULL;

-- Backfill legacy consumption state to referrer-side credit state.
UPDATE "public"."referrals"
SET
  "referrer_used_for_unlock" = COALESCE("used_for_unlock", false),
  "referrer_unlocked_bank_id" = "unlocked_bank_id"
WHERE "referrer_used_for_unlock" = false
  AND ("used_for_unlock" = true OR "unlocked_bank_id" IS NOT NULL);

