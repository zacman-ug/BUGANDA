-- Run this SQL to add new fields to the individuals table
-- These fields enable richer family member profiles

ALTER TABLE individuals ADD COLUMN date_of_birth DATE NULL AFTER bio;
ALTER TABLE individuals ADD COLUMN date_of_death DATE NULL AFTER date_of_birth;
ALTER TABLE individuals ADD COLUMN spouse_name VARCHAR(255) NULL AFTER date_of_death;
ALTER TABLE individuals ADD COLUMN occupation VARCHAR(255) NULL AFTER spouse_name;
ALTER TABLE individuals ADD COLUMN residence VARCHAR(255) NULL AFTER occupation;
ALTER TABLE individuals ADD COLUMN alternative_name VARCHAR(255) NULL AFTER residence;

-- Verify the structure
DESCRIBE individuals;
