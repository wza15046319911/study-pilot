-- Function to handle referral from user metadata (for Email Signups)
CREATE OR REPLACE FUNCTION public.handle_new_user_referral()
RETURNS TRIGGER AS $$
DECLARE
    ref_code text;
    referrer_uuid uuid;
BEGIN
    -- Extract referral code from metadata
    ref_code := NEW.raw_user_meta_data->>'referral_code';

    -- If no code, do nothing
    IF ref_code IS NULL OR ref_code = '' THEN
        RETURN NEW;
    END IF;

    -- Find referrer
    SELECT user_id INTO referrer_uuid
    FROM public.referral_codes
    WHERE code = ref_code;

    -- If referrer exists and is not self
    IF referrer_uuid IS NOT NULL AND referrer_uuid <> NEW.id THEN
        -- Insert referral record (ignore duplicates via ON CONFLICT if needed, but uniqueness constraint on referee_id handles it)
        BEGIN
            INSERT INTO public.referrals (referrer_id, referee_id, referral_code)
            VALUES (referrer_uuid, NEW.id, ref_code);
        EXCEPTION WHEN unique_violation THEN
            -- Already referred, ignore
        END;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created_referral ON auth.users;
CREATE TRIGGER on_auth_user_created_referral
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_referral();

