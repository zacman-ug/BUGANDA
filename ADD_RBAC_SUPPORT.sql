-- Role-Based Access Control (RBAC) Migration
-- Add role support to existing users table and create permissions structure

-- 1. ALTER USERS TABLE TO ADD ROLE
ALTER TABLE users ADD COLUMN role ENUM('admin', 'contributor', 'viewer', 'moderator') DEFAULT 'viewer' AFTER email;

-- 2. CREATE ROLES TABLE (for extensibility)
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. INSERT DEFAULT ROLES
INSERT INTO roles (name, description) VALUES
('admin', 'Full system access, manage users and records'),
('moderator', 'Review and verify submitted information'),
('contributor', 'Add and edit family records'),
('viewer', 'Read-only access to heritage data')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 4. CREATE PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. INSERT PERMISSIONS
INSERT INTO permissions (name, description) VALUES
('create_record', 'Can create new family records'),
('edit_record', 'Can edit existing records'),
('delete_record', 'Can delete records'),
('approve_record', 'Can approve/verify submitted records'),
('manage_users', 'Can manage user accounts'),
('view_all_records', 'Can view all records in system'),
('export_data', 'Can export heritage data')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 6. CREATE ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- 7. ASSIGN PERMISSIONS TO ROLES

-- Admin permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name IN (
  'create_record', 'edit_record', 'delete_record', 'approve_record', 
  'manage_users', 'view_all_records', 'export_data'
)
ON DUPLICATE KEY UPDATE role_id=role_id;

-- Moderator permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'moderator' AND p.name IN (
  'view_all_records', 'approve_record', 'edit_record'
)
ON DUPLICATE KEY UPDATE role_id=role_id;

-- Contributor permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'contributor' AND p.name IN (
  'create_record', 'edit_record', 'view_all_records', 'export_data'
)
ON DUPLICATE KEY UPDATE role_id=role_id;

-- Viewer permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'viewer' AND p.name IN (
  'view_all_records'
)
ON DUPLICATE KEY UPDATE role_id=role_id;

-- 8. CREATE AUDIT LOG TABLE (optional but recommended for tracking changes)
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id INT,
  changes JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. VERIFY UPDATES
DESCRIBE users;
SELECT * FROM roles;
SELECT * FROM permissions;
SELECT * FROM role_permissions;

-- 10. SET INITIAL ADMIN USER (replace with your actual admin email)
-- Uncomment and update the email to promote an existing user to admin
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
