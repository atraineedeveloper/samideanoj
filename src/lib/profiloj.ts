/**
 * Legado de profiloj el D1. Redonas PlenaProfilo, kiu NENIAM iras rekte al la
 * retumilo: ĉiam pasigu ĝin tra filtriProfilon (src/lib/videbleco.ts).
 */

import type { LigilaTipo, Nivelo, PlenaProfilo, ProfilaStato, Videbleco } from "./tipoj";

interface UzantoVico {
  id: string;
  slug: string;
  kromnomo: string;
  priskribo: string | null;
  nivelo: Nivelo;
  vid_urbo: Videbleco;
  vid_priskribo: Videbleco;
  vid_lingvoj: Videbleco;
  vid_interesoj: Videbleco;
  stato: ProfilaStato;
  gxisdatigita: number;
  urbo_nomo: string | null;
  urbo_nomo_eo: string | null;
  urbo_lando: string | null;
}

interface LigiloVico {
  tipo: LigilaTipo;
  valoro: string;
  videbleco: Videbleco;
  ordo: number;
}

export async function legiProfilonLauxSlug(
  db: D1Database,
  slug: string,
): Promise<PlenaProfilo | null> {
  const uzanto = await db
    .prepare(
      `SELECT u.id, u.slug, u.kromnomo, u.priskribo, u.nivelo,
              u.vid_urbo, u.vid_priskribo, u.vid_lingvoj, u.vid_interesoj,
              u.stato, u.gxisdatigita,
              r.nomo AS urbo_nomo, r.nomo_eo AS urbo_nomo_eo, r.lando_kodo AS urbo_lando
         FROM uzantoj u
         LEFT JOIN urboj r ON r.id = u.urbo_id
        WHERE u.slug = ?1`,
    )
    .bind(slug)
    .first<UzantoVico>();

  if (!uzanto) return null;

  const [ligiloj, lingvoj, interesoj] = await db.batch<
    LigiloVico | { lingvo_kodo: string } | { sxlosilo: string }
  >([
    db
      .prepare(
        "SELECT tipo, valoro, videbleco, ordo FROM ligiloj WHERE uzanto_id = ?1 ORDER BY ordo",
      )
      .bind(uzanto.id),
    db
      .prepare("SELECT lingvo_kodo FROM uzanto_lingvoj WHERE uzanto_id = ?1 ORDER BY lingvo_kodo")
      .bind(uzanto.id),
    db
      .prepare(
        `SELECT i.sxlosilo FROM uzanto_interesoj ui
           JOIN interesoj i ON i.id = ui.interes_id
          WHERE ui.uzanto_id = ?1 ORDER BY i.sxlosilo`,
      )
      .bind(uzanto.id),
  ]);

  return {
    id: uzanto.id,
    slug: uzanto.slug,
    kromnomo: uzanto.kromnomo,
    nivelo: uzanto.nivelo,
    priskribo: uzanto.priskribo,
    urbo:
      uzanto.urbo_nomo && uzanto.urbo_lando
        ? { nomo: uzanto.urbo_nomo, nomoEo: uzanto.urbo_nomo_eo, landoKodo: uzanto.urbo_lando }
        : null,
    lingvoj: (lingvoj.results as { lingvo_kodo: string }[]).map((v) => v.lingvo_kodo),
    interesoj: (interesoj.results as { sxlosilo: string }[]).map((v) => v.sxlosilo),
    ligiloj: ligiloj.results as LigiloVico[],
    videbleco: {
      urbo: uzanto.vid_urbo,
      priskribo: uzanto.vid_priskribo,
      lingvoj: uzanto.vid_lingvoj,
      interesoj: uzanto.vid_interesoj,
    },
    stato: uzanto.stato,
    gxisdatigita: uzanto.gxisdatigita,
  };
}
