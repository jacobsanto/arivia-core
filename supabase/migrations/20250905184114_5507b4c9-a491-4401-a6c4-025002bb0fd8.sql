-- Insert mock users for non-privileged roles first
INSERT INTO public.profiles (user_id, name, email, role, custom_permissions) VALUES
  (gen_random_uuid(), 'Property Manager', 'manager@test.com', 'property_manager', '{}'),
  (gen_random_uuid(), 'Housekeeper', 'housekeeper@test.com', 'housekeeping_staff', '{}'),
  (gen_random_uuid(), 'Maintenance Worker', 'maintenance@test.com', 'maintenance_staff', '{}');

-- Clean up properties - keep only Villa Aurora and Villa Caldera
DELETE FROM public.properties 
WHERE name NOT IN ('Villa Aurora', 'Villa Caldera');

-- Clean up vendors - keep only Clean & Fresh Supplies and Island Maintenance
DELETE FROM public.vendors 
WHERE name NOT IN ('Clean & Fresh Supplies', 'Island Maintenance');