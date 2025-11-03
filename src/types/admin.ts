export interface UserActivity {
  id: string;
  user_id: string;
  user_name: string;
  action_type: 'login' | 'checklist_submit' | 'transformer_log' | 'generator_log' | 'issue_flag';
  action_details?: string;
  timestamp: string;
}

export interface UserManagementData {
  id: string;
  full_name: string;
  employee_id: string | null;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
  shift?: string | null;
}

export interface DatabaseStats {
  total_checklists: number;
  checklists_this_month: number;
  checklists_today: number;
  total_transformer_logs: number;
  transformer_logs_this_month: number;
  transformer_logs_today: number;
  total_generator_logs: number;
  generator_logs_this_month: number;
  generator_logs_today: number;
  total_issues: number;
  open_issues: number;
  resolved_issues: number;
}

export interface DailySubmission {
  date: string;
  checklists: number;
  transformer_logs: number;
  generator_logs: number;
}
