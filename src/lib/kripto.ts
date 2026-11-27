/** Etaj kriptografiaj helpiloj sur la Web Crypto API (havebla en Workers kaj Node). */

const kodilo = new TextEncoder();

export function base64url(bajtoj: Uint8Array): string {
  let binara = "";
  for (const b of bajtoj) binara += String.fromCharCode(b);
  return btoa(binara).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Hazarda ĵetono, kodita base64url. 32 bajtoj = 256 bitoj. */
export function hazardaJxetono(bajtoj = 32): string {
  return base64url(crypto.getRandomValues(new Uint8Array(bajtoj)));
}

function hex(bufro: ArrayBuffer): string {
  return [...new Uint8Array(bufro)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Bajtoj(teksto: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", kodilo.encode(teksto));
}

export async function sha256Hex(teksto: string): Promise<string> {
  return hex(await sha256Bajtoj(teksto));
}

export async function hmacSha256Hex(sxlosilo: ArrayBuffer, datumoj: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    "raw",
    sxlosilo,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return hex(await crypto.subtle.sign("HMAC", k, kodilo.encode(datumoj)));
}

/** Komparo en konstanta tempo, por ne malkaŝi per tempomezurado kiom da signoj kongruas. */
export function egalajSekure(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diferenco = 0;
  for (let i = 0; i < a.length; i++) diferenco |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diferenco === 0;
}

/** PKCE (RFC 7636): la defio estas base64url(SHA-256(kontrolilo)). */
export async function pkceDefio(kontrolilo: string): Promise<string> {
  return base64url(new Uint8Array(await sha256Bajtoj(kontrolilo)));
}
