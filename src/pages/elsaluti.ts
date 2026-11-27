import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { lingvoEl } from "../lib/ensaluto";
import { forigiSeancon, SEANCA_KUKETO } from "../lib/seancoj";

/** Elsaluto. Nur POST; Astro kontrolas la Origin-kapon kontraŭ CSRF. */
export const POST: APIRoute = async (konteksto) => {
  const jxetono = konteksto.cookies.get(SEANCA_KUKETO)?.value;
  if (jxetono) await forigiSeancon(env.DB, jxetono);
  konteksto.cookies.delete(SEANCA_KUKETO, { path: "/" });
  const formularo = await konteksto.request.formData().catch(() => null);
  const lingvo = lingvoEl(formularo?.get("lingvo")?.toString());
  return konteksto.redirect(getRelativeLocaleUrl(lingvo, ""), 303);
};
