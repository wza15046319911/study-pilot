


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_referral"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user_referral"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookmarks" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "question_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bookmarks" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."bookmarks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."bookmarks_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."bookmarks_id_seq" OWNED BY "public"."bookmarks"."id";



CREATE TABLE IF NOT EXISTS "public"."exam_attempts" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "exam_id" integer,
    "started_at" timestamp with time zone DEFAULT "now"(),
    "finished_at" timestamp with time zone,
    "score" integer,
    "total_questions" integer,
    "answers" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exam_attempts" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exam_attempts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exam_attempts_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exam_attempts_id_seq" OWNED BY "public"."exam_attempts"."id";



CREATE TABLE IF NOT EXISTS "public"."exam_questions" (
    "id" integer NOT NULL,
    "exam_id" integer,
    "question_id" integer,
    "order_index" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."exam_questions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exam_questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exam_questions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exam_questions_id_seq" OWNED BY "public"."exam_questions"."id";



CREATE TABLE IF NOT EXISTS "public"."exams" (
    "id" integer NOT NULL,
    "subject_id" integer,
    "title" "text" NOT NULL,
    "exam_type" "text" NOT NULL,
    "duration_minutes" integer DEFAULT 120 NOT NULL,
    "rules" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_published" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "slug" character varying(255),
    CONSTRAINT "exams_exam_type_check" CHECK (("exam_type" = ANY (ARRAY['midterm'::"text", 'final'::"text"])))
);


ALTER TABLE "public"."exams" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."exams_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."exams_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."exams_id_seq" OWNED BY "public"."exams"."id";



CREATE TABLE IF NOT EXISTS "public"."flashcard_reviews" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "question_id" bigint NOT NULL,
    "next_review_at" timestamp with time zone NOT NULL,
    "interval_days" real DEFAULT 1.0 NOT NULL,
    "ease_factor" real DEFAULT 2.5 NOT NULL,
    "repetitions" integer DEFAULT 0 NOT NULL,
    "last_reviewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."flashcard_reviews" OWNER TO "postgres";


ALTER TABLE "public"."flashcard_reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."flashcard_reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."mistakes" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "question_id" integer,
    "error_count" integer DEFAULT 1,
    "error_type" "text",
    "last_error_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "last_wrong_answer" "text"
);


ALTER TABLE "public"."mistakes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."mistakes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."mistakes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."mistakes_id_seq" OWNED BY "public"."mistakes"."id";



CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "stripe_session_id" "text" NOT NULL,
    "stripe_payment_intent" "text",
    "amount" integer NOT NULL,
    "currency" "text" DEFAULT 'aud'::"text",
    "status" "text" DEFAULT 'pending'::"text",
    "product_type" "text" DEFAULT 'lifetime_access'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "payments_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text", 'refunded'::"text"])))
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."payments_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."payments_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."payments_id_seq" OWNED BY "public"."payments"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "avatar_url" "text",
    "level" integer DEFAULT 1,
    "streak_days" integer DEFAULT 0,
    "last_practice_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_vip" boolean DEFAULT false,
    "vip_expires_at" timestamp with time zone,
    "active_session_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "is_admin" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."question_bank_items" (
    "id" bigint NOT NULL,
    "bank_id" bigint NOT NULL,
    "question_id" bigint NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."question_bank_items" OWNER TO "postgres";


ALTER TABLE "public"."question_bank_items" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."question_bank_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."question_banks" (
    "id" bigint NOT NULL,
    "uuid" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "subject_id" bigint NOT NULL,
    "is_premium" boolean DEFAULT false NOT NULL,
    "is_published" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "slug" "text",
    "unlock_type" "text" DEFAULT 'free'::"text",
    "price" numeric(10,2) DEFAULT 0,
    CONSTRAINT "question_banks_unlock_type_check" CHECK (("unlock_type" = ANY (ARRAY['free'::"text", 'premium'::"text", 'referral'::"text"])))
);


ALTER TABLE "public"."question_banks" OWNER TO "postgres";


ALTER TABLE "public"."question_banks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."question_banks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."question_feedback" (
    "id" integer NOT NULL,
    "question_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL,
    "feedback_type" "text" NOT NULL,
    "comment" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "question_feedback_feedback_type_check" CHECK (("feedback_type" = ANY (ARRAY['error'::"text", 'too_hard'::"text", 'duplicate'::"text"]))),
    CONSTRAINT "question_feedback_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'reviewed'::"text", 'fixed'::"text", 'dismissed'::"text"])))
);


ALTER TABLE "public"."question_feedback" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."question_feedback_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."question_feedback_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."question_feedback_id_seq" OWNED BY "public"."question_feedback"."id";



CREATE TABLE IF NOT EXISTS "public"."questions" (
    "id" integer NOT NULL,
    "subject_id" integer,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "type" "text" NOT NULL,
    "difficulty" "text" NOT NULL,
    "options" "jsonb",
    "answer" "text" NOT NULL,
    "explanation" "text",
    "code_snippet" "text",
    "topic_id" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "tags" json,
    CONSTRAINT "questions_difficulty_check" CHECK (("difficulty" = ANY (ARRAY['easy'::"text", 'medium'::"text", 'hard'::"text"]))),
    CONSTRAINT "questions_type_check" CHECK (("type" = ANY (ARRAY['single_choice'::"text", 'multiple_choice'::"text", 'fill_blank'::"text", 'code_output'::"text", 'handwrite'::"text"])))
);


ALTER TABLE "public"."questions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."questions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."questions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."questions_id_seq" OWNED BY "public"."questions"."id";



CREATE TABLE IF NOT EXISTS "public"."referral_codes" (
    "id" bigint NOT NULL,
    "code" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."referral_codes" OWNER TO "postgres";


ALTER TABLE "public"."referral_codes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."referral_codes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."referrals" (
    "id" bigint NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "referee_id" "uuid" NOT NULL,
    "referral_code" "text" NOT NULL,
    "used_for_unlock" boolean DEFAULT false NOT NULL,
    "unlocked_bank_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."referrals" OWNER TO "postgres";


ALTER TABLE "public"."referrals" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."referrals_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."shared_mistakes" (
    "id" integer NOT NULL,
    "share_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "mistake_ids" integer[] NOT NULL,
    "title" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."shared_mistakes" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."shared_mistakes_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."shared_mistakes_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."shared_mistakes_id_seq" OWNED BY "public"."shared_mistakes"."id";



CREATE TABLE IF NOT EXISTS "public"."subjects" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "category" "text",
    "question_count" integer DEFAULT 0,
    "is_hot" boolean DEFAULT false,
    "is_new" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "slug" character varying(255),
    CONSTRAINT "subjects_category_check" CHECK (("category" = ANY (ARRAY['STEM'::"text", 'Humanities'::"text"])))
);


ALTER TABLE "public"."subjects" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."subjects_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."subjects_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."subjects_id_seq" OWNED BY "public"."subjects"."id";



CREATE TABLE IF NOT EXISTS "public"."topic_progress" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "topic_id" integer,
    "completed_count" integer DEFAULT 0,
    "correct_count" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."topic_progress" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."topic_progress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."topic_progress_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."topic_progress_id_seq" OWNED BY "public"."topic_progress"."id";



CREATE TABLE IF NOT EXISTS "public"."topics" (
    "id" integer NOT NULL,
    "subject_id" integer,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "uuid" "uuid" DEFAULT "extensions"."uuid_generate_v4"(),
    "slug" character varying(255)
);


ALTER TABLE "public"."topics" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."topics_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."topics_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."topics_id_seq" OWNED BY "public"."topics"."id";



CREATE TABLE IF NOT EXISTS "public"."user_answers" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "question_id" integer,
    "user_answer" "text",
    "is_correct" boolean DEFAULT false NOT NULL,
    "time_spent" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "mode" "text" DEFAULT 'practice'::"text",
    CONSTRAINT "user_answers_mode_check" CHECK (("mode" = ANY (ARRAY['practice'::"text", 'flashcard'::"text", 'immersive'::"text", 'exam'::"text"])))
);


ALTER TABLE "public"."user_answers" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_answers_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_answers_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_answers_id_seq" OWNED BY "public"."user_answers"."id";



CREATE TABLE IF NOT EXISTS "public"."user_bank_unlocks" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bank_id" bigint NOT NULL,
    "unlock_type" "text" NOT NULL,
    "referral_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_bank_unlocks_unlock_type_check" CHECK (("unlock_type" = ANY (ARRAY['referral'::"text", 'purchase'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."user_bank_unlocks" OWNER TO "postgres";


ALTER TABLE "public"."user_bank_unlocks" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_bank_unlocks_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_progress" (
    "id" integer NOT NULL,
    "user_id" "uuid",
    "subject_id" integer,
    "completed_count" integer DEFAULT 0,
    "correct_count" integer DEFAULT 0,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_wrong_answer" "text"
);


ALTER TABLE "public"."user_progress" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."user_progress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."user_progress_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."user_progress_id_seq" OWNED BY "public"."user_progress"."id";



CREATE TABLE IF NOT EXISTS "public"."user_question_bank_collections" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bank_id" bigint NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completion_count" integer DEFAULT 0 NOT NULL,
    "last_completed_at" timestamp with time zone
);


ALTER TABLE "public"."user_question_bank_collections" OWNER TO "postgres";


ALTER TABLE "public"."user_question_bank_collections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_question_bank_collections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_exam_collections" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "exam_id" integer NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completion_count" integer DEFAULT 0 NOT NULL,
    "best_score" integer,
    "best_time_seconds" integer,
    "last_attempted_at" timestamp with time zone
);


ALTER TABLE "public"."user_exam_collections" OWNER TO "postgres";


ALTER TABLE "public"."user_exam_collections" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_exam_collections_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


ALTER TABLE ONLY "public"."bookmarks" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."bookmarks_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exam_attempts" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."exam_attempts_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exam_questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."exam_questions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."exams" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."exams_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."mistakes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mistakes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."payments" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."payments_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."question_feedback" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."question_feedback_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."questions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."questions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."shared_mistakes" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."shared_mistakes_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."subjects" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."subjects_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."topic_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."topic_progress_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."topics" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."topics_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_answers" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_answers_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."user_progress" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."user_progress_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_attempts"
    ADD CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_uuid_key" UNIQUE ("uuid");



ALTER TABLE ONLY "public"."flashcard_reviews"
    ADD CONSTRAINT "flashcard_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flashcard_reviews"
    ADD CONSTRAINT "flashcard_reviews_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."mistakes"
    ADD CONSTRAINT "mistakes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mistakes"
    ADD CONSTRAINT "mistakes_user_id_question_id_key" UNIQUE ("user_id", "question_id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_stripe_session_id_key" UNIQUE ("stripe_session_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_bank_items"
    ADD CONSTRAINT "question_bank_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_banks"
    ADD CONSTRAINT "question_banks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."question_banks"
    ADD CONSTRAINT "question_banks_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."question_feedback"
    ADD CONSTRAINT "question_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referee_id_key" UNIQUE ("referee_id");



ALTER TABLE ONLY "public"."shared_mistakes"
    ADD CONSTRAINT "shared_mistakes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_mistakes"
    ADD CONSTRAINT "shared_mistakes_share_id_key" UNIQUE ("share_id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."subjects"
    ADD CONSTRAINT "subjects_uuid_key" UNIQUE ("uuid");



ALTER TABLE ONLY "public"."topic_progress"
    ADD CONSTRAINT "topic_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topic_progress"
    ADD CONSTRAINT "topic_progress_user_id_topic_id_key" UNIQUE ("user_id", "topic_id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_uuid_key" UNIQUE ("uuid");



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_bank_unlocks"
    ADD CONSTRAINT "user_bank_unlocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_bank_unlocks"
    ADD CONSTRAINT "user_bank_unlocks_user_id_bank_id_key" UNIQUE ("user_id", "bank_id");



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_question_bank_collections"
    ADD CONSTRAINT "user_question_bank_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_question_bank_collections"
    ADD CONSTRAINT "user_question_bank_collections_user_bank_unique" UNIQUE ("user_id", "bank_id");



ALTER TABLE ONLY "public"."user_exam_collections"
    ADD CONSTRAINT "user_exam_collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_exam_collections"
    ADD CONSTRAINT "user_exam_collections_user_exam_unique" UNIQUE ("user_id", "exam_id");



CREATE INDEX "idx_payments_stripe_session_id" ON "public"."payments" USING "btree" ("stripe_session_id");



CREATE INDEX "idx_payments_user_id" ON "public"."payments" USING "btree" ("user_id");



CREATE INDEX "idx_question_bank_items_bank_id" ON "public"."question_bank_items" USING "btree" ("bank_id");



CREATE INDEX "idx_question_bank_items_question_id" ON "public"."question_bank_items" USING "btree" ("question_id");



CREATE INDEX "idx_question_banks_subject_id" ON "public"."question_banks" USING "btree" ("subject_id");



CREATE INDEX "idx_referral_codes_code" ON "public"."referral_codes" USING "btree" ("code");



CREATE INDEX "idx_referral_codes_user_id" ON "public"."referral_codes" USING "btree" ("user_id");



CREATE INDEX "idx_referrals_referee_id" ON "public"."referrals" USING "btree" ("referee_id");



CREATE INDEX "idx_referrals_referrer_id" ON "public"."referrals" USING "btree" ("referrer_id");



CREATE INDEX "idx_user_bank_unlocks_bank_id" ON "public"."user_bank_unlocks" USING "btree" ("bank_id");



CREATE INDEX "idx_user_bank_unlocks_user_id" ON "public"."user_bank_unlocks" USING "btree" ("user_id");



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bookmarks"
    ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_attempts"
    ADD CONSTRAINT "exam_attempts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_attempts"
    ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exam_questions"
    ADD CONSTRAINT "exam_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."exams"
    ADD CONSTRAINT "exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flashcard_reviews"
    ADD CONSTRAINT "flashcard_reviews_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id");



ALTER TABLE ONLY "public"."flashcard_reviews"
    ADD CONSTRAINT "flashcard_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mistakes"
    ADD CONSTRAINT "mistakes_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mistakes"
    ADD CONSTRAINT "mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_bank_items"
    ADD CONSTRAINT "question_bank_items_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_bank_items"
    ADD CONSTRAINT "question_bank_items_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_banks"
    ADD CONSTRAINT "question_banks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_feedback"
    ADD CONSTRAINT "question_feedback_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."question_feedback"
    ADD CONSTRAINT "question_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."questions"
    ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."referral_codes"
    ADD CONSTRAINT "referral_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referee_id_fkey" FOREIGN KEY ("referee_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."referrals"
    ADD CONSTRAINT "referrals_unlocked_bank_id_fkey" FOREIGN KEY ("unlocked_bank_id") REFERENCES "public"."question_banks"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."shared_mistakes"
    ADD CONSTRAINT "shared_mistakes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."topic_progress"
    ADD CONSTRAINT "topic_progress_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topic_progress"
    ADD CONSTRAINT "topic_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."topics"
    ADD CONSTRAINT "topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_answers"
    ADD CONSTRAINT "user_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_bank_unlocks"
    ADD CONSTRAINT "user_bank_unlocks_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_bank_unlocks"
    ADD CONSTRAINT "user_bank_unlocks_referral_id_fkey" FOREIGN KEY ("referral_id") REFERENCES "public"."referrals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_bank_unlocks"
    ADD CONSTRAINT "user_bank_unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_progress"
    ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_question_bank_collections"
    ADD CONSTRAINT "user_question_bank_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_question_bank_collections"
    ADD CONSTRAINT "user_question_bank_collections_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_exam_collections"
    ADD CONSTRAINT "user_exam_collections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_exam_collections"
    ADD CONSTRAINT "user_exam_collections_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can manage exam questions" ON "public"."exam_questions" TO "authenticated" WITH CHECK (true);



CREATE POLICY "Admins can manage exams" ON "public"."exams" TO "authenticated" WITH CHECK (true);



CREATE POLICY "Anyone can look up referral codes" ON "public"."referral_codes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view exam questions for published exams" ON "public"."exam_questions" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."exams"
  WHERE (("exams"."id" = "exam_questions"."exam_id") AND ("exams"."is_published" = true)))));



CREATE POLICY "Anyone can view profiles" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view published exams" ON "public"."exams" FOR SELECT TO "authenticated" USING (("is_published" = true));



CREATE POLICY "Anyone can view questions" ON "public"."questions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view subjects" ON "public"."subjects" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can view topics" ON "public"."topics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can delete banks" ON "public"."question_banks" FOR DELETE TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert banks" ON "public"."question_banks" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can insert questions" ON "public"."questions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Authenticated users can manage items" ON "public"."question_bank_items" TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can select all banks" ON "public"."question_banks" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update banks" ON "public"."question_banks" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Items are viewable if bank is published" ON "public"."question_bank_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."question_banks"
  WHERE (("question_banks"."id" = "question_bank_items"."bank_id") AND ("question_banks"."is_published" = true)))));



CREATE POLICY "Published banks are viewable by everyone" ON "public"."question_banks" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Service role can manage payments" ON "public"."payments" TO "authenticated" WITH CHECK (true);



CREATE POLICY "System can insert referrals" ON "public"."referrals" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can manage unlocks" ON "public"."user_bank_unlocks" USING (true);



CREATE POLICY "Users can create their own referral code" ON "public"."referral_codes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own flashcard reviews" ON "public"."flashcard_reviews" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own flashcard reviews" ON "public"."flashcard_reviews" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view and insert their own answers" ON "public"."user_answers" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and manage their own bookmarks" ON "public"."bookmarks" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and manage their own exam attempts" ON "public"."exam_attempts" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and update their own mistakes" ON "public"."mistakes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and update their own progress" ON "public"."user_progress" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view and update their own topic progress" ON "public"."topic_progress" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own question bank collections" ON "public"."user_question_bank_collections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own exam collections" ON "public"."user_exam_collections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view referrals they sent or received" ON "public"."referrals" FOR SELECT USING ((("auth"."uid"() = "referrer_id") OR ("auth"."uid"() = "referee_id")));



CREATE POLICY "Users can view their own flashcard reviews" ON "public"."flashcard_reviews" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own payments" ON "public"."payments" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own referral code" ON "public"."referral_codes" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own unlocks" ON "public"."user_bank_unlocks" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exam_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flashcard_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mistakes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_bank_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_banks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."question_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referral_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."referrals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shared_mistakes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subjects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topic_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."topics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_answers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_bank_unlocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_progress" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."user_question_bank_collections" ENABLE ROW LEVEL SECURITY;



ALTER TABLE "public"."user_exam_collections" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."profiles";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_referral"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_referral"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_referral"() TO "service_role";


















GRANT ALL ON TABLE "public"."bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."bookmarks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."bookmarks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exam_attempts" TO "anon";
GRANT ALL ON TABLE "public"."exam_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_attempts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exam_attempts_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exam_attempts_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exam_attempts_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exam_questions" TO "anon";
GRANT ALL ON TABLE "public"."exam_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."exam_questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exam_questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exam_questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exam_questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."exams" TO "anon";
GRANT ALL ON TABLE "public"."exams" TO "authenticated";
GRANT ALL ON TABLE "public"."exams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."exams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."flashcard_reviews" TO "anon";
GRANT ALL ON TABLE "public"."flashcard_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."flashcard_reviews" TO "service_role";



GRANT ALL ON SEQUENCE "public"."flashcard_reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."flashcard_reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."flashcard_reviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."mistakes" TO "anon";
GRANT ALL ON TABLE "public"."mistakes" TO "authenticated";
GRANT ALL ON TABLE "public"."mistakes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."mistakes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."mistakes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."mistakes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payments_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."question_bank_items" TO "anon";
GRANT ALL ON TABLE "public"."question_bank_items" TO "authenticated";
GRANT ALL ON TABLE "public"."question_bank_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_bank_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_bank_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_bank_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."question_banks" TO "anon";
GRANT ALL ON TABLE "public"."question_banks" TO "authenticated";
GRANT ALL ON TABLE "public"."question_banks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_banks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_banks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_banks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."question_feedback" TO "anon";
GRANT ALL ON TABLE "public"."question_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."question_feedback" TO "service_role";



GRANT ALL ON SEQUENCE "public"."question_feedback_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."question_feedback_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."question_feedback_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."questions" TO "anon";
GRANT ALL ON TABLE "public"."questions" TO "authenticated";
GRANT ALL ON TABLE "public"."questions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."questions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."referral_codes" TO "anon";
GRANT ALL ON TABLE "public"."referral_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."referral_codes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."referral_codes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."referral_codes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."referral_codes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."referrals" TO "anon";
GRANT ALL ON TABLE "public"."referrals" TO "authenticated";
GRANT ALL ON TABLE "public"."referrals" TO "service_role";



GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."referrals_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_mistakes" TO "anon";
GRANT ALL ON TABLE "public"."shared_mistakes" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_mistakes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."shared_mistakes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."shared_mistakes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."shared_mistakes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."subjects" TO "anon";
GRANT ALL ON TABLE "public"."subjects" TO "authenticated";
GRANT ALL ON TABLE "public"."subjects" TO "service_role";



GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."subjects_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."topic_progress" TO "anon";
GRANT ALL ON TABLE "public"."topic_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."topic_progress" TO "service_role";



GRANT ALL ON SEQUENCE "public"."topic_progress_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."topic_progress_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."topic_progress_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."topics" TO "anon";
GRANT ALL ON TABLE "public"."topics" TO "authenticated";
GRANT ALL ON TABLE "public"."topics" TO "service_role";



GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."topics_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_answers" TO "anon";
GRANT ALL ON TABLE "public"."user_answers" TO "authenticated";
GRANT ALL ON TABLE "public"."user_answers" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_answers_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_answers_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_answers_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_bank_unlocks" TO "anon";
GRANT ALL ON TABLE "public"."user_bank_unlocks" TO "authenticated";
GRANT ALL ON TABLE "public"."user_bank_unlocks" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_bank_unlocks_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_bank_unlocks_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_bank_unlocks_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_progress" TO "anon";
GRANT ALL ON TABLE "public"."user_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."user_progress" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_progress_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_progress_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_progress_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_question_bank_collections" TO "anon";
GRANT ALL ON TABLE "public"."user_question_bank_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_question_bank_collections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_question_bank_collections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_question_bank_collections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_question_bank_collections_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."user_exam_collections" TO "anon";
GRANT ALL ON TABLE "public"."user_exam_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."user_exam_collections" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_exam_collections_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."user_exam_collections_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."user_exam_collections_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































