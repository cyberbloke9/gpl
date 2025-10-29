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
      activity_logs: {
        Row: {
          action_type: string
          created_at: string | null
          field_name: string | null
          id: string
          module_number: number | null
          new_value: string | null
          old_value: string | null
          record_id: string | null
          table_name: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          module_number?: number | null
          new_value?: string | null
          old_value?: string | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          field_name?: string | null
          id?: string
          module_number?: number | null
          new_value?: string | null
          old_value?: string | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          completion_percentage: number | null
          completion_time: string | null
          contributors: Json | null
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
          user_id: string | null
        }
        Insert: {
          completion_percentage?: number | null
          completion_time?: string | null
          contributors?: Json | null
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
          user_id?: string | null
        }
        Update: {
          completion_percentage?: number | null
          completion_time?: string | null
          contributors?: Json | null
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
          user_id?: string | null
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
      generator_logs: {
        Row: {
          avr_field_current: number | null
          avr_field_voltage: number | null
          bearing_bgb_high_speed_ch12: number | null
          bearing_bgb_low_speed_ch11: number | null
          bearing_g_de_brg_main_ch7: number | null
          bearing_g_nde_brg_stand_ch8: number | null
          bearing_tgb_high_speed_ch14: number | null
          bearing_tgb_low_speed_ch13: number | null
          bearing_thrust_1_ch9: number | null
          bearing_thrust_2_ch10: number | null
          cooling_bearing_flow: number | null
          cooling_los_flow: number | null
          cooling_main_pressure: number | null
          created_at: string | null
          date: string
          finalized: boolean | null
          finalized_at: string | null
          finalized_by: string | null
          gblos_oil_level: number | null
          gblos_oil_pressure: number | null
          gblos_oil_temperature: number | null
          gen_current_b: number | null
          gen_current_r: number | null
          gen_current_y: number | null
          gen_frequency: number | null
          gen_kva: number | null
          gen_kvar: number | null
          gen_kw: number | null
          gen_mvah: number | null
          gen_mvarh: number | null
          gen_mwh: number | null
          gen_power_factor: number | null
          gen_rpm: number | null
          gen_voltage_br: number | null
          gen_voltage_ry: number | null
          gen_voltage_yb: number | null
          hour: number
          id: string
          intake_gv_percentage: number | null
          intake_rb_percentage: number | null
          intake_water_level: number | null
          intake_water_pressure: number | null
          last_modified_by: string | null
          logged_at: string | null
          logged_by: string | null
          remarks: string | null
          tail_race_net_head: number | null
          tail_race_water_level: number | null
          topu_oil_level: number | null
          topu_oil_pressure: number | null
          topu_oil_temperature: number | null
          updated_at: string | null
          user_id: string | null
          winding_temp_b1: number | null
          winding_temp_b2: number | null
          winding_temp_r1: number | null
          winding_temp_r2: number | null
          winding_temp_y1: number | null
          winding_temp_y2: number | null
        }
        Insert: {
          avr_field_current?: number | null
          avr_field_voltage?: number | null
          bearing_bgb_high_speed_ch12?: number | null
          bearing_bgb_low_speed_ch11?: number | null
          bearing_g_de_brg_main_ch7?: number | null
          bearing_g_nde_brg_stand_ch8?: number | null
          bearing_tgb_high_speed_ch14?: number | null
          bearing_tgb_low_speed_ch13?: number | null
          bearing_thrust_1_ch9?: number | null
          bearing_thrust_2_ch10?: number | null
          cooling_bearing_flow?: number | null
          cooling_los_flow?: number | null
          cooling_main_pressure?: number | null
          created_at?: string | null
          date?: string
          finalized?: boolean | null
          finalized_at?: string | null
          finalized_by?: string | null
          gblos_oil_level?: number | null
          gblos_oil_pressure?: number | null
          gblos_oil_temperature?: number | null
          gen_current_b?: number | null
          gen_current_r?: number | null
          gen_current_y?: number | null
          gen_frequency?: number | null
          gen_kva?: number | null
          gen_kvar?: number | null
          gen_kw?: number | null
          gen_mvah?: number | null
          gen_mvarh?: number | null
          gen_mwh?: number | null
          gen_power_factor?: number | null
          gen_rpm?: number | null
          gen_voltage_br?: number | null
          gen_voltage_ry?: number | null
          gen_voltage_yb?: number | null
          hour: number
          id?: string
          intake_gv_percentage?: number | null
          intake_rb_percentage?: number | null
          intake_water_level?: number | null
          intake_water_pressure?: number | null
          last_modified_by?: string | null
          logged_at?: string | null
          logged_by?: string | null
          remarks?: string | null
          tail_race_net_head?: number | null
          tail_race_water_level?: number | null
          topu_oil_level?: number | null
          topu_oil_pressure?: number | null
          topu_oil_temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
          winding_temp_b1?: number | null
          winding_temp_b2?: number | null
          winding_temp_r1?: number | null
          winding_temp_r2?: number | null
          winding_temp_y1?: number | null
          winding_temp_y2?: number | null
        }
        Update: {
          avr_field_current?: number | null
          avr_field_voltage?: number | null
          bearing_bgb_high_speed_ch12?: number | null
          bearing_bgb_low_speed_ch11?: number | null
          bearing_g_de_brg_main_ch7?: number | null
          bearing_g_nde_brg_stand_ch8?: number | null
          bearing_tgb_high_speed_ch14?: number | null
          bearing_tgb_low_speed_ch13?: number | null
          bearing_thrust_1_ch9?: number | null
          bearing_thrust_2_ch10?: number | null
          cooling_bearing_flow?: number | null
          cooling_los_flow?: number | null
          cooling_main_pressure?: number | null
          created_at?: string | null
          date?: string
          finalized?: boolean | null
          finalized_at?: string | null
          finalized_by?: string | null
          gblos_oil_level?: number | null
          gblos_oil_pressure?: number | null
          gblos_oil_temperature?: number | null
          gen_current_b?: number | null
          gen_current_r?: number | null
          gen_current_y?: number | null
          gen_frequency?: number | null
          gen_kva?: number | null
          gen_kvar?: number | null
          gen_kw?: number | null
          gen_mvah?: number | null
          gen_mvarh?: number | null
          gen_mwh?: number | null
          gen_power_factor?: number | null
          gen_rpm?: number | null
          gen_voltage_br?: number | null
          gen_voltage_ry?: number | null
          gen_voltage_yb?: number | null
          hour?: number
          id?: string
          intake_gv_percentage?: number | null
          intake_rb_percentage?: number | null
          intake_water_level?: number | null
          intake_water_pressure?: number | null
          last_modified_by?: string | null
          logged_at?: string | null
          logged_by?: string | null
          remarks?: string | null
          tail_race_net_head?: number | null
          tail_race_water_level?: number | null
          topu_oil_level?: number | null
          topu_oil_pressure?: number | null
          topu_oil_temperature?: number | null
          updated_at?: string | null
          user_id?: string | null
          winding_temp_b1?: number | null
          winding_temp_b2?: number | null
          winding_temp_r1?: number | null
          winding_temp_r2?: number | null
          winding_temp_y1?: number | null
          winding_temp_y2?: number | null
        }
        Relationships: []
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
          cos_phi: number | null
          created_at: string | null
          current_b: number | null
          current_r: number | null
          current_y: number | null
          date: string
          finalized: boolean | null
          finalized_at: string | null
          finalized_by: string | null
          frequency: number | null
          gen_aux_consumption: number | null
          gen_check_export: number | null
          gen_check_import: number | null
          gen_main_export: number | null
          gen_main_import: number | null
          gen_standby_export: number | null
          gen_standby_import: number | null
          gen_total_generation: number | null
          gen_xmer_export: number | null
          hour: number
          id: string
          kva: number | null
          last_modified_by: string | null
          logged_at: string | null
          logged_by: string | null
          ltac_current_b: number | null
          ltac_current_r: number | null
          ltac_current_y: number | null
          ltac_grid_fail_time: string | null
          ltac_grid_resume_time: string | null
          ltac_kva: number | null
          ltac_kvah: number | null
          ltac_kvar: number | null
          ltac_kvarh: number | null
          ltac_kw: number | null
          ltac_kwh: number | null
          ltac_oil_temperature: number | null
          ltac_supply_interruption: string | null
          ltac_voltage_rb: number | null
          ltac_voltage_ry: number | null
          ltac_voltage_yb: number | null
          mvah: number | null
          mvarh: number | null
          mwh: number | null
          oil_level: string | null
          oil_temperature: number | null
          reactive_power: number | null
          remarks: string | null
          silica_gel_colour: string | null
          tap_counter: number | null
          tap_position: string | null
          transformer_number: number
          updated_at: string | null
          user_id: string | null
          voltage_rb: number | null
          voltage_ry: number | null
          voltage_yb: number | null
          winding_temperature: number | null
        }
        Insert: {
          active_power?: number | null
          cos_phi?: number | null
          created_at?: string | null
          current_b?: number | null
          current_r?: number | null
          current_y?: number | null
          date?: string
          finalized?: boolean | null
          finalized_at?: string | null
          finalized_by?: string | null
          frequency?: number | null
          gen_aux_consumption?: number | null
          gen_check_export?: number | null
          gen_check_import?: number | null
          gen_main_export?: number | null
          gen_main_import?: number | null
          gen_standby_export?: number | null
          gen_standby_import?: number | null
          gen_total_generation?: number | null
          gen_xmer_export?: number | null
          hour: number
          id?: string
          kva?: number | null
          last_modified_by?: string | null
          logged_at?: string | null
          logged_by?: string | null
          ltac_current_b?: number | null
          ltac_current_r?: number | null
          ltac_current_y?: number | null
          ltac_grid_fail_time?: string | null
          ltac_grid_resume_time?: string | null
          ltac_kva?: number | null
          ltac_kvah?: number | null
          ltac_kvar?: number | null
          ltac_kvarh?: number | null
          ltac_kw?: number | null
          ltac_kwh?: number | null
          ltac_oil_temperature?: number | null
          ltac_supply_interruption?: string | null
          ltac_voltage_rb?: number | null
          ltac_voltage_ry?: number | null
          ltac_voltage_yb?: number | null
          mvah?: number | null
          mvarh?: number | null
          mwh?: number | null
          oil_level?: string | null
          oil_temperature?: number | null
          reactive_power?: number | null
          remarks?: string | null
          silica_gel_colour?: string | null
          tap_counter?: number | null
          tap_position?: string | null
          transformer_number: number
          updated_at?: string | null
          user_id?: string | null
          voltage_rb?: number | null
          voltage_ry?: number | null
          voltage_yb?: number | null
          winding_temperature?: number | null
        }
        Update: {
          active_power?: number | null
          cos_phi?: number | null
          created_at?: string | null
          current_b?: number | null
          current_r?: number | null
          current_y?: number | null
          date?: string
          finalized?: boolean | null
          finalized_at?: string | null
          finalized_by?: string | null
          frequency?: number | null
          gen_aux_consumption?: number | null
          gen_check_export?: number | null
          gen_check_import?: number | null
          gen_main_export?: number | null
          gen_main_import?: number | null
          gen_standby_export?: number | null
          gen_standby_import?: number | null
          gen_total_generation?: number | null
          gen_xmer_export?: number | null
          hour?: number
          id?: string
          kva?: number | null
          last_modified_by?: string | null
          logged_at?: string | null
          logged_by?: string | null
          ltac_current_b?: number | null
          ltac_current_r?: number | null
          ltac_current_y?: number | null
          ltac_grid_fail_time?: string | null
          ltac_grid_resume_time?: string | null
          ltac_kva?: number | null
          ltac_kvah?: number | null
          ltac_kvar?: number | null
          ltac_kvarh?: number | null
          ltac_kw?: number | null
          ltac_kwh?: number | null
          ltac_oil_temperature?: number | null
          ltac_supply_interruption?: string | null
          ltac_voltage_rb?: number | null
          ltac_voltage_ry?: number | null
          ltac_voltage_yb?: number | null
          mvah?: number | null
          mvarh?: number | null
          mwh?: number | null
          oil_level?: string | null
          oil_temperature?: number | null
          reactive_power?: number | null
          remarks?: string | null
          silica_gel_colour?: string | null
          tap_counter?: number | null
          tap_position?: string | null
          transformer_number?: number
          updated_at?: string | null
          user_id?: string | null
          voltage_rb?: number | null
          voltage_ry?: number | null
          voltage_yb?: number | null
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
      user_sessions: {
        Row: {
          checklist_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_activity: string | null
          module_number: number | null
          started_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          checklist_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          module_number?: number | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          checklist_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_activity?: string | null
          module_number?: number | null
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
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
      assign_admin_role: { Args: { _user_email: string }; Returns: undefined }
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
