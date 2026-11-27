/**
 * Seancoj kaj atendantaj aliĝoj. Vidu ADR 0004.
 * La retumilo ricevas hazardan ĵetonon; D1 konservas nur ĝian SHA-256.
 */

import { hazardaJxetono, sha256Hex } from "./kripto";

export const SEANCA_KUKETO = "__Host-seanco";
export const ALIGXA_KUKETO = "__Host-aligxo";

const TAGO = 24 * 60 * 60;
export const SEANCA_DAUXRO = 30 * TAGO;
const RENOVIGI_SE_MALPLI_OL = 15 * TAGO;
export const ALIGXA_DAUXRO = 30 * 60;

export type Provizanto = "telegramo" | "google" | "github";
export type Rolo = "uzanto" | "moderiganto" | "administranto";

export interface SeancaUzanto {
  id: string;
  slug: string;
  kromnomo: string;
  rolo: Rolo;
}

export const nun = () => Math.floor(Date.now() / 1000);

export async function kreiSeancon(db: D1Database, uzantoId: string): Promise<string> {
  const jxetono = hazardaJxetono();
  const t = nun();
  await db.batch([
    db.prepare("DELETE FROM seancoj WHERE uzanto_id = ?1 AND eksvalidigxo < ?2").bind(uzantoId, t),
    db
      .prepare("INSERT INTO seancoj (id_hash, uzanto_id, eksvalidigxo) VALUES (?1, ?2, ?3)")
      .bind(await sha256Hex(jxetono), uzantoId, t + SEANCA_DAUXRO),
    db.prepare("UPDATE uzantoj SET lasta_ensaluto = ?2 WHERE id = ?1").bind(uzantoId, t),
  ]);
  return jxetono;
}

export interface LegitaSeanco {
  uzanto: SeancaUzanto;
  /** Vera, se la seanco estis plilongigita kaj la kuketo devas esti resendita. */
  renovigita: boolean;
}

export async function legiSeancon(db: D1Database, jxetono: string): Promise<LegitaSeanco | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(jxetono)) return null;
  const idHash = await sha256Hex(jxetono);
  const t = nun();
  const vico = await db
    .prepare(
      `SELECT s.eksvalidigxo, u.id, u.slug, u.kromnomo, u.rolo, u.stato
         FROM seancoj s JOIN uzantoj u ON u.id = s.uzanto_id
        WHERE s.id_hash = ?1`,
    )
    .bind(idHash)
    .first<{
      eksvalidigxo: number;
      id: string;
      slug: string;
      kromnomo: string;
      rolo: Rolo;
      stato: string;
    }>();

  if (!vico || vico.eksvalidigxo < t) return null;

  let renovigita = false;
  if (vico.eksvalidigxo - t < RENOVIGI_SE_MALPLI_OL) {
    await db
      .prepare("UPDATE seancoj SET eksvalidigxo = ?2 WHERE id_hash = ?1")
      .bind(idHash, t + SEANCA_DAUXRO)
      .run();
    renovigita = true;
  }

  return {
    uzanto: { id: vico.id, slug: vico.slug, kromnomo: vico.kromnomo, rolo: vico.rolo },
    renovigita,
  };
}

export async function forigiSeancon(db: D1Database, jxetono: string): Promise<void> {
  await db
    .prepare("DELETE FROM seancoj WHERE id_hash = ?1")
    .bind(await sha256Hex(jxetono))
    .run();
}

/** Trovas la uzanton ligitan al ekstera identeco, se ĝi ekzistas. */
export async function trovuUzantonLauxIdenteco(
  db: D1Database,
  provizanto: Provizanto,
  eksteraId: string,
): Promise<string | null> {
  const vico = await db
    .prepare("SELECT uzanto_id FROM identecoj WHERE provizanto = ?1 AND ekstera_id = ?2")
    .bind(provizanto, eksteraId)
    .first<{ uzanto_id: string }>();
  return vico?.uzanto_id ?? null;
}

export async function kreiAtendantanAligxon(
  db: D1Database,
  provizanto: Provizanto,
  eksteraId: string,
): Promise<string> {
  const jxetono = hazardaJxetono();
  const t = nun();
  await db.batch([
    db.prepare("DELETE FROM atendantaj_aligxoj WHERE eksvalidigxo < ?1").bind(t),
    db
      .prepare(
        "INSERT INTO atendantaj_aligxoj (id_hash, provizanto, ekstera_id, eksvalidigxo) VALUES (?1, ?2, ?3, ?4)",
      )
      .bind(await sha256Hex(jxetono), provizanto, eksteraId, t + ALIGXA_DAUXRO),
  ]);
  return jxetono;
}

export async function legiAtendantanAligxon(
  db: D1Database,
  jxetono: string,
): Promise<{ provizanto: Provizanto; eksteraId: string } | null> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(jxetono)) return null;
  const vico = await db
    .prepare(
      "SELECT provizanto, ekstera_id, eksvalidigxo FROM atendantaj_aligxoj WHERE id_hash = ?1",
    )
    .bind(await sha256Hex(jxetono))
    .first<{ provizanto: Provizanto; ekstera_id: string; eksvalidigxo: number }>();
  if (!vico || vico.eksvalidigxo < nun()) return null;
  return { provizanto: vico.provizanto, eksteraId: vico.ekstera_id };
}

export async function forigiAtendantanAligxon(db: D1Database, jxetono: string): Promise<void> {
  await db
    .prepare("DELETE FROM atendantaj_aligxoj WHERE id_hash = ?1")
    .bind(await sha256Hex(jxetono))
    .run();
}
