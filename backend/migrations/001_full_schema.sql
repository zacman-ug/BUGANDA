-- Buganda Heritage — consolidated schema
-- Run: mysql -u root -p < backend/migrations/001_full_schema.sql

CREATE DATABASE IF NOT EXISTS buganda_heritage;
USE buganda_heritage;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('admin', 'contributor', 'viewer', 'moderator') DEFAULT 'viewer',
    reset_code VARCHAR(10),
    reset_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS individuals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    clan_id INT,
    father_id INT,
    mother_id INT,
    spouse_id INT,
    bio TEXT,
    date_of_birth DATE,
    date_of_death DATE,
    occupation VARCHAR(255),
    residence VARCHAR(255),
    alternative_name VARCHAR(255),
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clans(id) ON DELETE SET NULL,
    FOREIGN KEY (father_id) REFERENCES individuals(id) ON DELETE SET NULL,
    FOREIGN KEY (mother_id) REFERENCES individuals(id) ON DELETE SET NULL,
    FOREIGN KEY (spouse_id) REFERENCES individuals(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_individuals_user (user_id),
    INDEX idx_individuals_father (father_id),
    INDEX idx_individuals_mother (mother_id)
);

CREATE TABLE IF NOT EXISTS marriages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    husband_id INT,
    wife_id INT,
    marriage_date DATE,
    notes TEXT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (husband_id) REFERENCES individuals(id) ON DELETE SET NULL,
    FOREIGN KEY (wife_id) REFERENCES individuals(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT IGNORE INTO clans (name, description) VALUES
('Ffumbe', 'The Ffumbe clan'),
('Lugave', 'The Lugave clan'),
('Mmamba', 'The Mmamba clan'),
('Ngeye', 'The Ngeye clan'),
('Njaza', 'The Njaza clan'),
('Njobe', 'The Njobe clan'),
('Nkima', 'The Nkima clan'),
('Nte', 'The Nte clan');
