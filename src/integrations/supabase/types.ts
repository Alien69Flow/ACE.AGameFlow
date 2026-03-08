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
      clan_members: {
        Row: {
          clan_id: string
          id: string
          joined_at: string
          profile_id: string
          role: string
        }
        Insert: {
          clan_id: string
          id?: string
          joined_at?: string
          profile_id: string
          role?: string
        }
        Update: {
          clan_id?: string
          id?: string
          joined_at?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "clan_members_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clan_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clans: {
        Row: {
          created_at: string
          created_by: string
          id: string
          member_count: number
          name: string
          total_energy: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          member_count?: number
          name: string
          total_energy?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          member_count?: number
          name?: string
          total_energy?: number
        }
        Relationships: [
          {
            foreignKeyName: "clans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_combos: {
        Row: {
          claimed_by: Json
          combo: string[]
          date: string
        }
        Insert: {
          claimed_by?: Json
          combo: string[]
          date?: string
        }
        Update: {
          claimed_by?: Json
          combo?: string[]
          date?: string
        }
        Relationships: []
      }
      missions_completed: {
        Row: {
          claimed: boolean
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          profile_id: string
          started_at: string | null
        }
        Insert: {
          claimed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          profile_id: string
          started_at?: string | null
        }
        Update: {
          claimed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          profile_id?: string
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_completed_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clan_id: string | null
          created_at: string
          daily_streak: number
          energy: number
          id: string
          last_daily_claim: string | null
          last_seen_at: string
          last_stamina_update: string
          max_stamina: number
          max_stamina_level: number
          multiplier: number
          multiplier_expires_at: string | null
          passive_income_level: number
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          regen_speed_level: number
          stamina: number
          tap_power_level: number
          telegram_id: string
          tutorial_completed: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          clan_id?: string | null
          created_at?: string
          daily_streak?: number
          energy?: number
          id?: string
          last_daily_claim?: string | null
          last_seen_at?: string
          last_stamina_update?: string
          max_stamina?: number
          max_stamina_level?: number
          multiplier?: number
          multiplier_expires_at?: string | null
          passive_income_level?: number
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          regen_speed_level?: number
          stamina?: number
          tap_power_level?: number
          telegram_id: string
          tutorial_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          clan_id?: string | null
          created_at?: string
          daily_streak?: number
          energy?: number
          id?: string
          last_daily_claim?: string | null
          last_seen_at?: string
          last_stamina_update?: string
          max_stamina?: number
          max_stamina_level?: number
          multiplier?: number
          multiplier_expires_at?: string | null
          passive_income_level?: number
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          regen_speed_level?: number
          stamina?: number
          tap_power_level?: number
          telegram_id?: string
          tutorial_completed?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clan_id_fkey"
            columns: ["clan_id"]
            isOneToOne: false
            referencedRelation: "clans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      upgrades: {
        Row: {
          id: string
          level: number
          profile_id: string
          purchased_at: string
          upgrade_type: string
        }
        Insert: {
          id?: string
          level?: number
          profile_id: string
          purchased_at?: string
          upgrade_type: string
        }
        Update: {
          id?: string
          level?: number
          profile_id?: string
          purchased_at?: string
          upgrade_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "upgrades_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
