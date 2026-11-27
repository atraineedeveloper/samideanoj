-- Komenca skemo. Vidu docs/fazo-2/datummodelo.md.
-- Videbleco: 'publika' | 'ensalutintoj' | 'kasxita'.

CREATE TABLE urboj (
  id INTEGER PRIMARY KEY,               -- identigilo de GeoNames
  nomo TEXT NOT NULL,
  nomo_eo TEXT,
  lando_kodo TEXT NOT NULL CHECK (length(lando_kodo) = 2),
  lat REAL NOT NULL,
  lon REAL NOT NULL
);
CREATE INDEX urboj_lando ON urboj (lando_kodo);
CREATE INDEX urboj_nomo ON urboj (nomo);

CREATE TABLE uzantoj (
  id TEXT PRIMARY KEY,                  -- ULID
  slug TEXT NOT NULL UNIQUE,
  kromnomo TEXT NOT NULL CHECK (length(kromnomo) BETWEEN 1 AND 60),
  priskribo TEXT CHECK (priskribo IS NULL OR length(priskribo) <= 500),
  nivelo TEXT NOT NULL CHECK (nivelo IN ('komencanto', 'progresanto', 'flua', 'denaska')),
  urbo_id INTEGER REFERENCES urboj (id),
  vid_urbo TEXT NOT NULL DEFAULT 'publika' CHECK (vid_urbo IN ('publika', 'ensalutintoj', 'kasxita')),
  vid_priskribo TEXT NOT NULL DEFAULT 'publika' CHECK (vid_priskribo IN ('publika', 'ensalutintoj', 'kasxita')),
  vid_lingvoj TEXT NOT NULL DEFAULT 'publika' CHECK (vid_lingvoj IN ('publika', 'ensalutintoj', 'kasxita')),
  vid_interesoj TEXT NOT NULL DEFAULT 'publika' CHECK (vid_interesoj IN ('publika', 'ensalutintoj', 'kasxita')),
  rolo TEXT NOT NULL DEFAULT 'uzanto' CHECK (rolo IN ('uzanto', 'moderiganto', 'administranto')),
  stato TEXT NOT NULL DEFAULT 'aktiva' CHECK (stato IN ('aktiva', 'kasxita_de_moderiganto', 'neaktiva')),
  kreita INTEGER NOT NULL,
  gxisdatigita INTEGER NOT NULL,
  lasta_ensaluto INTEGER NOT NULL
);
CREATE INDEX uzantoj_urbo ON uzantoj (urbo_id);
CREATE INDEX uzantoj_nivelo ON uzantoj (nivelo);

CREATE TABLE identecoj (
  uzanto_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  provizanto TEXT NOT NULL CHECK (provizanto IN ('telegramo', 'google', 'github')),
  ekstera_id TEXT NOT NULL,
  PRIMARY KEY (provizanto, ekstera_id)
);
CREATE INDEX identecoj_uzanto ON identecoj (uzanto_id);

CREATE TABLE seancoj (
  id_hash TEXT PRIMARY KEY,             -- SHA-256 de la ĵetono; la ĵetono mem neniam estas konservata
  uzanto_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  eksvalidigxo INTEGER NOT NULL
);
CREATE INDEX seancoj_uzanto ON seancoj (uzanto_id);

CREATE TABLE ligiloj (
  id INTEGER PRIMARY KEY,
  uzanto_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'telegramo', 'whatsapp', 'signal', 'discord',
    'mastodon', 'instagram', 'fejsbuko', 'x', 'bluesky', 'youtube', 'tiktok',
    'lernu', 'pasporta_servo', 'amikumu',
    'retejo', 'retposxto'
  )),
  valoro TEXT NOT NULL CHECK (length(valoro) BETWEEN 1 AND 300),
  videbleco TEXT NOT NULL CHECK (videbleco IN ('publika', 'ensalutintoj', 'kasxita')),
  ordo INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX ligiloj_uzanto ON ligiloj (uzanto_id);

CREATE TABLE interesoj (
  id INTEGER PRIMARY KEY,
  sxlosilo TEXT NOT NULL UNIQUE         -- tradukata en la interfaco
);

CREATE TABLE uzanto_interesoj (
  uzanto_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  interes_id INTEGER NOT NULL REFERENCES interesoj (id),
  PRIMARY KEY (uzanto_id, interes_id)
);

CREATE TABLE uzanto_lingvoj (
  uzanto_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  lingvo_kodo TEXT NOT NULL CHECK (length(lingvo_kodo) = 2),
  PRIMARY KEY (uzanto_id, lingvo_kodo)
);

CREATE TABLE raportoj (
  id INTEGER PRIMARY KEY,
  profilo_id TEXT NOT NULL REFERENCES uzantoj (id) ON DELETE CASCADE,
  raportanto_id TEXT REFERENCES uzantoj (id) ON DELETE SET NULL,
  kialo TEXT NOT NULL CHECK (kialo IN ('spamo', 'falsa_profilo', 'ofenda_enhavo', 'alia')),
  komento TEXT CHECK (komento IS NULL OR length(komento) <= 1000),
  stato TEXT NOT NULL DEFAULT 'nova' CHECK (stato IN ('nova', 'akceptita', 'malakceptita')),
  kreita INTEGER NOT NULL
);
CREATE INDEX raportoj_stato ON raportoj (stato);

-- Registro de moderigaj agoj (minacmodelo R1).
CREATE TABLE moderigaj_agoj (
  id INTEGER PRIMARY KEY,
  moderiganto_id TEXT REFERENCES uzantoj (id) ON DELETE SET NULL,
  profilo_id TEXT,
  ago TEXT NOT NULL,
  kreita INTEGER NOT NULL
);
