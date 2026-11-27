-- Ekzemplaj datumoj NUR por loka disvolvado. Neniam aplikata al provmedio aŭ produktado.
-- Uzo: npm run db:seed:local

DELETE FROM uzanto_interesoj;
DELETE FROM uzanto_lingvoj;
DELETE FROM ligiloj;
DELETE FROM identecoj;
DELETE FROM seancoj;
DELETE FROM uzantoj;
DELETE FROM interesoj;
DELETE FROM urboj;

INSERT INTO urboj (id, nomo, nomo_eo, lando_kodo, lat, lon) VALUES
  (3530597, 'Ciudad de México', 'Meksikurbo', 'MX', 19.43, -99.13),
  (4005539, 'Guadalajara', 'Gvadalajaro', 'MX', 20.67, -103.39),
  (3515302, 'Toluca', NULL, 'MX', 19.29, -99.66);

INSERT INTO interesoj (id, sxlosilo) VALUES
  (1, 'literaturo'), (2, 'vojagxoj'), (3, 'muziko'), (4, 'programado'),
  (5, 'sxako'), (6, 'kantado'), (7, 'kuirado'), (8, 'historio'), (9, 'filmoj');

-- Marisol: ĉiuj kvar niveloj de videbleco en siaj ligiloj.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOMARISOL0000000000', 'marisol', 'Marisol',
  'Mi lernis Esperanton en 2019 kaj ŝatas legi kaj traduki poezion. Ĉiam pretas por kafo kaj babilado en Meksikurbo.',
  'flua', 3530597, 'publika', 'publika', 'publika', 'publika', 1790000000, 1793000000, 1793000000);
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
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOTOMASO00000000000', 'tomaso', 'Tomaso',
  'Programisto kaj ŝakludanto. Serĉas partnerojn por ŝako en Esperanto.',
  'progresanto', 4005539, 'ensalutintoj', 'publika', 'publika', 'publika', 1790000000, 1792000000, 1792000000);
INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES
  ('01EKZEMPLOTOMASO00000000000', 'retejo', 'https://example.org/tomaso', 'publika', 1),
  ('01EKZEMPLOTOMASO00000000000', 'discord', 'tomaso.eo', 'ensalutintoj', 2);
INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES
  ('01EKZEMPLOTOMASO00000000000', 4), ('01EKZEMPLOTOMASO00000000000', 5);

-- Lupe: komencanto kun minimuma profilo.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOLUPE0000000000000', 'lupe', 'Lupe', NULL,
  'komencanto', 3515302, 'publika', 'publika', 'publika', 'publika', 1790000000, 1793500000, 1793500000);
INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES
  ('01EKZEMPLOLUPE0000000000000', 'whatsapp', '+520000000000', 'ensalutintoj', 1);
INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES
  ('01EKZEMPLOLUPE0000000000000', 6), ('01EKZEMPLOLUPE0000000000000', 7);

-- Profilo kaŝita de moderiganto: devas respondi 404 al ĉiuj vizitantoj.
INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, urbo_id,
  vid_urbo, vid_priskribo, vid_lingvoj, vid_interesoj, stato, kreita, gxisdatigita, lasta_ensaluto)
VALUES ('01EKZEMPLOKASXITA0000000000', 'kasxita', 'Spamisto', 'Aĉetu nun!',
  'komencanto', NULL, 'publika', 'publika', 'publika', 'publika', 'kasxita_de_moderiganto',
  1790000000, 1790000000, 1790000000);
