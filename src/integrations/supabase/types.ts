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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      checklists: {
        Row: {
          completion_percentage: number | null
          completion_time: string | null
          created_at: string | null
          date: string
          flagged_issues_count: number | null
          id: string
          module1_data: Json | null
          module2_data: Json | null
          module3_data: Json | null
          module4_data: Json | null
          problem_count: number | null
          problem_fields: Json | null
          shift: string | null
          start_time: string | null
          status: string | null
          submitted: boolean | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completion_percentage?: number | null
          completion_time?: string | null
          created_at?: string | null
          date?: string
          flagged_issues_count?: number | null
          id?: string
          module1_data?: Json | null
          module2_data?: Json | null
          module3_data?: Json | null
          module4_data?: Json | null
          problem_count?: number | null
          problem_fields?: Json | null
          shift?: string | null
          start_time?: string | null
          status?: string | null
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completion_percentage?: number | null
          completion_time?: string | null
          created_at?: string | null
          date?: string
          flagged_issues_count?: number | null
          id?: string
          module1_data?: Json | null
          module2_data?: Json | null
          module3_data?: Json | null
          module4_data?: Json | null
          problem_count?: number | null
          problem_fields?: Json | null
          shift?: string | null
          start_time?: string | null
          status?: string | null
          submitted?: boolean | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      flagged_issues: {
        Row: {
          assigned_to: string | null
          checklist_id: string | null
          created_at: string | null
          description: string
          id: string
          issue_code: string
          item: string
          module: string
          reported_at: string | null
          resolution_notes: string | null
          resolved_at: string | null
          section: string
          severity: string
          status: string | null
          transformer_log_id: string | null
          unit: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          checklist_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          issue_code: string
          item: string
          module: string
          reported_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          section: string
          severity: string
          status?: string | null
          transformer_log_id?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          checklist_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          issue_code?: string
          item?: string
          module?: string
          reported_at?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          section?: string
          severity?: string
          status?: string | null
          transformer_log_id?: string | null
          unit?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flagged_issues_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_issues_transformer_log_id_fkey"
            columns: ["transformer_log_id"]
            isOneToOne: false
            referencedRelation: "transformer_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flagged_issues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interval_reminders: {
        Row: {
          created_at: string | null
          description: string
          id: string
          last_completed: string | null
          next_due: string
          notification_sent: boolean | null
          reminder_key: string
          reminder_type: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          last_completed?: string | null
          next_due: string
          notification_sent?: boolean | null
          reminder_key: string
          reminder_type: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          last_completed?: string | null
          next_due?: string
          notification_sent?: boolean | null
          reminder_key?: string
          reminder_type?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interval_reminders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          employee_id: string | null
          full_name: string
          id: string
          shift: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          full_name: string
          id: string
          shift?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          shift?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transformer_logs: {
        Row: {
          active_power: number | null
          created_at: string | null
          current_b: number | null
          current_r: number | null
          current_y: number | null
          date: string
          frequency: number | null
          hour: number
          id: string
          logged_at: string | null
          oil_temperature: number | null
          reactive_power: number | null
          remarks: string | null
          transformer_number: number
          updated_at: string | null
          user_id: string
          voltage_b: number | null
          voltage_r: number | null
          voltage_y: number | null
          winding_temperature: number | null
        }
        Insert: {
          active_power?: number | null
          created_at?: string | null
          current_b?: number | null
          current_r?: number | null
          current_y?: number | null
          date?: string
          frequency?: number | null
          hour: number
          id?: string
          logged_at?: string | null
          oil_temperature?: number | null
          reactive_power?: number | null
          remarks?: string | null
          transformer_number: number
          updated_at?: string | null
          user_id: string
          voltage_b?: number | null
          voltage_r?: number | null
          voltage_y?: number | null
          winding_temperature?: number | null
        }
        Update: {
          active_power?: number | null
          created_at?: string | null
          current_b?: number | null
          current_r?: number | null
          current_y?: number | null
          date?: string
          frequency?: number | null
          hour?: number
          id?: string
          logged_at?: string | null
          oil_temperature?: number | null
          reactive_power?: number | null
          remarks?: string | null
          transformer_number?: number
          updated_at?: string | null
          user_id?: string
          voltage_b?: number | null
          voltage_r?: number | null
          voltage_y?: number | null
          winding_temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transformer_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
      assign_admin_role: {
        Args: { _user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "supervisor"
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
      app_role: ["admin", "operator", "supervisor"],
    },
  },
} as const
