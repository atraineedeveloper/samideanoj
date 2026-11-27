/**
 * Validigo kaj montrado de kontaktiloj. Vidu docs/fazo-2/minacmodelo.md (T2).
 *
 * - `normigi` kontrolas la enigon de la uzanto kaj redonas la kanonan formon
 *   konservotan en la datumbazo.
 * - `montrebla` konstruas la ligilon por montri. Ĝi denove validigas la
 *   konservitan valoron: nevalida valoro neniam iĝas ligilo (`href: null`).
 * - Ĉiu ligilo estas `https:` aŭ `mailto:`; neniam `javascript:`, `data:` ktp.
 */

import type { LigilaTipo } from "./tipoj";

export type NormigaRezulto = { bone: true; valoro: string } | { bone: false };

export interface MontreblaLigilo {
  teksto: string;
  href: string | null;
}

const UZANTNOMO = {
  telegramo: /^[A-Za-z][A-Za-z0-9_]{4,31}$/,
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  x: /^[A-Za-z0-9_]{1,15}$/,
  tiktok: /^[A-Za-z0-9._]{2,24}$/,
  youtube: /^[A-Za-z0-9._-]{3,30}$/,
  discord: /^[a-z0-9_.]{2,32}$/,
  fejsbuko: /^[A-Za-z0-9.]{5,50}$/,
} as const;

const TELEFONO = /^\+?[0-9]{8,15}$/;
const MASTODON = /^@?([A-Za-z0-9_]{1,30})@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i;
const BLUESKY = /^@?([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i;
const RETPOSXTO = /^[^\s@<>"']{1,64}@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;

/** Retejoj, por kiuj ni akceptas nur plenan ligilon al ilia propra domajno. */
const DOMAJNOJ: Partial<Record<LigilaTipo, string[]>> = {
  lernu: ["lernu.net"],
  pasporta_servo: ["pasportaservo.org"],
  amikumu: ["amikumu.com"],
};

function senAlfa(valoro: string): string {
  return valoro.startsWith("@") ? valoro.slice(1) : valoro;
}

function nurCiferoj(valoro: string): string {
  return valoro.replace(/[\s().-]/g, "");
}

function httpsUrl(valoro: string, domajnoj?: string[]): URL | null {
  let url: URL;
  try {
    url = new URL(valoro);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  if (domajnoj) {
    const gastiganto = url.hostname.toLowerCase();
    const permesata = domajnoj.some((d) => gastiganto === d || gastiganto.endsWith(`.${d}`));
    if (!permesata) return null;
  }
  return url;
}

/** Kontrolas kaj normigas tion, kion la uzanto tajpis. */
export function normigi(tipo: LigilaTipo, enigo: string): NormigaRezulto {
  const valoro = enigo.trim();
  if (valoro.length === 0 || valoro.length > 300) return { bone: false };

  switch (tipo) {
    case "telegramo":
    case "instagram":
    case "x":
    case "tiktok":
    case "youtube":
    case "discord":
    case "fejsbuko": {
      const nomo = senAlfa(valoro);
      return UZANTNOMO[tipo].test(nomo) ? { bone: true, valoro: nomo } : { bone: false };
    }
    case "whatsapp":
    case "signal": {
      const numero = nurCiferoj(valoro);
      if (!TELEFONO.test(numero)) return { bone: false };
      return { bone: true, valoro: numero.startsWith("+") ? numero : `+${numero}` };
    }
    case "mastodon": {
      const m = MASTODON.exec(valoro);
      return m ? { bone: true, valoro: `@${m[1]}@${m[2].toLowerCase()}` } : { bone: false };
    }
    case "bluesky": {
      const m = BLUESKY.exec(valoro);
      return m ? { bone: true, valoro: m[1].toLowerCase() } : { bone: false };
    }
    case "retposxto":
      return RETPOSXTO.test(valoro) ? { bone: true, valoro } : { bone: false };
    case "lernu":
    case "pasporta_servo":
    case "amikumu":
    case "retejo": {
      const url = httpsUrl(valoro, DOMAJNOJ[tipo]);
      return url ? { bone: true, valoro: url.href } : { bone: false };
    }
  }
}

/** Konstruas la tekston kaj la ligilon por montri konservitan kontaktilon. */
export function montrebla(tipo: LigilaTipo, valoro: string): MontreblaLigilo {
  const normigita = normigi(tipo, valoro);
  if (!normigita.bone) return { teksto: valoro, href: null };
  const v = normigita.valoro;

  switch (tipo) {
    case "telegramo":
      return { teksto: `@${v}`, href: `https://t.me/${v}` };
    case "instagram":
      return { teksto: `@${v}`, href: `https://www.instagram.com/${v}/` };
    case "x":
      return { teksto: `@${v}`, href: `https://x.com/${v}` };
    case "tiktok":
      return { teksto: `@${v}`, href: `https://www.tiktok.com/@${v}` };
    case "youtube":
      return { teksto: `@${v}`, href: `https://www.youtube.com/@${v}` };
    case "fejsbuko":
      return { teksto: v, href: `https://www.facebook.com/${v}` };
    case "discord":
      return { teksto: v, href: null };
    case "whatsapp":
      return { teksto: v, href: `https://wa.me/${v.slice(1)}` };
    case "signal":
      return { teksto: v, href: `https://signal.me/#p/${v}` };
    case "mastodon": {
      const [, uzanto, servilo] = v.split("@");
      return { teksto: v, href: `https://${servilo}/@${uzanto}` };
    }
    case "bluesky":
      return { teksto: `@${v}`, href: `https://bsky.app/profile/${v}` };
    case "retposxto":
      return { teksto: v, href: `mailto:${v}` };
    case "lernu":
    case "pasporta_servo":
    case "amikumu":
    case "retejo": {
      const url = new URL(v);
      return {
        teksto: `${url.hostname}${url.pathname === "/" ? "" : url.pathname}`,
        href: url.href,
      };
    }
  }
}
