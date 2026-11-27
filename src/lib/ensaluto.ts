/** La komuna fino de ĉiu ensaluta fluo, kaj la OAuth-ŝtato en kuketo. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { APIContext } from "astro";
import { estasLingvo } from "../i18n/tradukoj";
import { egalajSekure, hazardaJxetono, pkceDefio } from "./kripto";
import { aligxaKuketo, OAUTH_KUKETO, oauthKuketo, seancaKuketo } from "./kuketoj";
import { legiAgordojn, sekuraReveno } from "./provizantoj";
import {
  ALIGXA_KUKETO,
  kreiAtendantanAligxon,
  kreiSeancon,
  type Provizanto,
  SEANCA_KUKETO,
  trovuUzantonLauxIdenteco,
} from "./seancoj";

export const agordoj = () => legiAgordojn(env as unknown as Record<string, unknown>);

export function lingvoEl(valoro: string | null | undefined): string {
  return estasLingvo(valoro) ? valoro : "eo";
}

export function revokoUrl(konteksto: APIContext, provizanto: Provizanto): string {
  return new URL(`/auth/${provizanto}/revoko`, konteksto.url.origin).href;
}

interface OauthStato {
  provizanto: Provizanto;
  stato: string;
  kontrolilo: string;
  reveno: string | null;
  lingvo: string;
}

/** Kreas la ŝtaton kaj la PKCE-kontrolilon, kaj konservas ilin en mallongdaŭra kuketo. */
export async function komenciOauth(konteksto: APIContext, provizanto: Provizanto) {
  const stato: OauthStato = {
    provizanto,
    stato: hazardaJxetono(),
    kontrolilo: hazardaJxetono(48),
    reveno: sekuraReveno(konteksto.url.searchParams.get("reveno")),
    lingvo: lingvoEl(konteksto.url.searchParams.get("lingvo")),
  };
  konteksto.cookies.set(OAUTH_KUKETO, JSON.stringify(stato), oauthKuketo());
  return { stato: stato.stato, pkceDefio: await pkceDefio(stato.kontrolilo) };
}

/** Kontrolas la revenon de la provizanto; redonas la konservitan ŝtaton aŭ null. */
export function kontroliOauthRevenon(
  konteksto: APIContext,
  provizanto: Provizanto,
): (OauthStato & { kodo: string }) | null {
  const kuketo = konteksto.cookies.get(OAUTH_KUKETO)?.value;
  konteksto.cookies.delete(OAUTH_KUKETO, { path: "/" });
  if (!kuketo) return null;
  let stato: OauthStato;
  try {
    stato = JSON.parse(kuketo);
  } catch {
    return null;
  }
  const revenintaStato = konteksto.url.searchParams.get("state") ?? "";
  const kodo = konteksto.url.searchParams.get("code");
  if (stato.provizanto !== provizanto || !kodo) return null;
  if (!egalajSekure(stato.stato, revenintaStato)) return null;
  return { ...stato, kodo };
}

export function erarRedirekto(konteksto: APIContext, lingvo: string): Response {
  return konteksto.redirect(`${getRelativeLocaleUrl(lingvo, "ensaluti")}?eraro=1`, 303);
}

/**
 * Post konfirmita identeco: ensalutigas ekzistantan uzanton, aŭ sendas novulon
 * al la aliĝa formularo.
 */
export async function finiEnsaluton(
  konteksto: APIContext,
  p: { provizanto: Provizanto; eksteraId: string; lingvo: string; reveno: string | null },
): Promise<Response> {
  const uzantoId = await trovuUzantonLauxIdenteco(env.DB, p.provizanto, p.eksteraId);
  if (uzantoId) {
    const jxetono = await kreiSeancon(env.DB, uzantoId);
    konteksto.cookies.set(SEANCA_KUKETO, jxetono, seancaKuketo());
    return konteksto.redirect(p.reveno ?? getRelativeLocaleUrl(p.lingvo, ""), 303);
  }
  const jxetono = await kreiAtendantanAligxon(env.DB, p.provizanto, p.eksteraId);
  konteksto.cookies.set(ALIGXA_KUKETO, jxetono, aligxaKuketo());
  return konteksto.redirect(getRelativeLocaleUrl(p.lingvo, "aligxi"), 303);
}
