export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_config: {
        Row: {
          api_key: string | null
          created_at: string | null
          display_name: string
          id: string
          image_points_per_image: number
          input_points_per_1k_tokens: number
          is_active: boolean
          model_name: string
          output_points_per_1k_tokens: number
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          image_points_per_image?: number
          input_points_per_1k_tokens?: number
          is_active?: boolean
          model_name: string
          output_points_per_1k_tokens?: number
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          display_name?: string
          id?: string
          image_points_per_image?: number
          input_points_per_1k_tokens?: number
          is_active?: boolean
          model_name?: string
          output_points_per_1k_tokens?: number
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          completion_tokens: number
          created_at: string | null
          id: string
          image_count: number
          model_name: string
          points_cost: number
          prompt_tokens: number
          user_id: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string | null
          id?: string
          image_count?: number
          model_name: string
          points_cost?: number
          prompt_tokens?: number
          user_id: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string | null
          id?: string
          image_count?: number
          model_name?: string
          points_cost?: number
          prompt_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      generation_records: {
        Row: {
          carousel_images: Json | null
          carousel_plan: Json | null
          created_at: string | null
          description: string | null
          id: string
          keywords: string | null
          language: string | null
          main_image: string | null
          market: string | null
          product_description: string
          product_name: string
          selling_points: Json | null
          title: string | null
          user_id: string
        }
        Insert: {
          carousel_images?: Json | null
          carousel_plan?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string | null
          language?: string | null
          main_image?: string | null
          market?: string | null
          product_description: string
          product_name: string
          selling_points?: Json | null
          title?: string | null
          user_id: string
        }
        Update: {
          carousel_images?: Json | null
          carousel_plan?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          keywords?: string | null
          language?: string | null
          main_image?: string | null
          market?: string | null
          product_description?: string
          product_name?: string
          selling_points?: Json | null
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          device_type: string
          id: string
          ip_address: string | null
          page_path: string
          user_agent: string | null
          visit_date: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string
          id?: string
          ip_address?: string | null
          page_path: string
          user_agent?: string | null
          visit_date?: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          ip_address?: string | null
          page_path?: string
          user_agent?: string | null
          visit_date?: string
          visitor_id?: string
        }
        Relationships: []
      }
      points_adjustments: {
        Row: {
          adjusted_by: string
          amount: number
          created_at: string | null
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          adjusted_by: string
          amount: number
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          adjusted_by?: string
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          last_sign_in_at: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          last_sign_in_at?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          last_sign_in_at?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          created_at: string | null
          id: string
          model: string
          template_content: string
          template_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          model?: string
          template_content: string
          template_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          model?: string
          template_content?: string
          template_name?: string
        }
        Relationships: []
      }
      recharge_records: {
        Row: {
          amount: number
          created_at: string
          id: string
          out_trade_no: string | null
          package_id: string | null
          paid_at: string | null
          points: number
          status: string
          trade_no: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          out_trade_no?: string | null
          package_id?: string | null
          paid_at?: string | null
          points: number
          status?: string
          trade_no?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          out_trade_no?: string | null
          package_id?: string | null
          paid_at?: string | null
          points?: number
          status?: string
          trade_no?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          id: string
          remaining_points: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          remaining_points?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          remaining_points?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
