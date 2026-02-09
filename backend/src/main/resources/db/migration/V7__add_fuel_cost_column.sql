-- Add fuel_cost column to bookings table
ALTER TABLE bookings ADD COLUMN fuel_cost DECIMAL(10, 2);
