/** La logiko de la paĝo "Mia profilo", komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { kontroliLokon } from "./lokoj";
import { konserviProfilon, type ProfilaEraro, validigiProfilon } from "./profilaRedakto";
import { legiProfilonLauxId } from "./profiloj";
import type { PlenaProfilo } from "./tipoj";

export interface RedaktajValoroj {
  kromnomo: string;
  nivelo: string;
  priskribo: string;
  lando: string;
  loko: string;
  lokoEtikedo: string;
  vid_regiono: string;
  vid_urbo: string;
  vid_priskribo: string;
  vid_lingvoj: string;
  vid_interesoj: string;
  lingvoj: string[];
  interesoj: string[];
  ligiloj: { tipo: string; valoro: string; videbleco: string }[];
}

export interface RedaktaStato {
  valoroj: RedaktajValoroj;
  eraroj: ProfilaEraro[];
  slug: string;
}

function valorojElProfilo(p: PlenaProfilo, interesIdoj: Map<string, number>): RedaktajValoroj {
  const loko = p.urbo ? `urbo:${p.urbo.id}` : p.regiono ? `regiono:${p.regiono.id}` : "";
  const lokoEtikedo = p.urbo
    ? [p.urbo.nomo, p.regiono?.nomo].filter(Boolean).join(", ")
    : (p.regiono?.nomo ?? "");
  return {
    kromnomo: p.kromnomo,
    nivelo: p.nivelo,
    priskribo: p.priskribo ?? "",
    lando: p.landoKodo ?? "",
    loko,
    lokoEtikedo,
    vid_regiono: p.videbleco.regiono,
    vid_urbo: p.videbleco.urbo,
    vid_priskribo: p.videbleco.priskribo,
    vid_lingvoj: p.videbleco.lingvoj,
    vid_interesoj: p.videbleco.interesoj,
    lingvoj: p.lingvoj,
    interesoj: p.interesoj
      .map((s) => interesIdoj.get(s))
      .filter((id): id is number => id !== undefined)
      .map(String),
    ligiloj: p.ligiloj.map((l) => ({ tipo: l.tipo, valoro: l.valoro, videbleco: l.videbleco })),
  };
}

function valorojElFormularo(f: FormData): RedaktajValoroj {
  const s = (k: string) => {
    const v = f.get(k);
    return typeof v === "string" ? v.slice(0, 1000) : "";
  };
  const cxiuj = (k: string) => f.getAll(k).filter((v): v is string => typeof v === "string");
  const tipoj = cxiuj("ligilo_tipo");
  const valoroj = cxiuj("ligilo_valoro");
  const videblecoj = cxiuj("ligilo_videbleco");
  return {
    kromnomo: s("kromnomo"),
    nivelo: s("nivelo"),
    priskribo: s("priskribo"),
    lando: s("lando"),
    loko: s("loko"),
    lokoEtikedo: s("loko_etikedo"),
    vid_regiono: s("vid_regiono"),
    vid_urbo: s("vid_urbo"),
    vid_priskribo: s("vid_priskribo"),
    vid_lingvoj: s("vid_lingvoj"),
    vid_interesoj: s("vid_interesoj"),
    lingvoj: cxiuj("lingvoj"),
    interesoj: cxiuj("interesoj"),
    ligiloj: tipoj
      .slice(0, 50)
      .map((tipo, i) => ({ tipo, valoro: valoroj[i] ?? "", videbleco: videblecoj[i] ?? "" })),
  };
}

export async function interesojElDb(db: D1Database) {
  const { results } = await db
    .prepare("SELECT id, sxlosilo FROM interesoj ORDER BY id")
    .all<{ id: number; sxlosilo: string }>();
  return results;
}

export async function traktiRedakton(Astro: AstroGlobal): Promise<Response | RedaktaStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const uzanto = Astro.locals.uzanto;
  if (!uzanto) {
    const reveno = encodeURIComponent(Astro.url.pathname);
    return Astro.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?reveno=${reveno}`, 303);
  }

  if (Astro.request.method !== "POST") {
    const [profilo, interesoj] = await Promise.all([
      legiProfilonLauxId(env.DB, uzanto.id),
      interesojElDb(env.DB),
    ]);
    if (!profilo) return Astro.redirect(getRelativeLocaleUrl(lingvo, ""), 303);
    const idoj = new Map(interesoj.map((i) => [i.sxlosilo, i.id]));
    return { valoroj: valorojElProfilo(profilo, idoj), eraroj: [], slug: uzanto.slug };
  }

  const formularo = await Astro.request.formData();
  const rezulto = validigiProfilon(formularo);
  const malsukceso = (eraroj: ProfilaEraro[]): RedaktaStato => {
    Astro.response.status = 422;
    return { valoroj: valorojElFormularo(formularo), eraroj, slug: uzanto.slug };
  };

  if (!rezulto.bone) return malsukceso(rezulto.eraroj);

  const loko = await kontroliLokon(env.DB, rezulto.datumoj.lando, rezulto.datumoj.loko);
  if (!loko) return malsukceso([{ kampo: rezulto.datumoj.loko ? "loko" : "lando" }]);

  const konservita = await konserviProfilon(env.DB, uzanto.id, rezulto.datumoj, loko);
  if (!konservita) return malsukceso([{ kampo: "interesoj" }]);

  return Astro.redirect(`${getRelativeLocaleUrl(lingvo, `s/${uzanto.slug}`)}?konservita=1`, 303);
}
