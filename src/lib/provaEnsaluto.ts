/**
 * Ensaluto kiel ekzempla uzanto, por vidi la sistemon el ĉiu rolo sen provizanto.
 * Permesita NUR loke kaj en la provmedio. Tri seruroj:
 *  1. la variablo PROVA_ENSALUTO=jes, kiu ekzistas nur en tiuj medioj;
 *  2. MEDIO devas esti "loka" aŭ "provmedio" (neniam "produktado");
 *  3. tests/agordo.test.ts malsukcesas se la produkta agordo havus PROVA_ENSALUTO.
 * Krome, nur uzantoj kun identigilo 01EKZEMPLO… estas atingeblaj tiel.
 */

export const EKZEMPLA_PREFIKSO = "01EKZEMPLO";

export function provaEnsalutoPermesita(medio: Record<string, unknown>): boolean {
  return medio.PROVA_ENSALUTO === "jes" && (medio.MEDIO === "loka" || medio.MEDIO === "provmedio");
}

export interface EkzemplaUzanto {
  slug: string;
  kromnomo: string;
  rolo: string;
  stato: string;
}

export async function ekzemplajUzantoj(db: D1Database): Promise<EkzemplaUzanto[]> {
  const { results } = await db
    .prepare(
      "SELECT slug, kromnomo, rolo, stato FROM uzantoj WHERE id LIKE ?1 ORDER BY rolo DESC, kromnomo",
    )
    .bind(`${EKZEMPLA_PREFIKSO}%`)
    .all<EkzemplaUzanto>();
  return results;
}

export async function ekzemplaUzantoId(db: D1Database, slug: string): Promise<string | null> {
  const vico = await db
    .prepare("SELECT id FROM uzantoj WHERE slug = ?1 AND id LIKE ?2")
    .bind(slug, `${EKZEMPLA_PREFIKSO}%`)
    .first<{ id: string }>();
  return vico?.id ?? null;
}
