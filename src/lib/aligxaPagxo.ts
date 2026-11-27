/** La logiko de la aliĝa paĝo, komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { type AligxaEraro, kreiUzanton, validigiAligxon } from "./aligxo";
import { seancaKuketo } from "./kuketoj";
import {
  ALIGXA_KUKETO,
  forigiAtendantanAligxon,
  kreiSeancon,
  legiAtendantanAligxon,
  SEANCA_KUKETO,
} from "./seancoj";

export interface AligxaStato {
  eraroj: AligxaEraro[];
  kromnomo: string;
  nivelo: string;
}

export async function traktiAligxon(Astro: AstroGlobal): Promise<Response | AligxaStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const jxetono = Astro.cookies.get(ALIGXA_KUKETO)?.value;
  const atendanta = jxetono ? await legiAtendantanAligxon(env.DB, jxetono) : null;

  if (!jxetono || !atendanta) {
    Astro.cookies.delete(ALIGXA_KUKETO, { path: "/" });
    return Astro.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?eraro=eksvalidigxis`, 303);
  }

  if (Astro.request.method !== "POST") return { eraroj: [], kromnomo: "", nivelo: "" };

  const formularo = await Astro.request.formData();
  const kromnomo = formularo.get("kromnomo");
  const nivelo = formularo.get("nivelo");
  const rezulto = validigiAligxon(kromnomo, nivelo, formularo.get("agxo"));

  if (!rezulto.bone) {
    Astro.response.status = 422;
    return {
      eraroj: rezulto.eraroj,
      kromnomo: typeof kromnomo === "string" ? kromnomo.slice(0, 60) : "",
      nivelo: typeof nivelo === "string" ? nivelo : "",
    };
  }

  const { id, slug } = await kreiUzanton(env.DB, {
    provizanto: atendanta.provizanto,
    eksteraId: atendanta.eksteraId,
    kromnomo: rezulto.kromnomo,
    nivelo: rezulto.nivelo,
  });
  await forigiAtendantanAligxon(env.DB, jxetono);
  Astro.cookies.delete(ALIGXA_KUKETO, { path: "/" });
  Astro.cookies.set(SEANCA_KUKETO, await kreiSeancon(env.DB, id), seancaKuketo());

  return Astro.redirect(getRelativeLocaleUrl(lingvo, `s/${slug}`), 303);
}
