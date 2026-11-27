#!/usr/bin/env node
/**
 * Konvertas la regionojn kaj urbojn de GeoNames al SQL por D1.
 * Uzo: node scripts/importi-lokojn.mjs cities15000.txt admin1CodesASCII.txt countryInfo.txt > lokoj.sql
 *
 * - INSERT OR IGNORE: oni povas ruli ĝin denove por daŭrigi post la taga limo de D1.
 * - Ordigita laŭ loĝantaro, do la plej grandaj urboj eniras unue.
 * Datumoj: GeoNames, CC BY 4.0 (https://www.geonames.org/).
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

/** Samaj reguloj kiel src/lib/sercxo.ts (kontrolita de tests/urboj.test.ts). */
export function normigiSercxon(teksto) {
  return teksto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** countryInfo.txt: linioj kiuj ne komenciĝas per "#"; la unua kolumno estas la ISO-kodo. */
export function legiLandojn(teksto) {
  const landoj = [];
  for (const linio of teksto.split("\n")) {
    if (linio.startsWith("#")) continue;
    const kodo = linio.split("\t")[0];
    if (/^[A-Z]{2}$/.test(kodo)) landoj.push(kodo);
  }
  return landoj;
}

/** admin1CodesASCII.txt: "MX.27<TAB>Tabasco<TAB>Tabasco<TAB>3516458". */
export function legiRegionojn(teksto) {
  const regionoj = new Map();
  for (const linio of teksto.split("\n")) {
    const [kodo, nomo] = linio.split("\t");
    if (!kodo || !nomo || !/^[A-Z]{2}\.[A-Za-z0-9]+$/.test(kodo)) continue;
    regionoj.set(kodo, {
      id: kodo,
      lando: kodo.slice(0, 2),
      nomo,
      sercxnomo: normigiSercxon(nomo),
    });
  }
  return regionoj;
}

export function legiUrbojn(teksto, regionoj) {
  const urboj = [];
  for (const linio of teksto.split("\n")) {
    const k = linio.split("\t");
    if (k.length < 15) continue;
    const [id, nomo, , , lat, lon] = k;
    const lando = k[8];
    const admin1 = k[10];
    const logxantoj = Number(k[14]) || 0;
    if (!/^\d+$/.test(id) || !/^[A-Z]{2}$/.test(lando)) continue;
    const regionoId = `${lando}.${admin1}`;
    urboj.push({
      id: Number(id),
      nomo,
      lando,
      regionoId: regionoj.has(regionoId) ? regionoId : null,
      lat: Number(Number(lat).toFixed(2)),
      lon: Number(Number(lon).toFixed(2)),
      logxantoj,
      sercxnomo: normigiSercxon(nomo),
    });
  }
  return urboj.sort((a, b) => b.logxantoj - a.logxantoj);
}

const sql = (v) => (v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

function enmeti(tabelo, kolumnoj, vicoj, grupo) {
  const partoj = [];
  for (let i = 0; i < vicoj.length; i += grupo) {
    partoj.push(
      `INSERT OR IGNORE INTO ${tabelo} (${kolumnoj}) VALUES\n${vicoj.slice(i, i + grupo).join(",\n")};`,
    );
  }
  return partoj;
}

export function alSql(regionoj, urboj, grupo = 200, landoj = []) {
  const l = landoj.map((k) => `(${sql(k)})`);
  const r = [...regionoj.values()].map(
    (g) => `(${sql(g.id)}, ${sql(g.lando)}, ${sql(g.nomo)}, ${sql(g.sercxnomo)})`,
  );
  const u = urboj.map(
    (x) =>
      `(${x.id}, ${sql(x.nomo)}, ${sql(x.lando)}, ${sql(x.regionoId)}, ${x.lat}, ${x.lon}, ${x.logxantoj}, ${sql(x.sercxnomo)})`,
  );
  return `${[
    ...enmeti("landoj", "kodo", l, grupo),
    ...enmeti("regionoj", "id, lando_kodo, nomo, sercxnomo", r, grupo),
    ...enmeti(
      "urboj",
      "id, nomo, lando_kodo, regiono_id, lat, lon, logxantoj, sercxnomo",
      u,
      grupo,
    ),
  ].join("\n")}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [urbojDosiero, regionojDosiero, landojDosiero] = process.argv.slice(2);
  if (!urbojDosiero || !regionojDosiero || !landojDosiero) {
    console.error(
      "Uzo: node scripts/importi-lokojn.mjs cities15000.txt admin1CodesASCII.txt countryInfo.txt",
    );
    process.exit(1);
  }
  const landoj = legiLandojn(readFileSync(landojDosiero, "utf8"));
  const regionoj = legiRegionojn(readFileSync(regionojDosiero, "utf8"));
  const urboj = legiUrbojn(readFileSync(urbojDosiero, "utf8"), regionoj);
  process.stdout.write(alSql(regionoj, urboj, 200, landoj));
  console.error(`${landoj.length} landoj, ${regionoj.size} regionoj, ${urboj.length} urboj`);
}
