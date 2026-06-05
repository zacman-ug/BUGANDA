-- Buganda Heritage Database Schema with User Authentication
-- Run these SQL commands in your MySQL database

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

-- 2. UPDATE INDIVIDUALS TABLE TO LINK TO USERS
-- Add user_id column if it doesn't exist
ALTER TABLE individuals ADD COLUMN user_id INT;
ALTER TABLE individuals ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 3. CREATE CLANS TABLE (if not exists)
CREATE TABLE IF NOT EXISTS clans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  totem VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example clans data (adjust to your Buganda clans)
INSERT INTO clans (name, totem) VALUES
('Lion', 'Mpologoma'),
('Leopard', 'Mpafu'),
('Buffalo', 'Nkima'),
('Antelope', 'Mbusi'),
('Heron', 'Ntalaganya'),
('Fish/Otter', 'Nkejje'),
('Civet', 'Pogoleri'),
('Mudfish', 'Nnamba'),
('Kob', 'Mbalizi'),
('Bushbuck', 'Mbuzi'),
('Colobus Monkey', 'Mpima'),
('Blue Monkey', 'Mpima'),
('Genet', 'Njovu'),
('Python', 'Lufubya'),
('Frog', 'Efroogi'),
('Crocodile', 'Nnira'),
('Hyena', 'Mfalme')
ON DUPLICATE KEY UPDATE totem=VALUES(totem);

-- 4. VERIFY STRUCTURE
DESCRIBE users;
DESCRIBE individuals;
DESCRIBE clans;
