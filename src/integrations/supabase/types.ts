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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: []
      }
      anonymized_profiles: {
        Row: {
          alias: string
          allocation_ranges: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          liquidity_profile: Json | null
          risk_concentration: Json | null
          share_code: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alias: string
          allocation_ranges?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          liquidity_profile?: Json | null
          risk_concentration?: Json | null
          share_code: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alias?: string
          allocation_ranges?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          liquidity_profile?: Json | null
          risk_concentration?: Json | null
          share_code?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      asset_sources: {
        Row: {
          asset_id: string
          created_at: string | null
          external_id: string | null
          id: string
          last_synced_at: string | null
          source_name: string | null
          source_type: string
          sync_status: string | null
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          source_name?: string | null
          source_type: string
          sync_status?: string | null
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          external_id?: string | null
          id?: string
          last_synced_at?: string | null
          source_name?: string | null
          source_type?: string
          sync_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_sources_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_valuations: {
        Row: {
          asset_id: string
          created_at: string | null
          id: string
          source: string | null
          valuation_date: string
          value: number
        }
        Insert: {
          asset_id: string
          created_at?: string | null
          id?: string
          source?: string | null
          valuation_date: string
          value: number
        }
        Update: {
          asset_id?: string
          created_at?: string | null
          id?: string
          source?: string | null
          valuation_date?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_valuations_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          acquisition_date: string | null
          cost_basis: number | null
          created_at: string | null
          currency: string | null
          value: number
          id: string
          metadata: Json | null
          name: string
          notes: string | null
          quantity: number | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acquisition_date?: string | null
          cost_basis?: number | null
          created_at?: string | null
          currency?: string | null
          current_value?: number
          id?: string
          liquidity_score?: number | null
          metadata?: Json | null
          name: string
          notes?: string | null
          quantity?: number | null
          ticker?: string | null
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acquisition_date?: string | null
          cost_basis?: number | null
          created_at?: string | null
          currency?: string | null
          current_value?: number
          id?: string
          liquidity_score?: number | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          quantity?: number | null
          ticker?: string | null
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comparisons: {
        Row: {
          anonymized_profile_id: string
          comparison_type: string | null
          created_at: string | null
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          anonymized_profile_id: string
          comparison_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          anonymized_profile_id?: string
          comparison_type?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comparisons_anonymized_profile_id_fkey"
            columns: ["anonymized_profile_id"]
            isOneToOne: false
            referencedRelation: "anonymized_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_analyses: {
        Row: {
          ai_model: string | null
          analyzed_at: string | null
          created_at: string | null
          deal_id: string
          diversification_impact: string | null
          fit_score: number | null
          id: string
          narrative: string | null
          risk_flags: string[] | null
          suggested_sizing: string | null
        }
        Insert: {
          ai_model?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          deal_id: string
          diversification_impact?: string | null
          fit_score?: number | null
          id?: string
          narrative?: string | null
          risk_flags?: string[] | null
          suggested_sizing?: string | null
        }
        Update: {
          ai_model?: string | null
          analyzed_at?: string | null
          created_at?: string | null
          deal_id?: string
          diversification_impact?: string | null
          fit_score?: number | null
          id?: string
          narrative?: string | null
          risk_flags?: string[] | null
          suggested_sizing?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deal_analyses_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number | null
          created_at: string | null
          description: string | null
          external_links: string[] | null
          horizon_months: number | null
          id: string
          liquidity_expectation: string | null
          name: string
          risk_level: string | null
          status: Database["public"]["Enums"]["deal_status"] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          external_links?: string[] | null
          horizon_months?: number | null
          id?: string
          liquidity_expectation?: string | null
          name: string
          risk_level?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          description?: string | null
          external_links?: string[] | null
          horizon_months?: number | null
          id?: string
          liquidity_expectation?: string | null
          name?: string
          risk_level?: string | null
          status?: Database["public"]["Enums"]["deal_status"] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          status: string | null
          template_type:
            | Database["public"]["Enums"]["email_template_type"]
            | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_type?:
            | Database["public"]["Enums"]["email_template_type"]
            | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          status?: string | null
          template_type?:
            | Database["public"]["Enums"]["email_template_type"]
            | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string | null
          delay_minutes: number | null
          id: string
          is_enabled: boolean | null
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          updated_at: string | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          subject: string
          template_type: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          is_enabled?: boolean | null
          subject?: string
          template_type?: Database["public"]["Enums"]["email_template_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      liabilities: {
        Row: {
          created_at: string | null
          currency: string | null
          current_balance: number
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          name: string
          notes: string | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          current_balance?: number
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name: string
          notes?: string | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          current_balance?: number
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "user" | "admin" | "super_admin"
      asset_type:
        | "cash"
        | "real_estate"
        | "jewelry"
        | "vehicle"
        | "art_collectible"
      deal_status: "draft" | "analyzing" | "analyzed" | "archived"
      email_template_type:
        | "email_confirmation"
        | "welcome"
        | "password_reset"
        | "onboarding_reminder"
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
      app_role: ["user", "admin", "super_admin"],
      asset_type: [
        "cash",
        "public_equity",
        "private_shares",
        "fund",
        "real_estate",
        "crypto",
        "vehicle",
        "art_collectible",
        "manual",
      ],
      deal_status: ["draft", "analyzing", "analyzed", "archived"],
      email_template_type: [
        "email_confirmation",
        "welcome",
        "password_reset",
        "onboarding_reminder",
      ],
    },
  },
} as const
