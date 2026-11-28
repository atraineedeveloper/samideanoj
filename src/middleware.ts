import { defineMiddleware } from "astro:middleware";
import { env } from "cloudflare:workers";
import { tradukilo } from "./i18n/tradukoj";
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

/**
 * Sekurecaj kapoj por ĉiu respondo (OWASP A05). La CSP por skriptoj kaj stiloj
 * venas kiel <meta> de Astro (astro.config.mjs); ĉi tie nur tio, kion <meta>
 * ne povas: frame-ancestors (kontraŭ clickjacking) kaj la ceteraj kapoj.
 * Respondo kun propra CSP (ekz. /bildo, aŭ la paĝoj de Astro) gardas ĝin,
 * kun frame-ancestors aldonita.
 */
export const SEKURECAJ_KAPOJ: Record<string, string> = {
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  "Strict-Transport-Security": "max-age=31536000",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
};

export function aldoniSekurecajnKapojn(kapoj: Headers): void {
  for (const [nomo, valoro] of Object.entries(SEKURECAJ_KAPOJ)) {
    if (!kapoj.has(nomo)) kapoj.set(nomo, valoro);
  }
  // Astro jam sendas sian CSP por la paĝoj: ni aldonas frame-ancestors al ĝi.
  const csp = kapoj.get("Content-Security-Policy") ?? "";
  if (!csp.includes("frame-ancestors")) {
    kapoj.set("Content-Security-Policy", `${csp.replace(/[\s;]+$/, "")}; frame-ancestors 'none'`);
  }
}

/**
 * Vojoj, kiuj montras profilojn: ili havas rapidlimon por ĉiu IP-adreso, por
 * malfaciligi amasan elkopiadon kaj protekti la ĉiutagan limon de D1.
 */
export function limigendaVojo(vojo: string): boolean {
  return /^\/(?:(?:es|en)\/)?(?:sercxi\/?$|s\/)/.test(vojo);
}

function troMultajPetoj(lingvo: string | undefined): Response {
  const t = tradukilo(lingvo);
  const teksto = t("sercxi.tro-multaj");
  return new Response(
    `<!doctype html><html lang="${lingvo ?? "eo"}"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>429</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.25rem"><h1>${t("retejo.nomo")}</h1><p>${teksto}</p></body></html>`,
    {
      status: 429,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "60",
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Kontrolas la originon kaj identigas la rigardanton de ĉiu peto el la seanca kuketo. */
export const onRequest = defineMiddleware(async (konteksto, sekva) => {
  if (!originoValidas(konteksto.request, konteksto.url)) {
    const r = new Response("Malpermesita", { status: 403 });
    aldoniSekurecajnKapojn(r.headers);
    return r;
  }

  const ip = konteksto.request.headers.get("CF-Connecting-IP") ?? "nekonata";
  if (limigendaVojo(konteksto.url.pathname) && env.PROFILA_LIMIGILO) {
    const { success } = await env.PROFILA_LIMIGILO.limit({ key: ip });
    if (!success) {
      const r = troMultajPetoj(konteksto.currentLocale);
      aldoniSekurecajnKapojn(r.headers);
      return r;
    }
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

  // Skriboj: limo por konto (aŭ IP sen seanco), por protekti la ĉiutagan limon de D1.
  if (!SEKURAJ_METODOJ.has(konteksto.request.method) && env.SKRIBA_LIMIGILO) {
    const sxlosilo = konteksto.locals.uzanto ? `u:${konteksto.locals.uzanto.id}` : `ip:${ip}`;
    const { success } = await env.SKRIBA_LIMIGILO.limit({ key: sxlosilo });
    if (!success) {
      const r = troMultajPetoj(konteksto.currentLocale);
      aldoniSekurecajnKapojn(r.headers);
      return r;
    }
  }

  let respondo = await sekva();
  try {
    aldoniSekurecajnKapojn(respondo.headers);
  } catch {
    // Kelkaj respondoj (ekz. Response.redirect) havas neŝanĝeblajn kapojn.
    respondo = new Response(respondo.body, respondo);
    aldoniSekurecajnKapojn(respondo.headers);
  }
  // Paĝoj kun personaj datumoj ne estu konservataj de komunaj kaŝmemoroj.
  // Respondo, kiu jam deklaris sin "private" (ekz. profilbildo), gardas sian agordon.
  const kasxmemoro = respondo.headers.get("Cache-Control") ?? "";
  if (konteksto.locals.uzanto && !kasxmemoro.startsWith("private")) {
    respondo.headers.set("Cache-Control", "private, no-store");
  }
  return respondo;
});
