-- Run these SQL commands in your MySQL database to set up the multi-user system
-- Connect to your database first: USE buganda_heritage;

-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. ADD user_id COLUMN TO INDIVIDUALS TABLE
ALTER TABLE individuals ADD COLUMN user_id INT;

-- 3. ADD FOREIGN KEY CONSTRAINT
ALTER TABLE individuals ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. VERIFY STRUCTURE
SELECT 'Users Table:' as info;
DESCRIBE users;

SELECT 'Individuals Table (updated):' as info;
DESCRIBE individuals;

-- Done! Now you can register and login.
