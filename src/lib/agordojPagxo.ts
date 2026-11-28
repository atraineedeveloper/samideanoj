/** La logiko de la paĝo "Agordoj de la konto", komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import { elsalutiCxie, forigiKonton, konfirmoValidas } from "./konto";
import { SEANCA_KUKETO } from "./seancoj";

export interface AgordojStato {
  kromnomo: string;
  eraro: "konfirmo" | null;
}

export async function traktiAgordojn(Astro: AstroGlobal): Promise<Response | AgordojStato> {
  const lingvo = Astro.currentLocale ?? "eo";
  const uzanto = Astro.locals.uzanto;
  if (!uzanto) {
    const reveno = encodeURIComponent(Astro.url.pathname);
    return Astro.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?reveno=${reveno}`, 303);
  }
  if (Astro.request.method !== "POST") return { kromnomo: uzanto.kromnomo, eraro: null };

  const f = await Astro.request.formData();
  const ago = f.get("ago");
  const hejmo = getRelativeLocaleUrl(lingvo, "");

  if (ago === "elsaluti-cxie") {
    await elsalutiCxie(env.DB, uzanto.id);
    Astro.cookies.delete(SEANCA_KUKETO, { path: "/" });
    return Astro.redirect(`${hejmo}?elsalutita=1`, 303);
  }

  if (ago === "forigi") {
    const konfirmo = f.get("konfirmo");
    if (typeof konfirmo !== "string" || !konfirmoValidas(konfirmo, uzanto.kromnomo)) {
      Astro.response.status = 422;
      return { kromnomo: uzanto.kromnomo, eraro: "konfirmo" };
    }
    await forigiKonton(env.DB, uzanto.id);
    Astro.cookies.delete(SEANCA_KUKETO, { path: "/" });
    return Astro.redirect(`${hejmo}?forigita=1`, 303);
  }

  Astro.response.status = 400;
  return { kromnomo: uzanto.kromnomo, eraro: null };
}
