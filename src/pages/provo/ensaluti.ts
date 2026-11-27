import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { lingvoEl } from "../../lib/ensaluto";
import { seancaKuketo } from "../../lib/kuketoj";
import { ekzemplaUzantoId, provaEnsalutoPermesita } from "../../lib/provaEnsaluto";
import { kreiSeancon, SEANCA_KUKETO } from "../../lib/seancoj";

/** Ensaluti kiel ekzempla uzanto. Nur loke kaj en la provmedio; aliloke 404. */
export const POST: APIRoute = async (konteksto) => {
  if (!provaEnsalutoPermesita(env as unknown as Record<string, unknown>)) {
    return new Response(null, { status: 404 });
  }
  const formularo = await konteksto.request.formData();
  const slug = formularo.get("slug");
  const lingvo = lingvoEl(formularo.get("lingvo")?.toString());
  const id = typeof slug === "string" ? await ekzemplaUzantoId(env.DB, slug) : null;
  if (!id || typeof slug !== "string") return new Response(null, { status: 404 });

  konteksto.cookies.set(SEANCA_KUKETO, await kreiSeancon(env.DB, id), seancaKuketo());
  return konteksto.redirect(getRelativeLocaleUrl(lingvo, `s/${slug}`), 303);
};
