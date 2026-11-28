/**
 * Serĉado de samideanoj. Vidu docs/sercxado.md.
 *
 * Privateca regulo: oni povas trovi personon per kampo NUR se la rigardanto
 * rajtas vidi tiun kampon. Alie la serĉo mem malkaŝus ĝin: se Lupe kaŝis sian
 * urbon, serĉo "Toluca" ne trovu ŝin, ĉar tio montrus, ke ŝi loĝas tie.
 * La kondiĉoj de videbleco estas en la SQL, ne post ĝi, por ke la nombro de
 * rezultoj ankaŭ ne likigu ion.
 *
 * Kromnomo, nivelo kaj lando estas ĉiam publikaj, do ili ne bezonas kondiĉon.
 */

import { analiziLokon, type ElektitaLoko } from "./profilaRedakto";
import { legiProfilojn } from "./profiloj";
import { NIVELOJ, type Nivelo, type Rigardanto, type Videbleco } from "./tipoj";
import { filtriProfilon, type VideblaProfilo } from "./videbleco";

export const PO_PAGXO = 20;
/** Pli profundaj paĝoj ne ekzistas: tio malfaciligas amasan elkopiadon. */
export const MAKS_PAGXOJ = 25;
const MAKS_ELEKTOJ = 10;

export interface Filtriloj {
  lando: string | null;
  loko: ElektitaLoko | null;
  niveloj: Nivelo[];
  interesoj: number[];
  lingvoj: string[];
  nomo: string;
  /** La teksto de la unu serĉkampo; la servilo interpretas ĝin (src/lib/demando.ts). */
  q: string;
  pagxo: number;
}

export const MALPLENAJ_FILTRILOJ: Filtriloj = {
  lando: null,
  loko: null,
  niveloj: [],
  interesoj: [],
  lingvoj: [],
  nomo: "",
  q: "",
  pagxo: 1,
};

const unikaj = <T>(a: T[]) => [...new Set(a)];

/** Legas la filtrilojn el la adreso. Toleras: nevalidajn valorojn ĝi simple ignoras. */
export function legiFiltrilojn(p: URLSearchParams): Filtriloj {
  const lando = (p.get("lando") ?? "").toUpperCase();
  const loko = analiziLokon(p.get("loko") ?? "");
  const pagxo = Number.parseInt(p.get("pagxo") ?? "1", 10);
  return {
    lando: /^[A-Z]{2}$/.test(lando) ? lando : null,
    loko: loko === "eraro" ? null : loko,
    niveloj: unikaj(p.getAll("nivelo").filter((n): n is Nivelo => NIVELOJ.includes(n as Nivelo))),
    interesoj: unikaj(
      p
        .getAll("intereso")
        .filter((i) => /^\d{1,4}$/.test(i))
        .map(Number),
    ).slice(0, MAKS_ELEKTOJ),
    lingvoj: unikaj(p.getAll("lingvo").filter((l) => /^[a-z]{2}$/.test(l))).slice(0, MAKS_ELEKTOJ),
    nomo: (p.get("nomo") ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
    q: (p.get("q") ?? "").replace(/\s+/g, " ").trim().slice(0, 60),
    pagxo: Number.isFinite(pagxo) ? Math.min(Math.max(pagxo, 1), MAKS_PAGXOJ) : 1,
  };
}

/** La inverso de legiFiltrilojn: por ligiloj (paĝoj, forigi filtrilon…). */
export function alSercxparametroj(f: Filtriloj, sxangxoj: Partial<Filtriloj> = {}): string {
  const g = { ...f, ...sxangxoj };
  const p = new URLSearchParams();
  if (g.lando) p.set("lando", g.lando);
  if (g.loko) p.set("loko", `${g.loko.tipo}:${g.loko.id}`);
  for (const n of g.niveloj) p.append("nivelo", n);
  for (const i of g.interesoj) p.append("intereso", String(i));
  for (const l of g.lingvoj) p.append("lingvo", l);
  if (g.nomo) p.set("nomo", g.nomo);
  if (g.q) p.set("q", g.q);
  if (g.pagxo > 1) p.set("pagxo", String(g.pagxo));
  return p.toString();
}

export const estasMalplena = (f: Filtriloj) =>
  !f.lando &&
  !f.loko &&
  f.niveloj.length === 0 &&
  f.interesoj.length === 0 &&
  f.lingvoj.length === 0 &&
  !f.nomo &&
  !f.q;

/** Kiujn videblecojn la rigardanto rajtas vidi ĉe aliaj profiloj. */
export function videblajNiveloj(r: Rigardanto): Videbleco[] {
  return r.tipo === "vizitanto" ? ["publika"] : ["publika", "ensalutintoj"];
}

const lokoj = (n: number) => Array.from({ length: n }, () => "?").join(", ");

/** Konstruas la WHERE-parton. Pura funkcio: ĉiuj valoroj iras kiel parametroj. */
export function konstruiKondicxojn(
  f: Filtriloj,
  r: Rigardanto,
): { kie: string; parametroj: (string | number)[] } {
  const vid = videblajNiveloj(r);
  const vidLokoj = lokoj(vid.length);
  const partoj = ["u.stato = 'aktiva'"];
  const parametroj: (string | number)[] = [];

  if (f.lando) {
    partoj.push("u.lando_kodo = ?");
    parametroj.push(f.lando);
  }
  if (f.loko?.tipo === "urbo") {
    partoj.push(`u.urbo_id = ? AND u.vid_urbo IN (${vidLokoj})`);
    parametroj.push(f.loko.id, ...vid);
  } else if (f.loko?.tipo === "regiono") {
    partoj.push(`u.regiono_id = ? AND u.vid_regiono IN (${vidLokoj})`);
    parametroj.push(f.loko.id, ...vid);
  }
  if (f.niveloj.length > 0) {
    partoj.push(`u.nivelo IN (${lokoj(f.niveloj.length)})`);
    parametroj.push(...f.niveloj);
  }
  if (f.interesoj.length > 0) {
    partoj.push(
      `u.vid_interesoj IN (${vidLokoj}) AND EXISTS (SELECT 1 FROM uzanto_interesoj ui
         WHERE ui.uzanto_id = u.id AND ui.interes_id IN (${lokoj(f.interesoj.length)}))`,
    );
    parametroj.push(...vid, ...f.interesoj);
  }
  if (f.lingvoj.length > 0) {
    partoj.push(
      `u.vid_lingvoj IN (${vidLokoj}) AND EXISTS (SELECT 1 FROM uzanto_lingvoj ul
         WHERE ul.uzanto_id = u.id AND ul.lingvo_kodo IN (${lokoj(f.lingvoj.length)}))`,
    );
    parametroj.push(...vid, ...f.lingvoj);
  }
  if (f.nomo) {
    partoj.push("u.kromnomo LIKE ? ESCAPE '\\'");
    parametroj.push(`%${f.nomo.replace(/[\\%_]/g, (s) => `\\${s}`)}%`);
  }
  return { kie: partoj.join("\n   AND "), parametroj };
}

export interface SercxRezulto {
  nombro: number;
  profiloj: VideblaProfilo[];
  pagxoj: number;
}

export async function sercxi(db: D1Database, f: Filtriloj, r: Rigardanto): Promise<SercxRezulto> {
  const { kie, parametroj } = konstruiKondicxojn(f, r);
  const [nombroj, idoj] = await db.batch<{ n: number } | { id: string }>([
    db.prepare(`SELECT count(*) AS n FROM uzantoj u WHERE ${kie}`).bind(...parametroj),
    db
      .prepare(
        `SELECT u.id FROM uzantoj u WHERE ${kie}
          ORDER BY u.gxisdatigita DESC, u.id LIMIT ? OFFSET ?`,
      )
      .bind(...parametroj, PO_PAGXO, (f.pagxo - 1) * PO_PAGXO),
  ]);
  const nombro = (nombroj.results[0] as { n: number } | undefined)?.n ?? 0;
  const plenaj = await legiProfilojn(
    db,
    (idoj.results as { id: string }[]).map((v) => v.id),
  );
  return {
    nombro,
    // La filtrilo ankoraŭ decidas, kion montri en ĉiu karto.
    profiloj: plenaj.flatMap((p) => filtriProfilon(p, r) ?? []),
    pagxoj: Math.min(Math.ceil(nombro / PO_PAGXO), MAKS_PAGXOJ),
  };
}
