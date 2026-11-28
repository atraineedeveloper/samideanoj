/** Landoj, regionoj kaj urboj: serĉado kaj kontrolo de la elekto. Vidu docs/urboj.md. */

import { normigiSercxon } from "./sercxo";

export type TrovitaLoko =
  | { tipo: "urbo"; id: number; nomo: string; regiono: string | null }
  | { tipo: "regiono"; id: string; nomo: string };

const LANDA_KODO = /^[A-Z]{2}$/;

export async function landoj(db: D1Database): Promise<string[]> {
  const { results } = await db
    .prepare("SELECT kodo FROM landoj ORDER BY kodo")
    .all<{ kodo: string }>();
  return results.map((r) => r.kodo);
}

/**
 * Serĉas urbojn kaj regionojn en unu lando, laŭ prefikso de la nomo.
 * Uzas la indeksojn (lando_kodo, sercxnomo): legas nur la trovitajn vicojn.
 */
export async function sercxiLokojn(
  db: D1Database,
  lando: string,
  demando: string,
): Promise<TrovitaLoko[]> {
  const q = normigiSercxon(demando).slice(0, 60);
  if (!LANDA_KODO.test(lando) || q.length < 2) return [];
  const gxis = `${q}￿`;
  const [urboj, regionoj] = await db.batch<
    { id: number; nomo: string; regiono: string | null } | { id: string; nomo: string }
  >([
    db
      .prepare(
        `SELECT r.id, r.nomo, g.nomo AS regiono FROM urboj r
           LEFT JOIN regionoj g ON g.id = r.regiono_id
          WHERE r.lando_kodo = ?1 AND r.sercxnomo >= ?2 AND r.sercxnomo < ?3
          ORDER BY r.logxantoj DESC LIMIT 8`,
      )
      .bind(lando, q, gxis),
    db
      .prepare(
        `SELECT id, nomo FROM regionoj
          WHERE lando_kodo = ?1 AND sercxnomo >= ?2 AND sercxnomo < ?3
          ORDER BY sercxnomo LIMIT 3`,
      )
      .bind(lando, q, gxis),
  ]);
  return [
    ...(urboj.results as { id: number; nomo: string; regiono: string | null }[]).map((u) => ({
      tipo: "urbo" as const,
      ...u,
    })),
    ...(regionoj.results as { id: string; nomo: string }[]).map((g) => ({
      tipo: "regiono" as const,
      ...g,
    })),
  ];
}

export interface KontrolitaLoko {
  landoKodo: string;
  regionoId: string | null;
  urboId: number | null;
}

/**
 * Kontrolas, ke la elektita loko ekzistas kaj apartenas al la lando.
 * La regiono de urbo estas ĉiam derivita el la urbo, neniam el la formularo.
 */
export async function kontroliLokon(
  db: D1Database,
  lando: string,
  loko: { tipo: "urbo"; id: number } | { tipo: "regiono"; id: string } | null,
): Promise<KontrolitaLoko | null> {
  if (!LANDA_KODO.test(lando)) return null;
  const landoEkzistas = await db
    .prepare("SELECT 1 FROM landoj WHERE kodo = ?1")
    .bind(lando)
    .first();
  if (!landoEkzistas) return null;
  if (!loko) return { landoKodo: lando, regionoId: null, urboId: null };

  if (loko.tipo === "urbo") {
    const urbo = await db
      .prepare("SELECT regiono_id FROM urboj WHERE id = ?1 AND lando_kodo = ?2")
      .bind(loko.id, lando)
      .first<{ regiono_id: string | null }>();
    return urbo ? { landoKodo: lando, regionoId: urbo.regiono_id, urboId: loko.id } : null;
  }
  const regiono = await db
    .prepare("SELECT 1 FROM regionoj WHERE id = ?1 AND lando_kodo = ?2")
    .bind(loko.id, lando)
    .first();
  return regiono ? { landoKodo: lando, regionoId: loko.id, urboId: null } : null;
}
