-- Fix foreign key relationships and add sample data

-- Add foreign key constraint between rule_assignments and cleaning_rules
ALTER TABLE rule_assignments 
ADD CONSTRAINT fk_rule_assignments_cleaning_rules 
FOREIGN KEY (rule_id) REFERENCES cleaning_rules(id) ON DELETE CASCADE;

-- Add sample cleaning actions
INSERT INTO cleaning_actions (action_name, display_name, description, estimated_duration, category) VALUES
('standard_cleaning', 'Standard Cleaning', 'Regular cleaning including bathrooms, kitchen, and common areas', 90, 'cleaning'),
('full_cleaning', 'Full Cleaning', 'Deep cleaning including all areas, behind furniture, and detailed sanitization', 180, 'cleaning'),
('deep_cleaning', 'Deep Cleaning', 'Comprehensive cleaning for move-in/move-out or special occasions', 240, 'cleaning'),
('change_sheets', 'Change Bed Sheets', 'Replace all bed linens with fresh sets', 30, 'linen'),
('towel_refresh', 'Towel Refresh', 'Replace all towels and bathroom linens', 20, 'linen'),
('linen_towel_change', 'Linen & Towel Change', 'Complete refresh of all linens and towels', 45, 'linen'),
('sanitize_bathrooms', 'Sanitize Bathrooms', 'Deep sanitization of all bathroom surfaces', 60, 'sanitization'),
('kitchen_deep_clean', 'Kitchen Deep Clean', 'Thorough cleaning of kitchen appliances and surfaces', 75, 'cleaning'),
('balcony_cleaning', 'Clean Balcony/Outdoor Areas', 'Cleaning of outdoor spaces and balconies', 40, 'cleaning'),
('restock_amenities', 'Restock Amenities', 'Replenish bathroom and kitchen supplies', 15, 'supplies');

-- Add sample cleaning rules based on Arivia's stay length requirements
INSERT INTO cleaning_rules (rule_name, stay_length_range, actions_by_day, is_global, assignable_properties, min_nights, max_nights, config_id) VALUES
('Up to 3 Nights Stay', '[1, 3]', '{"day_0": ["full_cleaning"]}', true, '[]', 1, 3, gen_random_uuid()),
('Up to 5 Nights Stay', '[4, 5]', '{"day_0": ["full_cleaning"], "day_2": ["standard_cleaning"]}', true, '[]', 4, 5, gen_random_uuid()),
('Up to 7 Nights Stay', '[6, 7]', '{"day_0": ["full_cleaning"], "day_2": ["standard_cleaning"], "day_5": ["standard_cleaning"]}', true, '[]', 6, 7, gen_random_uuid()),
('7+ Nights Custom', '[8, 999]', '{"day_0": ["full_cleaning"], "day_3": ["full_cleaning"], "day_6": ["linen_towel_change"], "day_9": ["standard_cleaning"]}', true, '[]', 8, 999, gen_random_uuid());