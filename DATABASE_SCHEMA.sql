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

-- Clan data used by the app's /api/clans endpoint
INSERT INTO clans (name, totem) VALUES
('Abalangira (Royal Clan)', NULL),
('Babiito–Kooki', NULL),
('Babiito–Kibulala', NULL),
('Babiito–Kiziba', NULL),
('Butiko', NULL),
('Ffumbe', NULL),
('Kasanke', NULL),
('Kasimba', NULL),
('Kayozi', NULL),
('Kibe', NULL),
('Kibuba', NULL),
('Kinyomo', NULL),
('Kiwere', NULL),
('Kkobe', NULL),
('Lugave', NULL),
('Lukato', NULL),
('Mazzi ga Kisasi', NULL),
('Mbogo', NULL),
('Mbuzi', NULL),
('Mbwa', NULL),
('Mmamba Gabunga', NULL),
('Mmamba Kakoboza', NULL),
('Mpeewo', NULL),
('Mpindi', NULL),
('Mpologoma', NULL),
('Musu', NULL),
('Mutima Musagi', NULL),
('Mutima Omuyanja', NULL),
('Nakinsige', NULL),
('Ndiga', NULL),
('Ndiisa', NULL),
('Ngabi Nnyunga', NULL),
('Ngabi Nsamba', NULL),
('Ngeye', NULL),
('Ngo', NULL),
('Njaza', NULL),
('Njovu', NULL),
('Nkebuka', NULL),
('Nkejje', NULL),
('Nkerebwe', NULL),
('Nkima', NULL),
('Nkula', NULL),
('Namuŋŋoona', NULL),
('Nnyonyi Nnyange', NULL),
('Nseenene', NULL),
('Nsuma', NULL),
('Nsunu', NULL),
('Nswaswa', NULL),
('Ntalaganya', NULL),
('Nte', NULL),
('Nvubu', NULL),
('Nvuma', NULL),
('Ŋŋaali (Ngaali)', NULL),
('Ŋŋonge (Ngonge)', NULL)
AS new_clans
ON DUPLICATE KEY UPDATE totem = new_clans.totem;

-- 4. VERIFY STRUCTURE
DESCRIBE users;
DESCRIBE individuals;
DESCRIBE clans;
