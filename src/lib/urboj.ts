/** Serĉado de urboj por la formularo de la profilo. */

import { normigiSercxon } from "./sercxo";

export interface TrovitaUrbo {
  id: number;
  nomo: string;
  regiono: string | null;
  lando: string;
}

/** Prefiksa serĉo per la indekso urboj_sercxnomo: legas nur la trovitajn vicojn. */
export async function sercxiUrbojn(
  db: D1Database,
  demando: string,
  limo = 8,
): Promise<TrovitaUrbo[]> {
  const q = normigiSercxon(demando).slice(0, 60);
  if (q.length < 2) return [];
  const { results } = await db
    .prepare(
      `SELECT id, nomo, regiono, lando_kodo AS lando FROM urboj
        WHERE sercxnomo >= ?1 AND sercxnomo < ?2
        ORDER BY logxantoj DESC LIMIT ?3`,
    )
    .bind(q, `${q}￿`, limo)
    .all<TrovitaUrbo>();
  return results;
}

export async function urboEkzistas(db: D1Database, id: number): Promise<boolean> {
  return (await db.prepare("SELECT 1 FROM urboj WHERE id = ?1").bind(id).first()) !== null;
}
