-- Drop all Guesty-related tables and functions
DROP TABLE IF EXISTS guesty_listings CASCADE;
DROP TABLE IF EXISTS guesty_bookings CASCADE;
DROP TABLE IF EXISTS sync_logs CASCADE;
DROP TABLE IF EXISTS guesty_api_usage CASCADE;
DROP TABLE IF EXISTS integration_health CASCADE;
DROP TABLE IF EXISTS webhook_health CASCADE;
DROP TABLE IF EXISTS housekeeping_tasks CASCADE;