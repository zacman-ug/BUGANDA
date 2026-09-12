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
('Abalangira', 'Tewali muziro (Royal Clan)'),
('Abalangira b''Essanje', 'Essanje'),
('Ababiito b''Ekooki', 'Mazzi ga Kisasi'),
('Ababiito b''Ekibulala', 'Ekibulala'),
('Butiko', 'Obutiko (ekika ky''obumyu)'),
('Ffumbe', 'Ffumbe'),
('Kiwere', 'Kiwere'),
('Kinyomo', 'Kinyomo'),
('Kayozi', 'Kayozi'),
('Kasimba', 'Kasimba'),
('Lugave', 'Engave'),
('Mpologoma', 'Mpologoma (empologoma)'),
('Mmamba Gabunga', 'Mmamba'),
('Mmamba Kakoboza', 'Mmamba'),
('Mpeewo', 'Mpeewo'),
('Mbwa', 'Mbwa'),
('Mbogo', 'Mbogo'),
('Mutima Omuyanja', 'Mutima Omuyanja'),
('Mutima Omusagi', 'Mutima Omusagi'),
('Musu', 'Musu'),
('Mbuzi', 'Mbuzi'),
('Kkobe', 'Kkobe'),
('Nkerebwe', 'Nkerebwe'),
('Namungoona', 'Namungoona'),
('Nkula', 'Nkula'),
('Ntalaganya', 'Ntalaganya'),
('Ngabi Ensamba', 'Ngabi'),
('Ngabi Ennyunga', 'Ngabi'),
('Ngeye', 'Ngeye'),
('Ngo', 'Ngo'),
('Nggonge', 'Nggonge'),
('Nkima', 'Nkima'),
('Njovu', 'Njovu'),
('Nsuma', 'Nsuma'),
('Nkejje', 'Nkejje'),
('Nnyonyi Nnyange', 'Ennyange'),
('Nvubu', 'Nvubu'),
('Nsunu', 'Nsunu'),
('Nkusu', 'Nkusu'),
('Nvuma', 'Nvuma'),
('Nte', 'Nte'),
('Nseenene', 'Nseenene'),
('Nswaswa', 'Nswaswa'),
('Ndiga', 'Ndiga'),
('Nakinsige', 'Nakinsige'),
('Njaza', 'Njaza'),
('Ngali', 'Ngali'),
('Kibe', 'Kibe'),
('Mazzi ga Kisasi', 'Mazzi ga Kisasi'),
('Mpindi', 'Mpindi'),
('Lukato', 'Lukato'),
('Ndiisa', 'Ndiisa'),
('Nkebuka', 'Nkebuka'),
('Kasanke', 'Kasanke'),
('Kibuba', 'Kibuba')
AS new_clans
ON DUPLICATE KEY UPDATE totem = new_clans.totem;

-- 4. VERIFY STRUCTURE
DESCRIBE users;
DESCRIBE individuals;
DESCRIBE clans;
