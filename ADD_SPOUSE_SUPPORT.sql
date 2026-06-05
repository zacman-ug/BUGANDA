-- Spouse Support & Clan Inheritance Migration
-- Enables proper spouse linking and clan inheritance through father

-- 1. ALTER INDIVIDUALS TABLE TO ADD SPOUSE_ID (FOREIGN KEY)
ALTER TABLE individuals ADD COLUMN spouse_id INT AFTER mother_id;
ALTER TABLE individuals ADD CONSTRAINT fk_spouse 
  FOREIGN KEY (spouse_id) REFERENCES individuals(id) ON DELETE SET NULL;

-- 2. CREATE MARRIAGE RECORDS TABLE (for tracking marriage details)
CREATE TABLE IF NOT EXISTS marriages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  person_id INT NOT NULL,
  spouse_id INT NOT NULL,
  marriage_date DATE,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES individuals(id) ON DELETE CASCADE,
  FOREIGN KEY (spouse_id) REFERENCES individuals(id) ON DELETE CASCADE,
  UNIQUE KEY unique_marriage (person_id, spouse_id)
);

-- 3. CREATE INCEST CHECK VIEW (helps identify potential relatives)
-- This view finds all ancestors and descendants of a person
CREATE OR REPLACE VIEW person_relations AS
SELECT 
  i.id,
  'ancestor' as relation_type,
  (
    WITH RECURSIVE ancestors AS (
      SELECT id, father_id, mother_id FROM individuals WHERE id = i.id
      UNION ALL
      SELECT i2.id, i2.father_id, i2.mother_id 
      FROM individuals i2 
      JOIN ancestors a ON (i2.id = a.father_id OR i2.id = a.mother_id)
    )
    SELECT GROUP_CONCAT(id) FROM ancestors WHERE id != i.id
  ) as related_ids
FROM individuals i
UNION ALL
SELECT 
  i.id,
  'descendant' as relation_type,
  (
    WITH RECURSIVE descendants AS (
      SELECT id, father_id, mother_id FROM individuals WHERE father_id = i.id OR mother_id = i.id
      UNION ALL
      SELECT i2.id, i2.father_id, i2.mother_id 
      FROM individuals i2 
      JOIN descendants d ON (i2.father_id = d.id OR i2.mother_id = d.id)
    )
    SELECT GROUP_CONCAT(id) FROM descendants
  ) as related_ids
FROM individuals i;

-- 4. NOTES ON CLAN INHERITANCE
-- ✓ Children automatically inherit father's clan_id when added
-- ✓ If no father specified, can manually select clan
-- ✓ Spouse can have different clan (they come from different family)
-- ✓ When linking as spouse, clan remains as initially set

-- 5. VERIFY STRUCTURE
DESCRIBE individuals;
DESCRIBE marriages;
