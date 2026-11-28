/**
 * Nombroj por la publika mapo. Vidu docs/adr/0007-propra-mapo.md.
 *
 * Privateco:
 * - Lando: ĉiuj aktivaj profiloj (la lando estas ĉiam publika).
 * - Urbo: nur profiloj kun publika urbo, kaj nur se estas almenaŭ SOJLO da ili.
 *   Urbo kun malpli aperas nur en la tuto de sia lando, por ke la mapo ne
 *   montru, kie loĝas unu aparta persono.
 *
 * Kosto: la kalkulo legas ĉiujn aktivajn profilojn, do ni konservas la rezulton
 * en unu vico de `kasxmemoro` kaj renovigas ĝin maksimume ĉiujn 10 minutojn.
 */

export const SOJLO = 3;
export const KASXMEMORA_DAUXRO = 600;
const SXLOSILO = "mapo";

export interface MapaUrbo {
  id: number;
  nomo: string;
  nomoEo: string | null;
  lando: string;
  lat: number;
  lon: number;
  nombro: number;
}

export interface MapajNombroj {
  landoj: Record<string, number>;
  urboj: MapaUrbo[];
  sumo: number;
  gxisdatigita: number;
}

export async function kalkuliNombrojn(db: D1Database, nun: number): Promise<MapajNombroj> {
  const [landoj, urboj] = await db.batch<
    | { lando_kodo: string; n: number }
    | (Omit<MapaUrbo, "nomoEo" | "nombro" | "lando"> & {
        nomo_eo: string | null;
        lando_kodo: string;
        n: number;
      })
  >([
    db.prepare(
      `SELECT lando_kodo, count(*) AS n FROM uzantoj
        WHERE stato = 'aktiva' AND lando_kodo IS NOT NULL
        GROUP BY lando_kodo`,
    ),
    db
      .prepare(
        `SELECT r.id, r.nomo, r.nomo_eo, r.lando_kodo, r.lat, r.lon, count(*) AS n
           FROM uzantoj u JOIN urboj r ON r.id = u.urbo_id
          WHERE u.stato = 'aktiva' AND u.vid_urbo = 'publika'
          GROUP BY r.id HAVING count(*) >= ?
          ORDER BY n DESC`,
      )
      .bind(SOJLO),
  ]);

  const landajNombroj: Record<string, number> = {};
  let sumo = 0;
  for (const v of landoj.results as { lando_kodo: string; n: number }[]) {
    landajNombroj[v.lando_kodo] = v.n;
    sumo += v.n;
  }
  return {
    landoj: landajNombroj,
    urboj: (
      urboj.results as {
        id: number;
        nomo: string;
        nomo_eo: string | null;
        lando_kodo: string;
        lat: number;
        lon: number;
        n: number;
      }[]
    ).map((v) => ({
      id: v.id,
      nomo: v.nomo,
      nomoEo: v.nomo_eo,
      lando: v.lando_kodo,
      lat: v.lat,
      lon: v.lon,
      nombro: v.n,
    })),
    sumo,
    gxisdatigita: nun,
  };
}

/** Redonas la nombrojn el la kaŝmemoro, aŭ kalkulas ilin denove se ili estas tro malnovaj. */
export async function legiNombrojn(
  db: D1Database,
  nun = Math.floor(Date.now() / 1000),
): Promise<MapajNombroj> {
  const vico = await db
    .prepare("SELECT valoro, gxisdatigita FROM kasxmemoro WHERE sxlosilo = ?")
    .bind(SXLOSILO)
    .first<{ valoro: string; gxisdatigita: number }>();
  if (vico && nun - vico.gxisdatigita < KASXMEMORA_DAUXRO) {
    try {
      return JSON.parse(vico.valoro) as MapajNombroj;
    } catch {
      // Difektita: kalkuli denove.
    }
  }
  const nombroj = await kalkuliNombrojn(db, nun);
  await db
    .prepare(
      `INSERT INTO kasxmemoro (sxlosilo, valoro, gxisdatigita) VALUES (?, ?, ?)
       ON CONFLICT (sxlosilo) DO UPDATE SET valoro = excluded.valoro,
         gxisdatigita = excluded.gxisdatigita`,
    )
    .bind(SXLOSILO, JSON.stringify(nombroj), nun)
    .run();
  return nombroj;
}

/** Radiuso de veziko en bilderoj: kreskas laŭ la kvadrata radiko, por ke la areo estu proporcia. */
export function radiuso(nombro: number): number {
  return Math.min(30, 9 + 3 * Math.sqrt(nombro));
}
