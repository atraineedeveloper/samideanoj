-- Loko en tri niveloj: lando → regiono (ŝtato, provinco) → urbo. Vidu docs/urboj.md.
-- La lando estas ĉiam publika; regiono kaj urbo havas sian propran videblecon.
-- Ĉiu indekso kostas aldonan skribon en D1 (100 000 senpagaj tage), do ni tenas
-- nur la indeksojn necesajn por la serĉado.

-- Landoj el GeoNames (countryInfo). La nomoj venas el la tradukoj de la interfaco.
CREATE TABLE landoj (
  kodo TEXT PRIMARY KEY CHECK (length(kodo) = 2)
);

-- Regionoj el GeoNames (admin1), ekz. "MX.27" = Tabasko.
CREATE TABLE regionoj (
  id TEXT PRIMARY KEY,
  lando_kodo TEXT NOT NULL CHECK (length(lando_kodo) = 2),
  nomo TEXT NOT NULL,
  sercxnomo TEXT NOT NULL
);
CREATE INDEX regionoj_sercxo ON regionoj (lando_kodo, sercxnomo);

-- Urboj: ligo al la regiono, normigita serĉnomo kaj loĝantaro.
ALTER TABLE urboj ADD COLUMN regiono_id TEXT;
ALTER TABLE urboj ADD COLUMN sercxnomo TEXT NOT NULL DEFAULT '';
ALTER TABLE urboj ADD COLUMN logxantoj INTEGER NOT NULL DEFAULT 0;
DROP INDEX IF EXISTS urboj_lando;
DROP INDEX IF EXISTS urboj_nomo;
CREATE INDEX urboj_sercxo ON urboj (lando_kodo, sercxnomo, logxantoj DESC);

-- Uzantoj: lando kaj regiono rekte en la profilo.
ALTER TABLE uzantoj ADD COLUMN lando_kodo TEXT CHECK (lando_kodo IS NULL OR length(lando_kodo) = 2);
ALTER TABLE uzantoj ADD COLUMN regiono_id TEXT REFERENCES regionoj (id);
ALTER TABLE uzantoj ADD COLUMN vid_regiono TEXT NOT NULL DEFAULT 'publika'
  CHECK (vid_regiono IN ('publika', 'ensalutintoj', 'kasxita'));

UPDATE uzantoj
   SET lando_kodo = (SELECT r.lando_kodo FROM urboj r WHERE r.id = uzantoj.urbo_id)
 WHERE urbo_id IS NOT NULL;

-- Komenca listo de interesoj (la tradukoj estas en src/i18n/tradukoj.ts).
INSERT OR IGNORE INTO interesoj (id, sxlosilo) VALUES
  (1, 'literaturo'), (2, 'vojagxoj'), (3, 'muziko'), (4, 'programado'),
  (5, 'sxako'), (6, 'kantado'), (7, 'kuirado'), (8, 'historio'), (9, 'filmoj'),
  (10, 'lingvoj'), (11, 'tradukado'), (12, 'instruado'), (13, 'sporto'),
  (14, 'naturo'), (15, 'fotografado'), (16, 'arto'), (17, 'scienco'),
  (18, 'ludoj'), (19, 'politiko'), (20, 'filozofio'), (21, 'teatro'),
  (22, 'dancado'), (23, 'ekologio'), (24, 'religio');
