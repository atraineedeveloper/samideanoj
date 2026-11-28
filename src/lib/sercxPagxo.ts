/**
 * La logiko de la hejmpaĝo kaj de la serĉado, komuna por ĉiuj lingvoj.
 * Kiel en la prototipo, la hejmpaĝo ĉe labortablo JAM estas la serĉado (rezultoj
 * kaj mapo flank-al-flanke); en poŝtelefono ĝi montras nur la mapon.
 */

import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { type Interpreto, interpreti } from "./demando";
import { legiNombrojn, type MapajNombroj } from "./mapo";
import { interesojElDb } from "./redaktaPagxo";
import { type Filtriloj, legiFiltrilojn, type SercxRezulto, sercxi } from "./sercxado";

export interface SercxStato {
  /** La filtriloj kiel en la adreso (por la ligiloj kaj la "pilolojn" forigeblajn). */
  filtriloj: Filtriloj;
  /** La filtriloj vere uzitaj, post la interpreto de la serĉkampo. */
  efektivaj: Filtriloj;
  interpreto: Interpreto | null;
  rezulto: SercxRezulto;
  nombroj: MapajNombroj;
  /** Nomo de la elektita urbo aŭ regiono, por la titolo. */
  lokoNomo: string;
  interesoj: { id: number; sxlosilo: string }[];
}

async function lokaNomo(db: D1Database, f: Filtriloj, lingvo: string) {
  if (f.loko?.tipo === "urbo") {
    const u = await db
      .prepare("SELECT nomo, nomo_eo FROM urboj WHERE id = ?")
      .bind(f.loko.id)
      .first<{ nomo: string; nomo_eo: string | null }>();
    return u ? (lingvo === "eo" ? (u.nomo_eo ?? u.nomo) : u.nomo) : "";
  }
  if (f.loko?.tipo === "regiono") {
    const g = await db
      .prepare("SELECT nomo FROM regionoj WHERE id = ?")
      .bind(f.loko.id)
      .first<{ nomo: string }>();
    return g?.nomo ?? "";
  }
  return "";
}

/** Aplikas la interpreton de la serĉkampo al la filtriloj. */
export function apliki(f: Filtriloj, i: Interpreto | null): Filtriloj {
  if (!i) return f;
  switch (i.tipo) {
    case "lando":
      return { ...f, lando: i.lando, loko: null };
    case "loko":
      return { ...f, lando: i.lando, loko: i.loko };
    case "intereso":
      return { ...f, interesoj: [...new Set([...f.interesoj, i.id])] };
    case "lingvo":
      return { ...f, lingvoj: [...new Set([...f.lingvoj, i.kodo])] };
    case "nomo":
      return { ...f, nomo: i.nomo };
  }
}

export async function sxargiSercxon(Astro: AstroGlobal): Promise<SercxStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const filtriloj = legiFiltrilojn(Astro.url.searchParams);
  const interesoj = await interesojElDb(env.DB);
  const interpreto = filtriloj.q ? await interpreti(env.DB, filtriloj.q, interesoj) : null;
  const efektivaj = apliki(filtriloj, interpreto);

  const [rezulto, nombroj, lokoNomo] = await Promise.all([
    sercxi(env.DB, efektivaj, Astro.locals.rigardanto),
    legiNombrojn(env.DB),
    lokaNomo(env.DB, efektivaj, lingvo),
  ]);
  return { filtriloj, efektivaj, interpreto, rezulto, nombroj, lokoNomo, interesoj };
}
