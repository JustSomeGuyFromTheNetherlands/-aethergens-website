-- Add email column to users table if it doesn't exist
ALTER TABLE `users` 
ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) NULL AFTER `username`,
ADD INDEX IF NOT EXISTS `idx_email` (`email`);


