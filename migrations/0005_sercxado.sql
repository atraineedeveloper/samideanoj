-- Ciklo 4: serĉado kaj mapo.
-- Indeksoj por ke ĉiu serĉo legu malmultajn vicojn: la senpaga plano de D1
-- haltigas la datumbazon post 5 milionoj da legitaj vicoj tage.

CREATE INDEX uzantoj_lando ON uzantoj (lando_kodo, stato, gxisdatigita DESC);
CREATE INDEX uzantoj_regiono ON uzantoj (regiono_id);
CREATE INDEX uzantoj_aktivaj ON uzantoj (stato, gxisdatigita DESC);
CREATE INDEX uzanto_interesoj_intereso ON uzanto_interesoj (interes_id);
CREATE INDEX uzanto_lingvoj_lingvo ON uzanto_lingvoj (lingvo_kodo);

-- Malgranda kaŝmemoro por antaŭkalkulitaj rezultoj (ekz. la nombroj de la mapo).
-- Unu vico por ŝlosilo: renovigi ĝin kostas unu skribon.
CREATE TABLE kasxmemoro (
  sxlosilo TEXT PRIMARY KEY,
  valoro TEXT NOT NULL,
  gxisdatigita INTEGER NOT NULL
);
