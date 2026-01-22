-- Drop service_type column from bookings table (keep only service_type_id)
ALTER TABLE bookings DROP COLUMN service_type;