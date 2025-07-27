-- Seed properties table with Guesty listings data (fixed type conversion)
INSERT INTO properties (id, name, address, description, num_bedrooms, num_bathrooms, max_guests, price_per_night, status)
SELECT 
  gen_random_uuid(),
  title,
  COALESCE(address->>'formatted', 'Address not available'),
  'Property synced from Guesty',
  COALESCE(
    CASE WHEN raw_data->>'bedrooms' ~ '^[0-9]+$' 
    THEN (raw_data->>'bedrooms')::int 
    ELSE 1 END, 1
  ),
  COALESCE(
    CASE WHEN raw_data->>'bathrooms' ~ '^[0-9]+(\.[0-9]+)?$' 
    THEN FLOOR((raw_data->>'bathrooms')::numeric)::int 
    ELSE 1 END, 1
  ),
  COALESCE(
    CASE WHEN raw_data->>'accommodates' ~ '^[0-9]+$' 
    THEN (raw_data->>'accommodates')::int 
    ELSE 2 END, 2
  ),
  COALESCE(
    CASE WHEN raw_data->>'defaultNightlyRate' ~ '^[0-9]+(\.[0-9]+)?$' 
    THEN (raw_data->>'defaultNightlyRate')::numeric 
    ELSE 100 END, 100
  ),
  CASE WHEN status = 'active' THEN 'active' ELSE 'inactive' END
FROM guesty_listings 
WHERE is_deleted = false
  AND NOT EXISTS (SELECT 1 FROM properties WHERE name = guesty_listings.title);