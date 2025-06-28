
-- Reset permission-related tables
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Note: We're keeping user_roles and profiles tables as they may be used elsewhere
-- If you want to drop them too, uncomment the lines below:
-- DROP TABLE IF EXISTS user_roles CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP TABLE IF EXISTS audit_logs CASCADE;
