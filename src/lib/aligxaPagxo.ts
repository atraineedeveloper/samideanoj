/** La logiko de la aliĝa paĝo, komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { type AligxaEraro, kreiUzanton, validigiAligxon } from "./aligxo";
import { seancaKuketo } from "./kuketoj";
import { kontroliLokon, landoj } from "./lokoj";
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
  lando: string;
  landoj: string[];
}

export async function traktiAligxon(Astro: AstroGlobal): Promise<Response | AligxaStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const jxetono = Astro.cookies.get(ALIGXA_KUKETO)?.value;
  const atendanta = jxetono ? await legiAtendantanAligxon(env.DB, jxetono) : null;

  if (!jxetono || !atendanta) {
    Astro.cookies.delete(ALIGXA_KUKETO, { path: "/" });
    return Astro.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?eraro=eksvalidigxis`, 303);
  }

  const cxiujLandoj = await landoj(env.DB);
  if (Astro.request.method !== "POST") {
    return { eraroj: [], kromnomo: "", nivelo: "", lando: "", landoj: cxiujLandoj };
  }

  const formularo = await Astro.request.formData();
  const kromnomo = formularo.get("kromnomo");
  const nivelo = formularo.get("nivelo");
  const lando = formularo.get("lando");
  const valida = validigiAligxon(kromnomo, nivelo, formularo.get("agxo"), lando);
  const rezulto =
    valida.bone && !(await kontroliLokon(env.DB, valida.lando, null))
      ? { bone: false as const, eraroj: ["lando" as const] }
      : valida;

  if (!rezulto.bone) {
    Astro.response.status = 422;
    return {
      eraroj: rezulto.eraroj,
      kromnomo: typeof kromnomo === "string" ? kromnomo.slice(0, 60) : "",
      nivelo: typeof nivelo === "string" ? nivelo : "",
      lando: typeof lando === "string" ? lando : "",
      landoj: cxiujLandoj,
    };
  }

  const { id, slug } = await kreiUzanton(env.DB, {
    provizanto: atendanta.provizanto,
    eksteraId: atendanta.eksteraId,
    kromnomo: rezulto.kromnomo,
    nivelo: rezulto.nivelo,
    lando: rezulto.lando,
  });
  await forigiAtendantanAligxon(env.DB, jxetono);
  Astro.cookies.delete(ALIGXA_KUKETO, { path: "/" });
  Astro.cookies.set(SEANCA_KUKETO, await kreiSeancon(env.DB, id), seancaKuketo());

  return Astro.redirect(getRelativeLocaleUrl(lingvo, `s/${slug}`), 303);
}
