-- Delete existing profiles with wrong roles
DELETE FROM public.profiles;

-- Create proper profiles with correct roles and better names (using proper UUID format)
INSERT INTO public.profiles (id, user_id, name, email, phone, role, created_at, updated_at) VALUES
('e2779fd1-ff15-4a46-992d-85b8b4f72c4c', 'b9f04c63-34ee-4ad1-ab40-1a458bf15d78', 'Iakovos Arampatzis', 'iakovos@ariviagroup.com', '+30 694 123 4567', 'superadmin', NOW(), NOW()),
('557839ea-bf49-4a86-9f43-0a6fa0207e8b', 'abd72066-8f00-49a1-9039-56c6be59701e', 'Admin User', 'admin@ariviagroup.com', '+30 694 234 5678', 'administrator', NOW(), NOW()),
('07cc502d-3991-44ca-af85-366e94c9148a', '9387dd00-50dc-4645-8ccd-c42e741aa105', 'Property Manager', 'manager@ariviagroup.com', '+30 694 345 6789', 'property_manager', NOW(), NOW()),
('a1b2c3d4-e5f6-4789-9abc-123456789def', 'c1d2e3f4-a5b6-4789-9abc-123456789def', 'Maria Housekeeper', 'maria@ariviagroup.com', '+30 694 456 7890', 'housekeeping_staff', NOW(), NOW()),
('b2c3d4e5-f6a7-4890-9bcd-234567890abc', 'd2e3f4a5-b6c7-4890-9bcd-234567890abc', 'Nikos Maintenance', 'nikos@ariviagroup.com', '+30 694 567 8901', 'maintenance_staff', NOW(), NOW());