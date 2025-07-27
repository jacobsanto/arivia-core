-- Seed properties table with Guesty listings data
INSERT INTO properties (id, name, address, description, num_bedrooms, num_bathrooms, max_guests, price_per_night, status)
SELECT 
  gen_random_uuid(),
  title,
  COALESCE(address->>'formatted', 'Address not available'),
  'Property synced from Guesty',
  COALESCE((raw_data->>'bedrooms')::int, 1),
  COALESCE((raw_data->>'bathrooms')::int, 1),
  COALESCE((raw_data->>'accommodates')::int, 2),
  COALESCE((raw_data->>'defaultNightlyRate')::numeric, 100),
  CASE WHEN status = 'active' THEN 'active' ELSE 'inactive' END
FROM guesty_listings 
WHERE is_deleted = false
  AND NOT EXISTS (SELECT 1 FROM properties WHERE name = guesty_listings.title);