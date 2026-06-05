-- Buganda clan seed data
-- Run this after the clans table exists to ensure all 17 clans are present.

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
ON DUPLICATE KEY UPDATE
  totem = VALUES(totem);

SELECT COUNT(*) AS clan_count FROM clans;