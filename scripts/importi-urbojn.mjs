#!/usr/bin/env node
/**
 * Konvertas la urbojn de GeoNames (cities15000.txt) al SQL por D1.
 * Uzo: node scripts/importi-urbojn.mjs cities15000.txt admin1CodesASCII.txt > urboj.sql
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

export function legiRegionojn(teksto) {
  const regionoj = new Map();
  for (const linio of teksto.split("\n")) {
    const [kodo, nomo] = linio.split("\t");
    if (kodo && nomo) regionoj.set(kodo, nomo);
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
    urboj.push({
      id: Number(id),
      nomo,
      lando,
      regiono: regionoj.get(`${lando}.${admin1}`) ?? null,
      lat: Number(Number(lat).toFixed(2)),
      lon: Number(Number(lon).toFixed(2)),
      logxantoj,
      sercxnomo: normigiSercxon(nomo),
    });
  }
  return urboj.sort((a, b) => b.logxantoj - a.logxantoj);
}

const sql = (v) => (v === null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);

export function alSql(urboj, grupo = 200) {
  const partoj = [];
  for (let i = 0; i < urboj.length; i += grupo) {
    const vicoj = urboj
      .slice(i, i + grupo)
      .map(
        (u) =>
          `(${u.id}, ${sql(u.nomo)}, ${sql(u.lando)}, ${sql(u.regiono)}, ${u.lat}, ${u.lon}, ${u.logxantoj}, ${sql(u.sercxnomo)})`,
      );
    partoj.push(
      `INSERT OR IGNORE INTO urboj (id, nomo, lando_kodo, regiono, lat, lon, logxantoj, sercxnomo) VALUES\n${vicoj.join(",\n")};`,
    );
  }
  return `${partoj.join("\n")}\n`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const [urbojDosiero, regionojDosiero] = process.argv.slice(2);
  if (!urbojDosiero || !regionojDosiero) {
    console.error("Uzo: node scripts/importi-urbojn.mjs cities15000.txt admin1CodesASCII.txt");
    process.exit(1);
  }
  const regionoj = legiRegionojn(readFileSync(regionojDosiero, "utf8"));
  const urboj = legiUrbojn(readFileSync(urbojDosiero, "utf8"), regionoj);
  process.stdout.write(alSql(urboj));
  console.error(`${urboj.length} urboj`);
}
