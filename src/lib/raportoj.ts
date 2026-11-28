/**
 * Raportoj pri profiloj (M8). Nur ensalutintoj povas raporti.
 * Vidu docs/konto-kaj-moderigado.md.
 */

export const KIALOJ = [
  "spamo",
  "falsa_profilo",
  "ofenda_enhavo",
  "malkonvena_bildo",
  "alia",
] as const;
export type Kialo = (typeof KIALOJ)[number];

export const MAKS_KOMENTO = 1000;
/** Raportoj por uzanto en 24 horoj: sufiĉe por veraj problemoj, malhelpas amasan misuzon. */
export const TAGA_LIMO = 10;

export type RaportaEraro = "kialo" | "komento" | "alia-sen-komento";

export function validigiRaporton(
  kialo: unknown,
  komento: unknown,
): { bone: true; kialo: Kialo; komento: string | null } | { bone: false; eraro: RaportaEraro } {
  if (typeof kialo !== "string" || !KIALOJ.includes(kialo as Kialo)) {
    return { bone: false, eraro: "kialo" };
  }
  const teksto = typeof komento === "string" ? komento.trim() : "";
  if (teksto.length > MAKS_KOMENTO) return { bone: false, eraro: "komento" };
  if (kialo === "alia" && teksto.length === 0) return { bone: false, eraro: "alia-sen-komento" };
  return { bone: true, kialo: kialo as Kialo, komento: teksto || null };
}

export type RaportaRezulto = "kreita" | "gxisdatigita" | "limo" | "memo";

/**
 * Registras raporton. Se la sama persono jam havas malfermitan raporton pri la
 * sama profilo, ĝi estas ĝisdatigita anstataŭ duobligita.
 */
export async function raporti(
  db: D1Database,
  r: { raportantoId: string; profiloId: string; kialo: Kialo; komento: string | null },
  nun = Math.floor(Date.now() / 1000),
): Promise<RaportaRezulto> {
  if (r.raportantoId === r.profiloId) return "memo";

  const ekzistanta = await db
    .prepare(
      "SELECT id FROM raportoj WHERE raportanto_id = ? AND profilo_id = ? AND stato = 'nova'",
    )
    .bind(r.raportantoId, r.profiloId)
    .first<{ id: number }>();
  if (ekzistanta) {
    await db
      .prepare("UPDATE raportoj SET kialo = ?, komento = ?, kreita = ? WHERE id = ?")
      .bind(r.kialo, r.komento, nun, ekzistanta.id)
      .run();
    return "gxisdatigita";
  }

  const hodiaux = await db
    .prepare("SELECT count(*) AS n FROM raportoj WHERE raportanto_id = ? AND kreita > ?")
    .bind(r.raportantoId, nun - 86_400)
    .first<{ n: number }>();
  if ((hodiaux?.n ?? 0) >= TAGA_LIMO) return "limo";

  await db
    .prepare(
      "INSERT INTO raportoj (profilo_id, raportanto_id, kialo, komento, stato, kreita) VALUES (?, ?, ?, ?, 'nova', ?)",
    )
    .bind(r.profiloId, r.raportantoId, r.kialo, r.komento, nun)
    .run();
  return "kreita";
}
