/**
 * Legado de profiloj el D1. Redonas PlenaProfilo, kiu NENIAM iras rekte al la
 * retumilo: ĉiam pasigu ĝin tra filtriProfilon (src/lib/videbleco.ts).
 * Sola escepto: la posedanto redaktanta sian propran profilon.
 */

import type { LigilaTipo, Nivelo, PlenaProfilo, ProfilaStato, Videbleco } from "./tipoj";

interface UzantoVico {
  id: string;
  slug: string;
  kromnomo: string;
  priskribo: string | null;
  nivelo: Nivelo;
  lando_kodo: string | null;
  vid_regiono: Videbleco;
  vid_urbo: Videbleco;
  vid_priskribo: Videbleco;
  vid_lingvoj: Videbleco;
  vid_interesoj: Videbleco;
  stato: ProfilaStato;
  gxisdatigita: number;
  regiono_id: string | null;
  regiono_nomo: string | null;
  urbo_id: number | null;
  urbo_nomo: string | null;
  urbo_nomo_eo: string | null;
  urbo_lando: string | null;
  vid_bildo: Videbleco;
  bildo_versio: number | null;
  bildo_kasxita: number | null;
}

interface LigiloVico {
  tipo: LigilaTipo;
  valoro: string;
  videbleco: Videbleco;
  ordo: number;
}

const ELEKTO = `SELECT u.id, u.slug, u.kromnomo, u.priskribo, u.nivelo, u.lando_kodo,
        u.vid_regiono, u.vid_urbo, u.vid_priskribo, u.vid_lingvoj, u.vid_interesoj,
        u.stato, u.gxisdatigita, u.vid_bildo,
        b.gxisdatigita AS bildo_versio, b.kasxita_de_moderiganto AS bildo_kasxita,
        g.id AS regiono_id, g.nomo AS regiono_nomo,
        r.id AS urbo_id, r.nomo AS urbo_nomo, r.nomo_eo AS urbo_nomo_eo, r.lando_kodo AS urbo_lando
   FROM uzantoj u
   LEFT JOIN regionoj g ON g.id = u.regiono_id
   LEFT JOIN urboj r ON r.id = u.urbo_id
   LEFT JOIN profilbildoj b ON b.uzanto_id = u.id`;

type Grupoj = {
  ligiloj: LigiloVico[];
  lingvoj: string[];
  interesoj: string[];
};

function alProfilo(uzanto: UzantoVico, g: Grupoj): PlenaProfilo {
  return {
    id: uzanto.id,
    slug: uzanto.slug,
    kromnomo: uzanto.kromnomo,
    nivelo: uzanto.nivelo,
    priskribo: uzanto.priskribo,
    landoKodo: uzanto.lando_kodo ?? uzanto.urbo_lando,
    regiono:
      uzanto.regiono_id && uzanto.regiono_nomo
        ? { id: uzanto.regiono_id, nomo: uzanto.regiono_nomo }
        : null,
    urbo:
      uzanto.urbo_id !== null && uzanto.urbo_nomo && uzanto.urbo_lando
        ? {
            id: uzanto.urbo_id,
            nomo: uzanto.urbo_nomo,
            nomoEo: uzanto.urbo_nomo_eo,
            landoKodo: uzanto.urbo_lando,
          }
        : null,
    lingvoj: g.lingvoj,
    interesoj: g.interesoj,
    ligiloj: g.ligiloj,
    bildo:
      uzanto.bildo_versio !== null
        ? {
            videbleco: uzanto.vid_bildo,
            kasxitaDeModeriganto: uzanto.bildo_kasxita === 1,
            versio: uzanto.bildo_versio,
          }
        : null,
    videbleco: {
      regiono: uzanto.vid_regiono,
      urbo: uzanto.vid_urbo,
      priskribo: uzanto.vid_priskribo,
      lingvoj: uzanto.vid_lingvoj,
      interesoj: uzanto.vid_interesoj,
    },
    stato: uzanto.stato,
    gxisdatigita: uzanto.gxisdatigita,
  };
}

/**
 * Legas plurajn profilojn per du rondiroj al la datumbazo, kiom ajn ili estas.
 * Redonas ilin en la sama ordo kiel `idoj`; mankantaj estas preterlasitaj.
 */
export async function legiProfilojn(db: D1Database, idoj: string[]): Promise<PlenaProfilo[]> {
  if (idoj.length === 0) return [];
  const loko = idoj.map(() => "?").join(", ");

  const { results: uzantoj } = await db
    .prepare(`${ELEKTO} WHERE u.id IN (${loko})`)
    .bind(...idoj)
    .all<UzantoVico>();
  if (uzantoj.length === 0) return [];
  const trovitaj = uzantoj.map((u) => u.id);
  const loko2 = trovitaj.map(() => "?").join(", ");

  const [ligiloj, lingvoj, interesoj] = await db.batch<
    | (LigiloVico & { uzanto_id: string })
    | { uzanto_id: string; lingvo_kodo: string }
    | { uzanto_id: string; sxlosilo: string }
  >([
    db
      .prepare(
        `SELECT uzanto_id, tipo, valoro, videbleco, ordo FROM ligiloj
          WHERE uzanto_id IN (${loko2}) ORDER BY ordo`,
      )
      .bind(...trovitaj),
    db
      .prepare(
        `SELECT uzanto_id, lingvo_kodo FROM uzanto_lingvoj
          WHERE uzanto_id IN (${loko2}) ORDER BY lingvo_kodo`,
      )
      .bind(...trovitaj),
    db
      .prepare(
        `SELECT ui.uzanto_id, i.sxlosilo FROM uzanto_interesoj ui
           JOIN interesoj i ON i.id = ui.interes_id
          WHERE ui.uzanto_id IN (${loko2}) ORDER BY i.sxlosilo`,
      )
      .bind(...trovitaj),
  ]);

  const grupoj = new Map<string, Grupoj>(
    trovitaj.map((id) => [id, { ligiloj: [], lingvoj: [], interesoj: [] }]),
  );
  for (const v of ligiloj.results as (LigiloVico & { uzanto_id: string })[]) {
    grupoj.get(v.uzanto_id)?.ligiloj.push({
      tipo: v.tipo,
      valoro: v.valoro,
      videbleco: v.videbleco,
      ordo: v.ordo,
    });
  }
  for (const v of lingvoj.results as { uzanto_id: string; lingvo_kodo: string }[]) {
    grupoj.get(v.uzanto_id)?.lingvoj.push(v.lingvo_kodo);
  }
  for (const v of interesoj.results as { uzanto_id: string; sxlosilo: string }[]) {
    grupoj.get(v.uzanto_id)?.interesoj.push(v.sxlosilo);
  }

  const lauxId = new Map(uzantoj.map((u) => [u.id, u]));
  return idoj.flatMap((id) => {
    const u = lauxId.get(id);
    const g = grupoj.get(id);
    return u && g ? [alProfilo(u, g)] : [];
  });
}

async function legi(db: D1Database, kie: string, valoro: string): Promise<PlenaProfilo | null> {
  const uzanto = await db
    .prepare(`SELECT u.id FROM uzantoj u WHERE ${kie} = ?1`)
    .bind(valoro)
    .first<{ id: string }>();
  if (!uzanto) return null;
  const [profilo] = await legiProfilojn(db, [uzanto.id]);
  return profilo ?? null;
}

export const legiProfilonLauxSlug = (db: D1Database, slug: string) => legi(db, "u.slug", slug);
export const legiProfilonLauxId = (db: D1Database, id: string) => legi(db, "u.id", id);
