/** La logiko de la serĉa paĝo, komuna por ĉiuj lingvoj. */

import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { legiNombrojn, type MapajNombroj } from "./mapo";
import { interesojElDb } from "./redaktaPagxo";
import { type Filtriloj, legiFiltrilojn, type SercxRezulto, sercxi } from "./sercxado";

export interface SercxStato {
  filtriloj: Filtriloj;
  rezulto: SercxRezulto;
  nombroj: MapajNombroj;
  /** Nomo de la elektita urbo aŭ regiono, por la titolo kaj la serĉilo. */
  lokoNomo: string;
  lokoEtikedo: string;
  landKodoj: string[];
  interesoj: { id: number; sxlosilo: string }[];
}

async function lokaNomo(db: D1Database, f: Filtriloj, lingvo: string) {
  if (f.loko?.tipo === "urbo") {
    const u = await db
      .prepare(
        `SELECT r.nomo, r.nomo_eo, g.nomo AS regiono FROM urboj r
           LEFT JOIN regionoj g ON g.id = r.regiono_id WHERE r.id = ?`,
      )
      .bind(f.loko.id)
      .first<{ nomo: string; nomo_eo: string | null; regiono: string | null }>();
    if (!u) return { nomo: "", etikedo: "" };
    const nomo = lingvo === "eo" ? (u.nomo_eo ?? u.nomo) : u.nomo;
    return { nomo, etikedo: [u.nomo, u.regiono].filter(Boolean).join(", ") };
  }
  if (f.loko?.tipo === "regiono") {
    const g = await db
      .prepare("SELECT nomo FROM regionoj WHERE id = ?")
      .bind(f.loko.id)
      .first<{ nomo: string }>();
    return { nomo: g?.nomo ?? "", etikedo: g?.nomo ?? "" };
  }
  return { nomo: "", etikedo: "" };
}

export async function sxargiSercxon(Astro: AstroGlobal): Promise<SercxStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const filtriloj = legiFiltrilojn(Astro.url.searchParams);
  const [rezulto, nombroj, loko, interesoj] = await Promise.all([
    sercxi(env.DB, filtriloj, Astro.locals.rigardanto),
    legiNombrojn(env.DB),
    lokaNomo(env.DB, filtriloj, lingvo),
    interesojElDb(env.DB),
  ]);
  // Nur landoj kun samideanoj (el la kaŝmemoro de la mapo: neniu plia legado).
  const landKodoj = Object.keys(nombroj.landoj);
  if (filtriloj.lando && !landKodoj.includes(filtriloj.lando)) landKodoj.push(filtriloj.lando);
  return {
    filtriloj,
    rezulto,
    nombroj,
    lokoNomo: loko.nomo,
    lokoEtikedo: loko.etikedo,
    landKodoj,
    interesoj,
  };
}
