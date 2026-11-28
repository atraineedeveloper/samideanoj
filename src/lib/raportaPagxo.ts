/** La logiko de la paĝo "Raporti profilon", komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { legiProfilonLauxSlug } from "./profiloj";
import { type RaportaEraro, raporti, validigiRaporton } from "./raportoj";
import { filtriProfilon } from "./videbleco";

export interface RaportaStato {
  kromnomo: string;
  slug: string;
  kialo: string;
  komento: string;
  eraro: RaportaEraro | "limo" | null;
}

export async function traktiRaporton(Astro: AstroGlobal): Promise<Response | RaportaStato | null> {
  const lingvo = Astro.currentLocale ?? "eo";
  const uzanto = Astro.locals.uzanto;
  if (!uzanto) {
    const reveno = encodeURIComponent(Astro.url.pathname);
    return Astro.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?reveno=${reveno}`, 303);
  }

  const plena = await legiProfilonLauxSlug(env.DB, Astro.params.slug ?? "");
  const videbla = plena ? filtriProfilon(plena, Astro.locals.rigardanto) : null;
  if (!plena || !videbla) return null;
  const profilUrl = getRelativeLocaleUrl(lingvo, `s/${plena.slug}`);
  if (videbla.estasPosedanto) return Astro.redirect(profilUrl, 303);

  const stato: RaportaStato = {
    kromnomo: plena.kromnomo,
    slug: plena.slug,
    kialo: "",
    komento: "",
    eraro: null,
  };
  if (Astro.request.method !== "POST") return stato;

  const f = await Astro.request.formData();
  const kialo = f.get("kialo");
  const komento = f.get("komento");
  stato.kialo = typeof kialo === "string" ? kialo : "";
  stato.komento = typeof komento === "string" ? komento.slice(0, 2000) : "";

  const v = validigiRaporton(kialo, komento);
  if (!v.bone) {
    Astro.response.status = 422;
    return { ...stato, eraro: v.eraro };
  }
  const rezulto = await raporti(env.DB, {
    raportantoId: uzanto.id,
    profiloId: plena.id,
    kialo: v.kialo,
    komento: v.komento,
  });
  if (rezulto === "limo") {
    Astro.response.status = 429;
    return { ...stato, eraro: "limo" };
  }
  return Astro.redirect(`${profilUrl}?raportita=1`, 303);
}
