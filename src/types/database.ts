export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          level: number;
          streak_days: number;
          last_practice_date: string | null;
          is_vip: boolean;
          vip_expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          level?: number;
          streak_days?: number;
          last_practice_date?: string | null;
          is_vip?: boolean;
          vip_expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          level?: number;
          streak_days?: number;
          last_practice_date?: string | null;
          is_vip?: boolean;
          vip_expires_at?: string | null;
          created_at?: string;
        };
      };
      topics: {
        Row: {
          id: number;
          uuid: string;
          slug: string;
          subject_id: number;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          uuid?: string;
          slug?: string;
          subject_id: number;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          uuid?: string;
          slug?: string;
          subject_id?: number;
          name?: string;
          created_at?: string;
        };
      };
      subjects: {
        Row: {
          id: number;
          uuid: string;
          slug: string;
          name: string;
          description: string | null;
          icon: string | null;
          category: string | null;
          question_count: number;
          is_hot: boolean;
          is_new: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          uuid?: string;
          slug?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          category?: string | null;
          question_count?: number;
          is_hot?: boolean;
          is_new?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          uuid?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          category?: string | null;
          question_count?: number;
          is_hot?: boolean;
          is_new?: boolean;
          created_at?: string;
        };
      };
      questions: {
        Row: {
          id: number;
          subject_id: number;
          title: string;
          content: string;
          type:
            | "single_choice"
            | "multiple_choice"
            | "fill_blank"
            | "code_output"
            | "handwrite"
            | "true_false";
          difficulty: "easy" | "medium" | "hard";
          options: Json | null;
          answer: string;
          explanation: string | null;
          code_snippet: string | null;
          topic_id: number | null;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          subject_id: number;
          title: string;
          content: string;
          type:
            | "single_choice"
            | "multiple_choice"
            | "fill_blank"
            | "code_output"
            | "handwrite"
            | "true_false";
          difficulty: "easy" | "medium" | "hard";
          options?: Json | null;
          answer: string;
          explanation?: string | null;
          code_snippet?: string | null;
          topic_id?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };

        Update: {
          id?: number;
          subject_id?: number;
          title?: string;
          content?: string;
          type?:
            | "single_choice"
            | "multiple_choice"
            | "fill_blank"
            | "code_output"
            | "handwrite"
            | "true_false";
          difficulty?: "easy" | "medium" | "hard";
          options?: Json | null;
          answer?: string;
          explanation?: string | null;
          code_snippet?: string | null;
          topic_id?: number | null;
          tags?: string[] | null;
          created_at?: string;
        };
      };

      user_answers: {
        Row: {
          id: number;
          user_id: string;
          question_id: number;
          user_answer: string | null;
          is_correct: boolean;
          time_spent: number | null;
          mode: "practice" | "flashcard" | "immersive" | "exam";
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: number;
          user_answer?: string | null;
          is_correct: boolean;
          time_spent?: number | null;
          mode?: "practice" | "flashcard" | "immersive" | "exam";
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          question_id?: number;
          user_answer?: string | null;
          is_correct?: boolean;
          time_spent?: number | null;
          mode?: "practice" | "flashcard" | "immersive" | "exam";
          created_at?: string;
        };
      };
      mistakes: {
        Row: {
          id: number;
          user_id: string;
          question_id: number;
          error_count: number;
          error_type: string | null;
          last_error_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: number;
          error_count?: number;
          error_type?: string | null;
          last_error_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          question_id?: number;
          error_count?: number;
          error_type?: string | null;
          last_error_at?: string;
          created_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: number;
          user_id: string;
          subject_id: number;
          completed_count: number;
          correct_count: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          subject_id: number;
          completed_count?: number;
          correct_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          subject_id?: number;
          completed_count?: number;
          correct_count?: number;
          updated_at?: string;
        };
      };
      topic_progress: {
        Row: {
          id: number;
          user_id: string;
          topic_id: number;
          completed_count: number;
          correct_count: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          topic_id: number;
          completed_count?: number;
          correct_count?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          topic_id?: number;
          completed_count?: number;
          correct_count?: number;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: number;
          user_id: string;
          question_id: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          question_id?: number;
          created_at?: string;
        };
      };
      exams: {
        Row: {
          id: number;
          uuid: string;
          slug: string;
          subject_id: number;
          title: string;
          exam_type: "midterm" | "final";
          duration_minutes: number;
          rules: Json;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          uuid?: string;
          slug?: string;
          subject_id: number;
          title: string;
          exam_type: "midterm" | "final";
          duration_minutes?: number;
          rules?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          uuid?: string;
          slug?: string;
          subject_id?: number;
          title?: string;
          exam_type?: "midterm" | "final";
          duration_minutes?: number;
          rules?: Json;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      exam_questions: {
        Row: {
          id: number;
          exam_id: number;
          question_id: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          exam_id: number;
          question_id: number;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          exam_id?: number;
          question_id?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      exam_attempts: {
        Row: {
          id: number;
          user_id: string;
          exam_id: number;
          started_at: string;
          finished_at: string | null;
          score: number | null;
          total_questions: number | null;
          answers: Json;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          exam_id: number;
          started_at?: string;
          finished_at?: string | null;
          score?: number | null;
          total_questions?: number | null;
          answers?: Json;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          exam_id?: number;
          started_at?: string;
          finished_at?: string | null;
          score?: number | null;
          total_questions?: number | null;
          answers?: Json;
          created_at?: string;
        };
      };
      question_feedback: {
        Row: {
          id: number;
          question_id: number;
          user_id: string;
          feedback_type: "error" | "too_hard" | "duplicate";
          comment: string | null;
          status: "pending" | "reviewed" | "fixed" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: number;
          question_id: number;
          user_id: string;
          feedback_type: "error" | "too_hard" | "duplicate";
          comment?: string | null;
          status?: "pending" | "reviewed" | "fixed" | "dismissed";
          created_at?: string;
        };
        Update: {
          id?: number;
          question_id?: number;
          user_id?: string;
          feedback_type?: "error" | "too_hard" | "duplicate";
          comment?: string | null;
          status?: "pending" | "reviewed" | "fixed" | "dismissed";
          created_at?: string;
        };
      };
      shared_mistakes: {
        Row: {
          id: number;
          share_id: string;
          user_id: string;
          mistake_ids: number[];
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          share_id: string;
          user_id: string;
          mistake_ids: number[];
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          share_id?: string;
          user_id?: string;
          mistake_ids?: number[];
          title?: string | null;
          created_at?: string;
        };
      };
      flashcard_reviews: {
        Row: {
          id: number;
          user_id: string;
          question_id: number;
          next_review_at: string;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          last_reviewed_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          question_id: number;
          next_review_at: string;
          interval_days?: number;
          ease_factor?: number;
          repetitions?: number;
          last_reviewed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          question_id?: number;
          next_review_at?: string;
          interval_days?: number;
          ease_factor?: number;
          repetitions?: number;
          last_reviewed_at?: string;
          created_at?: string;
        };
      };
      question_banks: {
        Row: {
          id: number;
          uuid: string;
          title: string;
          slug: string | null;
          description: string | null;
          subject_id: number;
          is_premium: boolean;
          is_published: boolean;
          unlock_type: "free" | "premium" | "referral" | "paid";
          price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          uuid?: string;
          title: string;
          slug?: string | null;
          description?: string | null;
          subject_id: number;
          is_premium?: boolean;
          is_published?: boolean;
          unlock_type?: "free" | "premium" | "referral" | "paid";
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          uuid?: string;
          title?: string;
          slug?: string | null;
          description?: string | null;
          subject_id?: number;
          is_premium?: boolean;
          is_published?: boolean;
          unlock_type?: "free" | "premium" | "referral" | "paid";
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      question_bank_items: {
        Row: {
          id: number;
          bank_id: number;
          question_id: number;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          bank_id: number;
          question_id: number;
          order_index: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          bank_id?: number;
          question_id?: number;
          order_index?: number;
          created_at?: string;
        };
      };
      referral_codes: {
        Row: {
          id: number;
          code: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      referrals: {
        Row: {
          id: number;
          referrer_id: string;
          referee_id: string;
          referral_code: string;
          used_for_unlock: boolean;
          unlocked_bank_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          referrer_id: string;
          referee_id: string;
          referral_code: string;
          used_for_unlock?: boolean;
          unlocked_bank_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          referrer_id?: string;
          referee_id?: string;
          referral_code?: string;
          used_for_unlock?: boolean;
          unlocked_bank_id?: number | null;
          created_at?: string;
        };
      };
      user_bank_unlocks: {
        Row: {
          id: number;
          user_id: string;
          bank_id: number;
          unlock_type: "referral" | "purchase" | "admin";
          referral_id: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          bank_id: number;
          unlock_type: "referral" | "purchase" | "admin";
          referral_id?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          bank_id?: number;
          unlock_type?: "referral" | "purchase" | "admin";
          referral_id?: number | null;
          created_at?: string;
        };
      };
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subject = Database["public"]["Tables"]["subjects"]["Row"];
export type Topic = Database["public"]["Tables"]["topics"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type UserAnswer = Database["public"]["Tables"]["user_answers"]["Row"];
export type Mistake = Database["public"]["Tables"]["mistakes"]["Row"];
export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];
export type Bookmark = Database["public"]["Tables"]["bookmarks"]["Row"];
export type Exam = Database["public"]["Tables"]["exams"]["Row"];
export type ExamQuestion =
  Database["public"]["Tables"]["exam_questions"]["Row"];
export type ExamAttempt = Database["public"]["Tables"]["exam_attempts"]["Row"];
export type QuestionFeedback =
  Database["public"]["Tables"]["question_feedback"]["Row"];
export type SharedMistakes =
  Database["public"]["Tables"]["shared_mistakes"]["Row"];
export type FlashcardReview =
  Database["public"]["Tables"]["flashcard_reviews"]["Row"];
export type QuestionBank =
  Database["public"]["Tables"]["question_banks"]["Row"];
export type QuestionBankItem =
  Database["public"]["Tables"]["question_bank_items"]["Row"];
export type ReferralCode =
  Database["public"]["Tables"]["referral_codes"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type UserBankUnlock =
  Database["public"]["Tables"]["user_bank_unlocks"]["Row"];

export interface QuestionOption {
  label: string;
  content: string;
}
