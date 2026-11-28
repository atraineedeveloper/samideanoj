/** Kreado de novaj uzantoj post la unua ensaluto. */

import type { Provizanto } from "./seancoj";
import { nun } from "./seancoj";
import { NIVELOJ, type Nivelo } from "./tipoj";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

/** ULID: 48 bitoj da tempo + 80 hazardaj bitoj, 26 signoj, ordigebla laŭ tempo. */
export function ulid(tempoMs = Date.now()): string {
  let tempo = "";
  let t = tempoMs;
  for (let i = 0; i < 10; i++) {
    tempo = CROCKFORD[t % 32] + tempo;
    t = Math.floor(t / 32);
  }
  const hazardo = crypto.getRandomValues(new Uint8Array(16));
  let resto = "";
  for (let i = 0; i < 16; i++) resto += CROCKFORD[hazardo[i] % 32];
  return tempo + resto;
}

const X_SISTEMO: Record<string, string> = {
  ĉ: "cx",
  ĝ: "gx",
  ĥ: "hx",
  ĵ: "jx",
  ŝ: "sx",
  ŭ: "ux",
};

/** "Marisol García" → "marisol-garcia"; "Ĉiĉero" → "cxicxero". */
export function slugDe(kromnomo: string): string {
  const baza = kromnomo
    .toLowerCase()
    .replace(/[ĉĝĥĵŝŭ]/g, (l) => X_SISTEMO[l])
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
  return baza.length >= 3 ? baza : "samideano";
}

export type AligxaEraro = "kromnomo" | "nivelo" | "agxo" | "lando";

/** Kontrolas la aliĝan formularon. `agxo` estas la konfirmo de minimuma aĝo de 16 jaroj. */
export function validigiAligxon(
  kromnomo: unknown,
  nivelo: unknown,
  agxo: unknown,
  lando: unknown,
):
  | { bone: true; kromnomo: string; nivelo: Nivelo; lando: string }
  | { bone: false; eraroj: AligxaEraro[] } {
  const eraroj: AligxaEraro[] = [];
  const k = typeof kromnomo === "string" ? kromnomo.replace(/\s+/g, " ").trim() : "";
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ni intence malpermesas regsignojn
  if (k.length < 1 || k.length > 60 || /[\u0000-\u001f\u007f]/.test(k)) eraroj.push("kromnomo");
  const n = typeof nivelo === "string" ? nivelo : "";
  if (!(NIVELOJ as readonly string[]).includes(n)) eraroj.push("nivelo");
  if (agxo !== "jes") eraroj.push("agxo");
  const l = typeof lando === "string" ? lando : "";
  if (!/^[A-Z]{2}$/.test(l)) eraroj.push("lando");
  return eraroj.length
    ? { bone: false, eraroj }
    : { bone: true, kromnomo: k, nivelo: n as Nivelo, lando: l };
}

async function liberaSlug(db: D1Database, baza: string): Promise<string> {
  const ekzistantaj = await db
    .prepare("SELECT slug FROM uzantoj WHERE slug = ?1 OR slug LIKE ?2")
    .bind(baza, `${baza}-%`)
    .all<{ slug: string }>();
  const prenitaj = new Set(ekzistantaj.results.map((v) => v.slug));
  if (!prenitaj.has(baza)) return baza;
  for (let i = 2; i < 10_000; i++) {
    const kandidato = `${baza}-${i}`;
    if (!prenitaj.has(kandidato)) return kandidato;
  }
  return `${baza}-${ulid().slice(-6).toLowerCase()}`;
}

export async function kreiUzanton(
  db: D1Database,
  p: { provizanto: Provizanto; eksteraId: string; kromnomo: string; nivelo: Nivelo; lando: string },
): Promise<{ id: string; slug: string }> {
  const id = ulid();
  const slug = await liberaSlug(db, slugDe(p.kromnomo));
  const t = nun();
  await db.batch([
    db
      .prepare(
        `INSERT INTO uzantoj (id, slug, kromnomo, nivelo, lando_kodo, kreita, gxisdatigita, lasta_ensaluto)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6, ?6)`,
      )
      .bind(id, slug, p.kromnomo, p.nivelo, p.lando, t),
    db
      .prepare("INSERT INTO identecoj (uzanto_id, provizanto, ekstera_id) VALUES (?1, ?2, ?3)")
      .bind(id, p.provizanto, p.eksteraId),
  ]);
  return { id, slug };
}
