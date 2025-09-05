-- Clean up properties - keep only Villa Aurora and Villa Caldera
DELETE FROM public.properties 
WHERE name NOT IN ('Villa Aurora', 'Villa Caldera');

-- Clean up vendors - keep only Clean & Fresh Supplies and Island Maintenance
DELETE FROM public.vendors 
WHERE name NOT IN ('Clean & Fresh Supplies', 'Island Maintenance');

-- Note: Mock users will need to be created through the app's user management interface
-- since the profiles table requires actual auth users to exist first