/**
 * Ensaluto per Google, GitHub kaj Telegramo. Vidu ADR 0004 kaj ADR 0006.
 *
 * Reguloj de ADR 0006, kontrolataj de tests/provizantoj.test.ts:
 * - Google: nur la skopo "openid".
 * - GitHub: neniu skopo.
 * - Telegramo: neniam "request_access".
 * - Alirĵetonoj estas uzataj unufoje kaj neniam konservataj.
 */

import { egalajSekure, hmacSha256Hex, sha256Bajtoj } from "./kripto";

export interface Agordoj {
  google?: { klientoId: string; klientoSekreto: string };
  github?: { klientoId: string; klientoSekreto: string };
  telegramo?: { robotoNomo: string; robotoJxetono: string };
}

/** Legas la agordojn el la medio. Provizanto sen kompleta agordo estas simple malŝaltita. */
export function legiAgordojn(medio: Record<string, unknown>): Agordoj {
  const s = (sxlosilo: string) => {
    const v = medio[sxlosilo];
    return typeof v === "string" && v.trim() ? v.trim() : undefined;
  };
  const agordoj: Agordoj = {};
  const gId = s("GOOGLE_CLIENT_ID");
  const gSekreto = s("GOOGLE_CLIENT_SECRET");
  if (gId && gSekreto) agordoj.google = { klientoId: gId, klientoSekreto: gSekreto };
  const hId = s("GITHUB_CLIENT_ID");
  const hSekreto = s("GITHUB_CLIENT_SECRET");
  if (hId && hSekreto) agordoj.github = { klientoId: hId, klientoSekreto: hSekreto };
  const tNomo = s("TELEGRAM_BOT_NAME");
  const tJxetono = s("TELEGRAM_BOT_TOKEN");
  if (tNomo && tJxetono) agordoj.telegramo = { robotoNomo: tNomo, robotoJxetono: tJxetono };
  return agordoj;
}

// ── Google ────────────────────────────────────────────────────────────────

export function googleRajtigaUrl(p: {
  klientoId: string;
  revokoUrl: string;
  stato: string;
  pkceDefio: string;
}): string {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: p.klientoId,
    redirect_uri: p.revokoUrl,
    response_type: "code",
    scope: "openid",
    state: p.stato,
    code_challenge: p.pkceDefio,
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();
  return url.href;
}

/** Kontrolas la asertojn de identiga ĵetono de Google kaj redonas la identigilon `sub`. */
export function googleSubElIdJxetono(
  idJxetono: string,
  klientoId: string,
  nunSekundoj: number,
): string | null {
  const partoj = idJxetono.split(".");
  if (partoj.length !== 3) return null;
  let asertoj: { iss?: unknown; aud?: unknown; exp?: unknown; sub?: unknown };
  try {
    const json = atob(partoj[1].replace(/-/g, "+").replace(/_/g, "/"));
    asertoj = JSON.parse(json);
  } catch {
    return null;
  }
  const iss = asertoj.iss;
  if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") return null;
  if (asertoj.aud !== klientoId) return null;
  if (typeof asertoj.exp !== "number" || asertoj.exp < nunSekundoj) return null;
  if (typeof asertoj.sub !== "string" || !/^[0-9]{1,64}$/.test(asertoj.sub)) return null;
  return asertoj.sub;
}

/**
 * Interŝanĝas la kodon kontraŭ identiga ĵetono rekte ĉe Google (per TLS), do
 * la subskribo de la ĵetono ne bezonas aldonan kontrolon (OpenID Connect 3.1.3.7).
 */
export async function googleIdentigilo(p: {
  klientoId: string;
  klientoSekreto: string;
  revokoUrl: string;
  kodo: string;
  pkceKontrolilo: string;
  nunSekundoj: number;
}): Promise<string | null> {
  const respondo = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: p.kodo,
      client_id: p.klientoId,
      client_secret: p.klientoSekreto,
      redirect_uri: p.revokoUrl,
      grant_type: "authorization_code",
      code_verifier: p.pkceKontrolilo,
    }),
  });
  if (!respondo.ok) return null;
  const datumoj = (await respondo.json()) as { id_token?: unknown };
  if (typeof datumoj.id_token !== "string") return null;
  // Nur la identiga ĵetono estas legata; la alirĵetono estas forĵetita.
  return googleSubElIdJxetono(datumoj.id_token, p.klientoId, p.nunSekundoj);
}

// ── GitHub ────────────────────────────────────────────────────────────────

export function githubRajtigaUrl(p: {
  klientoId: string;
  revokoUrl: string;
  stato: string;
  pkceDefio: string;
}): string {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: p.klientoId,
    redirect_uri: p.revokoUrl,
    state: p.stato,
    code_challenge: p.pkceDefio,
    code_challenge_method: "S256",
    allow_signup: "false",
  }).toString();
  return url.href;
}

export async function githubIdentigilo(p: {
  klientoId: string;
  klientoSekreto: string;
  revokoUrl: string;
  kodo: string;
  pkceKontrolilo: string;
}): Promise<string | null> {
  const jxetonRespondo = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: p.klientoId,
      client_secret: p.klientoSekreto,
      code: p.kodo,
      redirect_uri: p.revokoUrl,
      code_verifier: p.pkceKontrolilo,
    }),
  });
  if (!jxetonRespondo.ok) return null;
  const { access_token: alirJxetono } = (await jxetonRespondo.json()) as {
    access_token?: unknown;
  };
  if (typeof alirJxetono !== "string") return null;

  try {
    const uzantRespondo = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${alirJxetono}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Samideanoj",
      },
    });
    if (!uzantRespondo.ok) return null;
    const { id } = (await uzantRespondo.json()) as { id?: unknown };
    return typeof id === "number" && Number.isSafeInteger(id) ? String(id) : null;
  } finally {
    // ADR 0006: la alirĵetono estas uzata unufoje. Ni nuligas ĝin ĉe GitHub.
    await fetch(`https://api.github.com/applications/${p.klientoId}/token`, {
      method: "DELETE",
      headers: {
        Authorization: `Basic ${btoa(`${p.klientoId}:${p.klientoSekreto}`)}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "Samideanoj",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: alirJxetono }),
    }).catch(() => undefined);
  }
}

// ── Telegramo ─────────────────────────────────────────────────────────────

/** Atributoj por la ensalutilo de Telegramo. Neniam `data-request-access` (ADR 0006). */
export function telegramajAtributoj(robotoNomo: string, revokoUrl: string) {
  return {
    "data-telegram-login": robotoNomo,
    "data-size": "large",
    "data-radius": "12",
    "data-auth-url": revokoUrl,
  } as const;
}

const TELEGRAMA_MAKSIMUMA_AGXO = 5 * 60;

/**
 * Kontrolas la datumojn de la ensalutilo de Telegramo:
 * hash = HMAC-SHA256(datumoj, SHA256(robotoJxetono)), kaj auth_date ne pli malnova ol 5 min.
 */
export async function telegramaIdentigilo(
  parametroj: URLSearchParams,
  robotoJxetono: string,
  nunSekundoj: number,
): Promise<string | null> {
  const hash = parametroj.get("hash");
  const id = parametroj.get("id");
  const authDate = Number(parametroj.get("auth_date"));
  if (!hash || !/^[0-9a-f]{64}$/.test(hash) || !id || !/^[0-9]{1,20}$/.test(id)) return null;
  if (!Number.isInteger(authDate)) return null;
  if (nunSekundoj - authDate > TELEGRAMA_MAKSIMUMA_AGXO || authDate - nunSekundoj > 60) return null;

  const kontrolTeksto = [...parametroj.entries()]
    .filter(([sxlosilo]) => sxlosilo !== "hash" && sxlosilo !== "reveno" && sxlosilo !== "lingvo")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([sxlosilo, valoro]) => `${sxlosilo}=${valoro}`)
    .join("\n");

  const atendata = await hmacSha256Hex(await sha256Bajtoj(robotoJxetono), kontrolTeksto);
  return egalajSekure(atendata, hash) ? id : null;
}

// ── Komunaj helpiloj ──────────────────────────────────────────────────────

/** Akceptas nur lokajn vojojn, por eviti malferman alidirektilon. */
export function sekuraReveno(valoro: string | null | undefined): string | null {
  if (!valoro || valoro.length > 300) return null;
  if (!valoro.startsWith("/") || valoro.startsWith("//") || valoro.startsWith("/\\")) return null;
  if (/[\r\n\t]/.test(valoro)) return null;
  return valoro;
}
