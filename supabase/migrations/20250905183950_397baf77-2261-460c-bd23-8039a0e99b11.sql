-- Insert mock users for all roles
INSERT INTO public.profiles (user_id, name, email, role, custom_permissions) VALUES
  (gen_random_uuid(), 'Iakovos', 'iakovos@ariviagroup.com', 'superadmin', '{}'),
  (gen_random_uuid(), 'Admin User', 'admin@test.com', 'administrator', '{}'),
  (gen_random_uuid(), 'Property Manager', 'manager@test.com', 'property_manager', '{}'),
  (gen_random_uuid(), 'Housekeeper', 'housekeeper@test.com', 'housekeeping_staff', '{}'),
  (gen_random_uuid(), 'Maintenance Worker', 'maintenance@test.com', 'maintenance_staff', '{}'),
  (gen_random_uuid(), 'Guest User', 'guest@test.com', 'guest', '{}');

-- Clean up properties - keep only Villa Aurora and Villa Caldera
DELETE FROM public.properties 
WHERE name NOT IN ('Villa Aurora', 'Villa Caldera');

-- Clean up vendors - keep only Clean & Fresh Supplies and Island Maintenance
DELETE FROM public.vendors 
WHERE name NOT IN ('Clean & Fresh Supplies', 'Island Maintenance');