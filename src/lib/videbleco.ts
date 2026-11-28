/**
 * La videbleca filtrilo: la sola loko, kiu decidas, kion rigardanto rajtas vidi.
 * Vidu docs/fazo-2/arkitekturo.md kaj docs/fazo-2/minacmodelo.md (I2).
 *
 * Reguloj:
 * - "publika": ĉiuj vidas.
 * - "ensalutintoj": ensalutintoj, moderigantoj kaj la posedanto vidas.
 *   Vizitanto vidas, ke ligilo ekzistas (ĝian tipon), sed ne ĝian valoron.
 * - "kasxita": nur la posedanto vidas. Aliaj eĉ ne scias, ke ĝi ekzistas.
 * - Kromnomo, nivelo kaj lando estas ĉiam publikaj; regiono kaj urbo havas sian
 *   propran videblecon.
 * - La profilbildo havas sian propran videblecon. Bildo kaŝita de moderiganto
 *   estas videbla nur por la posedanto kaj moderigantoj.
 * - Profilo ne "aktiva" estas videbla nur por la posedanto kaj moderigantoj.
 *
 * La eligo estas konstruata kampon post kampo (permesa listo), neniam per
 * kopiado de la tuta objekto, por ke nova kampo en PlenaProfilo neniam likiĝu
 * aŭtomate.
 */

import type {
  LigilaTipo,
  Nivelo,
  PlenaProfilo,
  Regiono,
  Rigardanto,
  Urbo,
  Videbleco,
} from "./tipoj";

export type VideblaLigilo =
  | { tipo: LigilaTipo; sxlosita: false; valoro: string }
  | { tipo: LigilaTipo; sxlosita: true };

export interface VideblaProfilo {
  slug: string;
  kromnomo: string;
  nivelo: Nivelo;
  landoKodo: string | null;
  regiono: Regiono | null;
  urbo: Urbo | null;
  priskribo: string | null;
  lingvoj: string[];
  interesoj: string[];
  ligiloj: VideblaLigilo[];
  /** Adreso de la profilbildo (/bildo/<slug>?v=<versio>), aŭ null. */
  bildo: string | null;
  /** Vera, se la rigardanto vidus pli post ensaluto. */
  pliPostEnsaluto: boolean;
  estasPosedanto: boolean;
  /** Kaŝita de moderiganto. Nur la posedanto kaj moderigantoj ricevas tian profilon. */
  kasxita: boolean;
  gxisdatigita: number;
}

type Nivelo3 = "vidas" | "sxlosita" | "nevidebla";

function nivelo(videbleco: Videbleco, rigardanto: Rigardanto, estasPosedanto: boolean): Nivelo3 {
  if (estasPosedanto) return "vidas";
  switch (videbleco) {
    case "publika":
      return "vidas";
    case "ensalutintoj":
      return rigardanto.tipo === "vizitanto" ? "sxlosita" : "vidas";
    case "kasxita":
      return "nevidebla";
  }
}

export function filtriProfilon(
  profilo: PlenaProfilo,
  rigardanto: Rigardanto,
): VideblaProfilo | null {
  const estasPosedanto = rigardanto.tipo !== "vizitanto" && rigardanto.uzantoId === profilo.id;

  if (profilo.stato !== "aktiva" && !estasPosedanto && rigardanto.tipo !== "moderiganto") {
    return null;
  }

  let pliPostEnsaluto = false;
  const kampo = (videbleco: Videbleco): boolean => {
    const n = nivelo(videbleco, rigardanto, estasPosedanto);
    if (n === "sxlosita") pliPostEnsaluto = true;
    return n === "vidas";
  };

  const regionoVidebla = kampo(profilo.videbleco.regiono);
  const urboVidebla = kampo(profilo.videbleco.urbo);
  const priskriboVidebla = kampo(profilo.videbleco.priskribo);
  const lingvojVideblaj = kampo(profilo.videbleco.lingvoj);
  const interesojVideblaj = kampo(profilo.videbleco.interesoj);

  let bildo: string | null = null;
  if (profilo.bildo) {
    const permesita =
      !profilo.bildo.kasxitaDeModeriganto || estasPosedanto || rigardanto.tipo === "moderiganto";
    if (permesita && kampo(profilo.bildo.videbleco)) {
      bildo = `/bildo/${encodeURIComponent(profilo.slug)}?v=${profilo.bildo.versio}`;
    }
  }

  const ligiloj: VideblaLigilo[] = [];
  for (const ligilo of [...profilo.ligiloj].sort((a, b) => a.ordo - b.ordo)) {
    const n = nivelo(ligilo.videbleco, rigardanto, estasPosedanto);
    if (n === "vidas") {
      ligiloj.push({ tipo: ligilo.tipo, sxlosita: false, valoro: ligilo.valoro });
    } else if (n === "sxlosita") {
      pliPostEnsaluto = true;
      ligiloj.push({ tipo: ligilo.tipo, sxlosita: true });
    }
  }

  return {
    slug: profilo.slug,
    kromnomo: profilo.kromnomo,
    nivelo: profilo.nivelo,
    landoKodo: profilo.landoKodo,
    regiono: regionoVidebla && profilo.regiono ? { ...profilo.regiono } : null,
    urbo: urboVidebla && profilo.urbo ? { ...profilo.urbo } : null,
    priskribo: priskriboVidebla ? profilo.priskribo : null,
    lingvoj: lingvojVideblaj ? [...profilo.lingvoj] : [],
    interesoj: interesojVideblaj ? [...profilo.interesoj] : [],
    ligiloj,
    bildo,
    pliPostEnsaluto,
    estasPosedanto,
    kasxita: profilo.stato !== "aktiva",
    gxisdatigita: profilo.gxisdatigita,
  };
}
