export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          price: number
          generation_limit: number
          customer_page_limit: number | null
          storage_days: number
          features: Json
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          generation_limit: number
          customer_page_limit?: number | null
          storage_days: number
          features?: Json
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          generation_limit?: number
          customer_page_limit?: number | null
          storage_days?: number
          features?: Json
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          generation_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start: string
          current_period_end: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          generation_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          current_period_start?: string
          current_period_end?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          generation_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          user_id: string
          title: string
          customer_name: string | null
          address: string | null
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          customer_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          customer_name?: string | null
          address?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          customer_id: string
          user_id: string
          image_type: 'original' | 'generated' | 'side'
          url: string
          storage_path: string | null
          mime_type: string | null
          size_bytes: number | null
          width: number | null
          height: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          user_id: string
          image_type: 'original' | 'generated' | 'side'
          url: string
          storage_path?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          width?: number | null
          height?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          user_id?: string
          image_type?: 'original' | 'generated' | 'side'
          url?: string
          storage_path?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          width?: number | null
          height?: number | null
          metadata?: Json
          created_at?: string
        }
      }
      generation_history: {
        Row: {
          id: string
          customer_id: string
          user_id: string
          original_image_id: string | null
          generated_image_id: string | null
          side_image_id: string | null
          wall_color: string | null
          wall_color_code: string | null
          roof_color: string | null
          roof_color_code: string | null
          door_color: string | null
          door_color_code: string | null
          weather: string | null
          layout_side_by_side: boolean
          background_color: string | null
          other_instructions: string | null
          prompt: string
          gemini_model: string
          gemini_response: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          processing_time_ms: number | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          customer_id: string
          user_id: string
          original_image_id?: string | null
          generated_image_id?: string | null
          side_image_id?: string | null
          wall_color?: string | null
          wall_color_code?: string | null
          roof_color?: string | null
          roof_color_code?: string | null
          door_color?: string | null
          door_color_code?: string | null
          weather?: string | null
          layout_side_by_side?: boolean
          background_color?: string | null
          other_instructions?: string | null
          prompt: string
          gemini_model?: string
          gemini_response?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string
          user_id?: string
          original_image_id?: string | null
          generated_image_id?: string | null
          side_image_id?: string | null
          wall_color?: string | null
          wall_color_code?: string | null
          roof_color?: string | null
          roof_color_code?: string | null
          door_color?: string | null
          door_color_code?: string | null
          weather?: string | null
          layout_side_by_side?: boolean
          background_color?: string | null
          other_instructions?: string | null
          prompt?: string
          gemini_model?: string
          gemini_response?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}