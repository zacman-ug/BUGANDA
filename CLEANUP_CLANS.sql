-- Clan cleanup and normalization
-- Rebuilds the clans table using the canonical Luganda list from the repo seed.
-- Preserves existing individual clan links where they match the legacy table.

USE buganda_heritage;

START TRANSACTION;

SET @old_fk_checks = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;
SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

DROP TEMPORARY TABLE IF EXISTS canonical_clans;
CREATE TEMPORARY TABLE canonical_clans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  totem VARCHAR(100)
);

INSERT INTO canonical_clans (name, totem) VALUES
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
('Kibuba', 'Kibuba');

DROP TEMPORARY TABLE IF EXISTS clan_alias_map;
CREATE TEMPORARY TABLE clan_alias_map (
  old_name VARCHAR(100) PRIMARY KEY,
  canonical_name VARCHAR(100) NOT NULL
);

INSERT INTO clan_alias_map (old_name, canonical_name) VALUES
('Buffalo', 'Mbogo');

UPDATE individuals i
JOIN clans legacy_clan ON i.clan_id = legacy_clan.id
LEFT JOIN clan_alias_map alias_map ON alias_map.old_name = legacy_clan.name
JOIN canonical_clans canonical_clan ON canonical_clan.name = COALESCE(alias_map.canonical_name, legacy_clan.name)
SET i.clan_id = canonical_clan.id;

DELETE FROM clans;

INSERT INTO clans (id, name, totem, head_title)
SELECT id, name, totem, NULL
FROM canonical_clans
ORDER BY id;

ALTER TABLE clans AUTO_INCREMENT = 55;

SET SQL_SAFE_UPDATES = @old_safe_updates;
SET FOREIGN_KEY_CHECKS = @old_fk_checks;
COMMIT;

SELECT COUNT(*) AS clan_count FROM clans;