-- Phase 1: Fix User Roles in Database
-- Update Iakovos to superadmin role
UPDATE public.profiles 
SET role = 'superadmin'::app_role 
WHERE email = 'iakovos@ariviagroup.com';

-- Update admin user to administrator role
UPDATE public.profiles 
SET role = 'administrator'::app_role 
WHERE email = 'admin@ariviagroup.com';

-- Update manager user to property_manager role
UPDATE public.profiles 
SET role = 'property_manager'::app_role 
WHERE email = 'manager@ariviagroup.com';

-- Keep housekeeping staff user as is for testing
-- (user with 'housekeeping_staff' role already exists)