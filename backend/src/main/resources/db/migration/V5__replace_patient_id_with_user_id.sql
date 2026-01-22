-- Add user_id column to bookings table with foreign key constraint
SET FOREIGN_KEY_CHECKS = 0;

-- Add user_id column with foreign key constraint
ALTER TABLE bookings ADD COLUMN user_id BIGINT NOT NULL;
ALTER TABLE bookings ADD CONSTRAINT fk_bookings_user_id FOREIGN KEY (user_id) REFERENCES users(id);

SET FOREIGN_KEY_CHECKS = 1;