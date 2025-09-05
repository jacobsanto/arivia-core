-- Create basic profiles first (avoiding privileged roles due to trigger)
INSERT INTO public.profiles (id, user_id, name, email, phone, role, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-4789-9abc-123456789def', 'c1d2e3f4-a5b6-4789-9abc-123456789def', 'Maria Housekeeper', 'maria@ariviagroup.com', '+30 694 456 7890', 'housekeeping_staff', NOW(), NOW()),
('b2c3d4e5-f6a7-4890-9bcd-234567890abc', 'd2e3f4a5-b6c7-4890-9bcd-234567890abc', 'Nikos Maintenance', 'nikos@ariviagroup.com', '+30 694 567 8901', 'maintenance_staff', NOW(), NOW());