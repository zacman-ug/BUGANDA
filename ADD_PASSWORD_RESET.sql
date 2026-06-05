-- Add password reset columns to users table
ALTER TABLE users ADD COLUMN reset_code VARCHAR(6) NULL;
ALTER TABLE users ADD COLUMN reset_code_expires DATETIME NULL;

-- Verify the changes
DESCRIBE users;
