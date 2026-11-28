/**
 * Eksporto kaj forigo de la propra konto (M7; LFPDPPP kaj GDPR).
 * Vidu docs/konto-kaj-moderigado.md.
 */

import { base64url } from "./kripto";

export const EKSPORTA_FORMATO = "samideanoj-eksporto-1";

const iso = (sekundoj: number | null) =>
  sekundoj === null ? null : new Date(sekundoj * 1000).toISOString();

interface ProfilVico {
  slug: string;
  kromnomo: string;
  priskribo: string | null;
  nivelo: string;
  lando_kodo: string | null;
  regiono: string | null;
  urbo: string | null;
  vid_regiono: string;
  vid_urbo: string;
  vid_priskribo: string;
  vid_lingvoj: string;
  vid_interesoj: string;
  vid_bildo: string;
  rolo: string;
  stato: string;
  kreita: number;
  gxisdatigita: number;
  lasta_ensaluto: number;
}

/**
 * Ĉiuj datumoj, kiujn ni havas pri la uzanto, en malferma formato (JSON).
 * Ne inkluzivitaj: la seancaj ĵetonoj (ni konservas nur ilian haŝon) kaj la
 * raportoj PRI la uzanto (ili enhavas datumojn de aliaj personoj).
 */
export async function eksportiDatumojn(db: D1Database, uzantoId: string, nun = Date.now()) {
  const profilo = await db
    .prepare(
      `SELECT u.slug, u.kromnomo, u.priskribo, u.nivelo, u.lando_kodo,
              g.nomo AS regiono, r.nomo AS urbo,
              u.vid_regiono, u.vid_urbo, u.vid_priskribo, u.vid_lingvoj, u.vid_interesoj, u.vid_bildo,
              u.rolo, u.stato, u.kreita, u.gxisdatigita, u.lasta_ensaluto
         FROM uzantoj u
         LEFT JOIN regionoj g ON g.id = u.regiono_id
         LEFT JOIN urboj r ON r.id = u.urbo_id
        WHERE u.id = ?`,
    )
    .bind(uzantoId)
    .first<ProfilVico>();
  if (!profilo) return null;

  const [identecoj, ligiloj, lingvoj, interesoj, bildoj, raportoj, seancoj] = await db.batch<
    Record<string, unknown>
  >([
    db
      .prepare(
        "SELECT provizanto, ekstera_id FROM identecoj WHERE uzanto_id = ? ORDER BY provizanto",
      )
      .bind(uzantoId),
    db
      .prepare("SELECT tipo, valoro, videbleco FROM ligiloj WHERE uzanto_id = ? ORDER BY ordo")
      .bind(uzantoId),
    db
      .prepare("SELECT lingvo_kodo FROM uzanto_lingvoj WHERE uzanto_id = ? ORDER BY lingvo_kodo")
      .bind(uzantoId),
    db
      .prepare(
        `SELECT i.sxlosilo FROM uzanto_interesoj ui JOIN interesoj i ON i.id = ui.interes_id
          WHERE ui.uzanto_id = ? ORDER BY i.sxlosilo`,
      )
      .bind(uzantoId),
    db
      .prepare(
        "SELECT bildo, tipo, kasxita_de_moderiganto, gxisdatigita FROM profilbildoj WHERE uzanto_id = ?",
      )
      .bind(uzantoId),
    db
      .prepare(
        "SELECT kialo, komento, stato, kreita FROM raportoj WHERE raportanto_id = ? ORDER BY kreita",
      )
      .bind(uzantoId),
    db.prepare("SELECT count(*) AS n FROM seancoj WHERE uzanto_id = ?").bind(uzantoId),
  ]);

  const bildo = bildoj.results[0] as
    | {
        bildo: ArrayBuffer | number[];
        tipo: string;
        kasxita_de_moderiganto: number;
        gxisdatigita: number;
      }
    | undefined;

  return {
    formato: EKSPORTA_FORMATO,
    eksportita: new Date(nun).toISOString(),
    profilo: {
      slug: profilo.slug,
      kromnomo: profilo.kromnomo,
      priskribo: profilo.priskribo,
      nivelo: profilo.nivelo,
      lando: profilo.lando_kodo,
      regiono: profilo.regiono,
      urbo: profilo.urbo,
      videbleco: {
        regiono: profilo.vid_regiono,
        urbo: profilo.vid_urbo,
        priskribo: profilo.vid_priskribo,
        lingvoj: profilo.vid_lingvoj,
        interesoj: profilo.vid_interesoj,
        bildo: profilo.vid_bildo,
      },
      rolo: profilo.rolo,
      stato: profilo.stato,
      kreita: iso(profilo.kreita),
      gxisdatigita: iso(profilo.gxisdatigita),
      lasta_ensaluto: iso(profilo.lasta_ensaluto),
    },
    identecoj: identecoj.results,
    ligiloj: ligiloj.results,
    lingvoj: (lingvoj.results as { lingvo_kodo: string }[]).map((v) => v.lingvo_kodo),
    interesoj: (interesoj.results as { sxlosilo: string }[]).map((v) => v.sxlosilo),
    bildo: bildo
      ? {
          tipo: bildo.tipo,
          kasxita_de_moderiganto: bildo.kasxita_de_moderiganto === 1,
          gxisdatigita: iso(bildo.gxisdatigita),
          // Base64url, por ke la JSON restu teksto.
          datumoj: base64url(
            bildo.bildo instanceof ArrayBuffer
              ? new Uint8Array(bildo.bildo)
              : Uint8Array.from(bildo.bildo),
          ),
        }
      : null,
    raportoj_faritaj: (raportoj.results as { kreita: number }[]).map((r) => ({
      ...r,
      kreita: iso(r.kreita),
    })),
    aktivaj_seancoj: (seancoj.results[0] as { n: number }).n,
  };
}

/**
 * Forigas la konton kaj ĉiujn ĝiajn datumojn tuj kaj por ĉiam.
 * La skemo forigas ĉion ligitan per ON DELETE CASCADE (identecoj, seancoj,
 * ligiloj, lingvoj, interesoj, bildo, raportoj pri la profilo); la raportoj
 * faritaj de la uzanto restas sen aŭtoro, por ke la moderigado ne perdu ilin.
 */
export async function forigiKonton(db: D1Database, uzantoId: string): Promise<boolean> {
  const r = await db.prepare("DELETE FROM uzantoj WHERE id = ?").bind(uzantoId).run();
  return (r.meta?.changes ?? 0) > 0;
}

/** Fermas ĉiujn seancojn de la uzanto, en ĉiuj aparatoj. */
export async function elsalutiCxie(db: D1Database, uzantoId: string): Promise<void> {
  await db.prepare("DELETE FROM seancoj WHERE uzanto_id = ?").bind(uzantoId).run();
}

/** La konfirmo: la uzanto tajpas sian kromnomon, sen distingi majusklojn kaj spacojn ĉirkaŭe. */
export function konfirmoValidas(tajpita: string, kromnomo: string): boolean {
  const n = (s: string) => s.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
  return tajpita.length > 0 && n(tajpita) === n(kromnomo);
}
