-- Ensalutoj de novaj homoj, kiuj ankoraŭ ne kreis sian profilon.
-- Post sukcesa ensaluto ĉe la provizanto, sen ekzistanta konto, ni konservas
-- ĉi tie la identecon dum 30 minutoj, ĝis la homo plenigas la aliĝan formularon.
-- Kiel ĉe la seancoj, ni konservas nur la SHA-256 de la ĵetono.

CREATE TABLE atendantaj_aligxoj (
  id_hash TEXT PRIMARY KEY,
  provizanto TEXT NOT NULL CHECK (provizanto IN ('telegramo', 'google', 'github')),
  ekstera_id TEXT NOT NULL,
  eksvalidigxo INTEGER NOT NULL
);
CREATE INDEX atendantaj_aligxoj_eksvalidigxo ON atendantaj_aligxoj (eksvalidigxo);
CREATE INDEX seancoj_eksvalidigxo ON seancoj (eksvalidigxo);
