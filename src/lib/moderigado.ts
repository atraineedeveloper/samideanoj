/**
 * Moderigado (M8). Vidu docs/konto-kaj-moderigado.md kaj la minacmodelon (R1, E1).
 *
 * - Nur moderigantoj kaj administrantoj: la rolo estas kontrolata en la servilo
 *   ĉe ĉiu peto, el la datumbazo (ne el la kliento).
 * - Ĉiu ago estas registrita en `moderigaj_agoj` kun aŭtoro kaj dato, en la
 *   sama atoma operacio kiel la ago mem.
 */

import type { Rolo } from "./seancoj";

export const estasModeriganto = (rolo: Rolo | undefined | null) =>
  rolo === "moderiganto" || rolo === "administranto";

export const AGOJ = [
  "kasxi_profilon",
  "kasxi_bildon",
  "malakcepti",
  "restarigi_profilon",
  "montri_bildon",
] as const;
export type Ago = (typeof AGOJ)[number];

export interface RaportGrupo {
  profiloId: string;
  slug: string;
  kromnomo: string;
  stato: string;
  havasBildon: boolean;
  bildoKasxita: boolean;
  raportoj: { kialo: string; komento: string | null; kreita: number }[];
}

/** La vico: novaj raportoj, grupigitaj laŭ profilo, la plej malnovaj unue. */
export async function novajRaportoj(db: D1Database): Promise<RaportGrupo[]> {
  const { results } = await db
    .prepare(
      `SELECT r.profilo_id, u.slug, u.kromnomo, u.stato, r.kialo, r.komento, r.kreita,
              b.uzanto_id IS NOT NULL AS havas_bildon, coalesce(b.kasxita_de_moderiganto, 0) AS bildo_kasxita
         FROM raportoj r
         JOIN uzantoj u ON u.id = r.profilo_id
         LEFT JOIN profilbildoj b ON b.uzanto_id = r.profilo_id
        WHERE r.stato = 'nova'
        ORDER BY r.kreita
        LIMIT 500`,
    )
    .all<{
      profilo_id: string;
      slug: string;
      kromnomo: string;
      stato: string;
      kialo: string;
      komento: string | null;
      kreita: number;
      havas_bildon: number;
      bildo_kasxita: number;
    }>();
  const grupoj = new Map<string, RaportGrupo>();
  for (const v of results) {
    let g = grupoj.get(v.profilo_id);
    if (!g) {
      g = {
        profiloId: v.profilo_id,
        slug: v.slug,
        kromnomo: v.kromnomo,
        stato: v.stato,
        havasBildon: v.havas_bildon === 1,
        bildoKasxita: v.bildo_kasxita === 1,
        raportoj: [],
      };
      grupoj.set(v.profilo_id, g);
    }
    g.raportoj.push({ kialo: v.kialo, komento: v.komento, kreita: v.kreita });
  }
  return [...grupoj.values()];
}

export async function kasxitajProfiloj(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT u.id, u.slug, u.kromnomo, u.stato = 'kasxita_de_moderiganto' AS profilo_kasxita,
              coalesce(b.kasxita_de_moderiganto, 0) AS bildo_kasxita
         FROM uzantoj u LEFT JOIN profilbildoj b ON b.uzanto_id = u.id
        WHERE u.stato = 'kasxita_de_moderiganto' OR b.kasxita_de_moderiganto = 1
        ORDER BY u.kromnomo LIMIT 200`,
    )
    .all<{
      id: string;
      slug: string;
      kromnomo: string;
      profilo_kasxita: number;
      bildo_kasxita: number;
    }>();
  return results.map((v) => ({
    id: v.id,
    slug: v.slug,
    kromnomo: v.kromnomo,
    profiloKasxita: v.profilo_kasxita === 1,
    bildoKasxita: v.bildo_kasxita === 1,
  }));
}

export async function lastajAgoj(db: D1Database, limo = 30) {
  const { results } = await db
    .prepare(
      `SELECT a.ago, a.kreita, a.profilo_id, m.kromnomo AS moderiganto, u.slug, u.kromnomo
         FROM moderigaj_agoj a
         LEFT JOIN uzantoj m ON m.id = a.moderiganto_id
         LEFT JOIN uzantoj u ON u.id = a.profilo_id
        ORDER BY a.kreita DESC, a.id DESC LIMIT ?`,
    )
    .bind(limo)
    .all<{
      ago: string;
      kreita: number;
      profilo_id: string | null;
      moderiganto: string | null;
      slug: string | null;
      kromnomo: string | null;
    }>();
  return results;
}

export const nombroDeNovaj = async (db: D1Database) =>
  (
    await db
      .prepare("SELECT count(*) AS n FROM raportoj WHERE stato = 'nova'")
      .first<{ n: number }>()
  )?.n ?? 0;

/**
 * Plenumas moderigan agon kaj registras ĝin, ĉio en unu atoma operacio.
 * Redonas false se la profilo ne ekzistas aŭ la ago ne aplikiĝas (ekz. kaŝi
 * bildon, kiu ne ekzistas), aŭ se moderiganto provas moderigi sin mem.
 */
export async function plenumiAgon(
  db: D1Database,
  a: { moderigantoId: string; profiloId: string; ago: Ago },
  nun = Math.floor(Date.now() / 1000),
): Promise<boolean> {
  if (a.moderigantoId === a.profiloId) return false;
  const celo = await db
    .prepare(
      `SELECT u.rolo, b.uzanto_id IS NOT NULL AS havas_bildon FROM uzantoj u
         LEFT JOIN profilbildoj b ON b.uzanto_id = u.id WHERE u.id = ?`,
    )
    .bind(a.profiloId)
    .first<{ rolo: string; havas_bildon: number }>();
  if (!celo) return false;
  // Moderigantoj ne moderigas administrantojn.
  if (celo.rolo === "administranto") return false;
  if ((a.ago === "kasxi_bildon" || a.ago === "montri_bildon") && celo.havas_bildon !== 1)
    return false;

  const raportStato = (stato: "akceptita" | "malakceptita") =>
    db
      .prepare("UPDATE raportoj SET stato = ? WHERE profilo_id = ? AND stato = 'nova'")
      .bind(stato, a.profiloId);

  const sxangxoj: D1PreparedStatement[] = {
    kasxi_profilon: [
      db
        .prepare("UPDATE uzantoj SET stato = 'kasxita_de_moderiganto' WHERE id = ?")
        .bind(a.profiloId),
      raportStato("akceptita"),
    ],
    kasxi_bildon: [
      db
        .prepare("UPDATE profilbildoj SET kasxita_de_moderiganto = 1 WHERE uzanto_id = ?")
        .bind(a.profiloId),
      raportStato("akceptita"),
    ],
    malakcepti: [raportStato("malakceptita")],
    restarigi_profilon: [
      db
        .prepare(
          "UPDATE uzantoj SET stato = 'aktiva' WHERE id = ? AND stato = 'kasxita_de_moderiganto'",
        )
        .bind(a.profiloId),
    ],
    montri_bildon: [
      db
        .prepare("UPDATE profilbildoj SET kasxita_de_moderiganto = 0 WHERE uzanto_id = ?")
        .bind(a.profiloId),
    ],
  }[a.ago];

  await db.batch([
    ...sxangxoj,
    db
      .prepare(
        "INSERT INTO moderigaj_agoj (moderiganto_id, profilo_id, ago, kreita) VALUES (?, ?, ?, ?)",
      )
      .bind(a.moderigantoId, a.profiloId, a.ago, nun),
  ]);
  return true;
}
