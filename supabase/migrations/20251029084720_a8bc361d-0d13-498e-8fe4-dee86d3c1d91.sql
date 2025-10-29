-- Fix foreign key constraints for activity tracking tables
ALTER TABLE activity_logs 
DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE activity_logs 
ADD CONSTRAINT activity_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_sessions
DROP CONSTRAINT IF EXISTS user_sessions_user_id_fkey;

ALTER TABLE user_sessions
ADD CONSTRAINT user_sessions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;