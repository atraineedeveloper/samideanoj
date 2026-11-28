/**
 * La unu serĉkampo de la prototipo: "Urbo, lando aŭ intereso…".
 * La servilo interpretas la tekston, en ĉi tiu ordo:
 *   lando → urbo → regiono → intereso → lingvo → kromnomo.
 * La rezulto estas ordinaraj filtriloj, do la privatecaj reguloj de la serĉado
 * (src/lib/sercxado.ts) validas egale.
 */

import mapo from "../data/mapo.json";
import { LINGVOJ as LINGVONOMOJ } from "../i18n/esperantaj-nomoj";
import { nomoDe, tradukiDinamike } from "../i18n/tradukoj";
import type { ElektitaLoko } from "./profilaRedakto";
import { normigiSercxon } from "./sercxo";

const INTERFACAJ = ["eo", "es", "en"] as const;
const LANDKODOJ = Object.keys(mapo.landoj);

export type Interpreto =
  | { tipo: "lando"; lando: string }
  | { tipo: "loko"; lando: string; loko: ElektitaLoko }
  | { tipo: "intereso"; id: number }
  | { tipo: "lingvo"; kodo: string }
  | { tipo: "nomo"; nomo: string };

const kongruas = (n: string, nomo: string) => normigiSercxon(nomo) === n;

/** Normigita nomo → kodo, en ĉiuj interfacaj lingvoj. Konstruita unufoje por ĉiu servila instanco. */
function indekso(kodoj: string[], tipo: "region" | "language"): Map<string, string> {
  const m = new Map<string, string>();
  for (const kodo of kodoj) {
    m.set(kodo.toLowerCase(), kodo);
    for (const l of INTERFACAJ) {
      const nomo = normigiSercxon(nomoDe(tipo, kodo, l));
      if (nomo && !m.has(nomo)) m.set(nomo, kodo);
    }
  }
  return m;
}

let landIndekso: Map<string, string> | null = null;
let lingvIndekso: Map<string, string> | null = null;

export function trovuLandon(n: string): string | null {
  landIndekso ??= indekso(LANDKODOJ, "region");
  return landIndekso.get(n) ?? null;
}

export function trovuLingvon(n: string): string | null {
  lingvIndekso ??= indekso(Object.keys(LINGVONOMOJ), "language");
  return lingvIndekso.get(n) ?? null;
}

export function trovuIntereson(
  n: string,
  interesoj: { id: number; sxlosilo: string }[],
): number | null {
  for (const i of interesoj) {
    if (kongruas(n, i.sxlosilo)) return i.id;
    for (const l of INTERFACAJ) {
      if (kongruas(n, tradukiDinamike(l, `intereso.${i.sxlosilo}`, i.sxlosilo))) return i.id;
    }
  }
  return null;
}

export async function interpreti(
  db: D1Database,
  demando: string,
  interesoj: { id: number; sxlosilo: string }[],
): Promise<Interpreto | null> {
  const teksto = demando.replace(/\s+/g, " ").trim().slice(0, 60);
  const n = normigiSercxon(teksto);
  if (!n) return null;

  const lando = trovuLandon(n);
  if (lando) return { tipo: "lando", lando };

  const [urbo, regiono] = await db.batch<{ id: number | string; lando_kodo: string }>([
    db
      .prepare(
        `SELECT id, lando_kodo FROM (
           SELECT id, lando_kodo, logxantoj FROM urboj WHERE sercxnomo = ?1
           UNION ALL
           SELECT id, lando_kodo, logxantoj FROM urboj WHERE nomo_eo = ?2 COLLATE NOCASE
         ) ORDER BY logxantoj DESC LIMIT 1`,
      )
      .bind(n, teksto),
    db.prepare("SELECT id, lando_kodo FROM regionoj WHERE sercxnomo = ? LIMIT 1").bind(n),
  ]);
  const u = urbo.results[0];
  if (u) return { tipo: "loko", lando: u.lando_kodo, loko: { tipo: "urbo", id: Number(u.id) } };
  const r = regiono.results[0];
  if (r) return { tipo: "loko", lando: r.lando_kodo, loko: { tipo: "regiono", id: String(r.id) } };

  const intereso = trovuIntereson(n, interesoj);
  if (intereso !== null) return { tipo: "intereso", id: intereso };

  const lingvo = trovuLingvon(n);
  if (lingvo) return { tipo: "lingvo", kodo: lingvo };

  return { tipo: "nomo", nomo: teksto };
}
