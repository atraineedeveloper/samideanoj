-- Profilbildoj. Vidu docs/profilbildoj.md.
-- La retumilo konvertas la bildon (256×256, WebP aŭ JPEG, sen metadatenoj);
-- la servilo kontrolas la formaton kaj konservas ĝin ĉi tie (~10–25 KB).

CREATE TABLE profilbildoj (
  uzanto_id TEXT PRIMARY KEY REFERENCES uzantoj (id) ON DELETE CASCADE,
  bildo BLOB NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('image/webp', 'image/jpeg')),
  grandeco INTEGER NOT NULL CHECK (grandeco <= 65536),
  kasxita_de_moderiganto INTEGER NOT NULL DEFAULT 0 CHECK (kasxita_de_moderiganto IN (0, 1)),
  gxisdatigita INTEGER NOT NULL
);

-- Bildo de vizaĝo estas sentema: defaŭlte nur ensalutintoj vidas ĝin.
ALTER TABLE uzantoj ADD COLUMN vid_bildo TEXT NOT NULL DEFAULT 'ensalutintoj'
  CHECK (vid_bildo IN ('publika', 'ensalutintoj', 'kasxita'));

-- Nova kialo de raporto: malkonvena bildo. SQLite ne povas ŝanĝi CHECK, do ni
-- rekreas la tabelon (neniu alia tabelo referencas ĝin).
CREATE TABLE raportoj_nova (
  id INTEGER PRIMARY KEY,
  profilo_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  raportanto_id TEXT REFERENCES uzantoj (id) ON DELETE SET NULL,
  kialo TEXT NOT NULL CHECK (kialo IN ('spamo', 'falsa_profilo', 'ofenda_enhavo', 'malkonvena_bildo', 'alia')),
  komento TEXT CHECK (komento IS NULL OR length(komento) <= 1000),
  stato TEXT NOT NULL DEFAULT 'nova' CHECK (stato IN ('nova', 'akceptita', 'malakceptita')),
  kreita INTEGER NOT NULL
);
INSERT INTO raportoj_nova SELECT * FROM raportoj;
DROP TABLE raportoj;
ALTER TABLE raportoj_nova RENAME TO raportoj;
CREATE INDEX raportoj_stato ON raportoj (stato);
