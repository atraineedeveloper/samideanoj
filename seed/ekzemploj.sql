-- Ekzemplaj datumoj por loka disvolvado kaj la provmedio. NENIAM por produktado.
-- Uzo loke: npm run db:seed:local
-- En la provmedio: GitHub Actions → "Ekzemplaj datumoj" → sxargi.
-- Ĉiuj ekzemplaj uzantoj havas identigilon komenciĝantan per 01EKZEMPLO; ĉi tiu
-- dosiero forigas kaj rekreas nur ilin, neniam verajn uzantojn.

DELETE FROM uzantoj WHERE id LIKE '01EKZEMPLO%';

INSERT OR IGNORE INTO landoj (kodo) VALUES
  ('MX'), ('ES'), ('FR'), ('BR'), ('PL'), ('US'), ('AR'), ('DE'), ('JP');

INSERT OR IGNORE INTO regionoj (id, lando_kodo, nomo, sercxnomo) VALUES
  ('MX.09', 'MX', 'Ciudad de México', 'ciudad de mexico'),
  ('MX.14', 'MX', 'Jalisco', 'jalisco'),
  ('MX.15', 'MX', 'México', 'mexico'),
  ('MX.19', 'MX', 'Nuevo León', 'nuevo leon'),
  ('MX.27', 'MX', 'Tabasco', 'tabasco'),
  ('MX.30', 'MX', 'Veracruz', 'veracruz'),
  ('ES.29', 'ES', 'Madrid', 'madrid'),
  ('ES.54', 'ES', 'Castilla-La Mancha', 'castilla la mancha'),
  ('FR.11', 'FR', 'Île-de-France', 'ile de france'),
  ('FR.84', 'FR', 'Auvergne-Rhône-Alpes', 'auvergne rhone alpes'),
  ('BR.27', 'BR', 'São Paulo', 'sao paulo'),
  ('PL.78', 'PL', 'Masovia', 'masovia'),
  ('US.OH', 'US', 'Ohio', 'ohio');

INSERT OR IGNORE INTO urboj (id, nomo, nomo_eo, lando_kodo, regiono_id, lat, lon, logxantoj, sercxnomo) VALUES
  (3530597, 'Mexico City', 'Meksikurbo', 'MX', 'MX.09', 19.43, -99.13, 12294193, 'mexico city'),
  (4005539, 'Guadalajara', 'Gvadalajaro', 'MX', 'MX.14', 20.67, -103.39, 1385629, 'guadalajara'),
  (3515302, 'Toluca', NULL, 'MX', 'MX.15', 19.29, -99.66, 489333, 'toluca'),
  (3526617, 'Villahermosa', NULL, 'MX', 'MX.27', 17.99, -92.93, 353577, 'villahermosa'),
  (3995465, 'Monterrey', 'Monterejo', 'MX', 'MX.19', 25.67, -100.32, 1135512, 'monterrey'),
  (3117735, 'Madrid', 'Madrido', 'ES', 'ES.29', 40.42, -3.70, 3255944, 'madrid'),
  (2988507, 'Paris', 'Parizo', 'FR', 'FR.11', 48.85, 2.35, 2138551, 'paris'),
  (3448439, 'São Paulo', 'San-Paŭlo', 'BR', 'BR.27', -23.55, -46.64, 10021295, 'sao paulo'),
  (756135, 'Warsaw', 'Varsovio', 'PL', 'PL.78', 52.23, 21.01, 1702139, 'warsaw'),
  (3014728, 'Grenoble', NULL, 'FR', 'FR.84', 45.17, 5.72, 158552, 'grenoble'),
  (3108286, 'Toledo', NULL, 'ES', 'ES.54', 39.86, -4.02, 74632, 'toledo'),
  (5174035, 'Toledo', NULL, 'US', 'US.OH', 41.66, -83.56, 270871, 'toledo');

INSERT OR IGNORE INTO interesoj (id, sxlosilo) VALUES
  (1, 'literaturo'), (2, 'vojagxoj'), (3, 'muziko'), (4, 'programado'),
  (5, 'sxako'), (6, 'kantado'), (7, 'kuirado'), (8, 'historio'), (9, 'filmoj');

-- Marisol: ĉiuj kvar niveloj de videbleco en siaj ligiloj.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, regiono_id, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOMARISOL0000000000', 'marisol', 'Marisol',
  'Mi lernis Esperanton en 2019 kaj ŝatas legi kaj traduki poezion. Ĉiam pretas por kafo kaj babilado en Meksikurbo.',
  'flua', 'MX', 'MX.09', 3530597, 'publika', 'publika', 'publika', 'publika', 1790000000, 1793000000, 1793000000);
INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES
  ('01EKZEMPLOMARISOL0000000000', 'mastodon', '@marisol@mastodon.social', 'publika', 1),
  ('01EKZEMPLOMARISOL0000000000', 'instagram', 'marisol.legas', 'publika', 2),
  ('01EKZEMPLOMARISOL0000000000', 'lernu', 'https://lernu.net/profilo/marisol', 'publika', 3),
  ('01EKZEMPLOMARISOL0000000000', 'telegramo', 'marisol_eo', 'ensalutintoj', 4),
  ('01EKZEMPLOMARISOL0000000000', 'retposxto', 'marisol@example.org', 'kasxita', 5);
INSERT INTO uzanto_lingvoj (uzanto_id, lingvo_kodo) VALUES
  ('01EKZEMPLOMARISOL0000000000', 'es'), ('01EKZEMPLOMARISOL0000000000', 'en');
INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES
  ('01EKZEMPLOMARISOL0000000000', 1), ('01EKZEMPLOMARISOL0000000000', 2), ('01EKZEMPLOMARISOL0000000000', 3);

-- Tomaso: urbo videbla nur por ensalutintoj.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, regiono_id, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOTOMASO00000000000', 'tomaso', 'Tomaso',
  'Programisto kaj ŝakludanto. Serĉas partnerojn por ŝako en Esperanto.',
  'progresanto', 'MX', 'MX.14', 4005539, 'ensalutintoj', 'publika', 'publika', 'publika', 1790000000, 1792000000, 1792000000);
INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES
  ('01EKZEMPLOTOMASO00000000000', 'retejo', 'https://example.org/tomaso', 'publika', 1),
  ('01EKZEMPLOTOMASO00000000000', 'discord', 'tomaso.eo', 'ensalutintoj', 2);
INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES
  ('01EKZEMPLOTOMASO00000000000', 4), ('01EKZEMPLOTOMASO00000000000', 5);

-- Lupe: komencanto kun minimuma profilo.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, regiono_id, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOLUPE0000000000000', 'lupe', 'Lupe', NULL,
  'komencanto', 'MX', 'MX.15', 3515302, 'publika', 'publika', 'publika', 'publika', 1790000000, 1793500000, 1793500000);
INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES
  ('01EKZEMPLOLUPE0000000000000', 'whatsapp', '+520000000000', 'ensalutintoj', 1);
INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES
  ('01EKZEMPLOLUPE0000000000000', 6), ('01EKZEMPLOLUPE0000000000000', 7);

-- Profilo kaŝita de moderiganto: devas respondi 404 al ĉiuj vizitantoj.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, regiono_id, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, stato, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOKASXITA0000000000', 'kasxita', 'Spamisto', 'Aĉetu nun!',
  'komencanto', 'MX', NULL, NULL, 'publika', 'publika', 'publika', 'publika', 'kasxita_de_moderiganto',
  1790000000, 1790000000, 1790000000);

-- Moderiganto: por vidi la sistemon kiel moderiganto.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, regiono_id, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, rolo, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOMODERIGANTO000000', 'moderiganto-ekzemplo', 'Moderiganto Ekzemplo',
  'Ekzempla moderiganto por provi la sistemon.', 'flua', 'MX', 'MX.09', 3530597,
  'publika', 'publika', 'publika', 'publika', 'moderiganto', 1790000000, 1793000000, 1793000000);
