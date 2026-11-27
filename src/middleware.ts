import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { seancaKuketo } from "./lib/kuketoj";
import { legiSeancon, SEANCA_KUKETO } from "./lib/seancoj";

const SEKURAJ_METODOJ = new Set(["GET", "HEAD", "OPTIONS"]);

/**
 * Protekto kontraŭ CSRF (ADR 0004): ĉiu peto kiu ŝanĝas datumojn devas havi
 * Origin-kapon egalan al nia propra origino. Retumiloj ĉiam sendas ĝin ĉe POST;
 * peto sen ĝi estas rifuzita.
 */
export function originoValidas(peto: Request, nia: URL): boolean {
  if (SEKURAJ_METODOJ.has(peto.method)) return true;
  return peto.headers.get("Origin") === nia.origin;
}

/** Kontrolas la originon kaj identigas la rigardanton de ĉiu peto el la seanca kuketo. */
export const onRequest = defineMiddleware(async (konteksto, sekva) => {
  if (!originoValidas(konteksto.request, konteksto.url)) {
    return new Response("Malpermesita", { status: 403 });
  }

  konteksto.locals.uzanto = null;
  konteksto.locals.rigardanto = { tipo: "vizitanto" };

  const jxetono = konteksto.cookies.get(SEANCA_KUKETO)?.value;
  if (jxetono) {
    const seanco = await legiSeancon(env.DB, jxetono);
    if (seanco) {
      const { uzanto } = seanco;
      konteksto.locals.uzanto = uzanto;
      konteksto.locals.rigardanto =
        uzanto.rolo === "uzanto"
          ? { tipo: "ensalutinto", uzantoId: uzanto.id }
          : { tipo: "moderiganto", uzantoId: uzanto.id };
      if (seanco.renovigita) {
        konteksto.cookies.set(SEANCA_KUKETO, jxetono, seancaKuketo());
      }
    } else {
      konteksto.cookies.delete(SEANCA_KUKETO, { path: "/" });
    }
  }

  const respondo = await sekva();
  // Paĝoj kun personaj datumoj ne estu konservataj de komunaj kaŝmemoroj.
  if (konteksto.locals.uzanto) respondo.headers.set("Cache-Control", "private, no-store");
  return respondo;
});
