-- Urboj el GeoNames: normigita serĉnomo, regiono kaj loĝantaro.
-- Ĉiu indekso kostas aldonan skribon en D1 (100 000 senpagaj tage), do ni tenas
-- nur unu indekson por la serĉado. Vidu docs/urboj.md.

ALTER TABLE urboj ADD COLUMN regiono TEXT;
ALTER TABLE urboj ADD COLUMN sercxnomo TEXT NOT NULL DEFAULT '';
ALTER TABLE urboj ADD COLUMN logxantoj INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS urboj_lando;
DROP INDEX IF EXISTS urboj_nomo;
CREATE INDEX urboj_sercxnomo ON urboj (sercxnomo, logxantoj DESC);

-- Komenca listo de interesoj (la tradukoj estas en src/i18n/tradukoj.ts).
INSERT OR IGNORE INTO interesoj (id, sxlosilo) VALUES
  (1, 'literaturo'), (2, 'vojagxoj'), (3, 'muziko'), (4, 'programado'),
  (5, 'sxako'), (6, 'kantado'), (7, 'kuirado'), (8, 'historio'), (9, 'filmoj'),
  (10, 'lingvoj'), (11, 'tradukado'), (12, 'instruado'), (13, 'sporto'),
  (14, 'naturo'), (15, 'fotografado'), (16, 'arto'), (17, 'scienco'),
  (18, 'ludoj'), (19, 'politiko'), (20, 'filozofio'), (21, 'teatro'),
  (22, 'dancado'), (23, 'ekologio'), (24, 'religio');
