/**
 * Validigo kaj konservado de la redakta formularo de la profilo.
 * La validigo estas pura (testebla sen datumbazo); la konservado estas atoma.
 */

import { LINGVOJ as KONATAJ_LINGVOJ } from "../i18n/esperantaj-nomoj";
import { normigi } from "./ligiloj";
import type { KontrolitaLoko } from "./lokoj";
import { nun } from "./seancoj";
import {
  LIGILAJ_TIPOJ,
  type LigilaTipo,
  type Ligilo,
  NIVELOJ,
  type Nivelo,
  VIDEBLECOJ,
  type Videbleco,
} from "./tipoj";

export const MAKS_LIGILOJ = 20;
export const MAKS_INTERESOJ = 15;
export const MAKS_LINGVOJ = 20;
export const MAKS_PRISKRIBO = 500;

/** La parto de FormData, kiun ni uzas: tiel la validigo estas testebla. */
export interface Formularo {
  get(sxlosilo: string): FormDataEntryValue | null;
  getAll(sxlosilo: string): FormDataEntryValue[];
}

export type ElektitaLoko = { tipo: "urbo"; id: number } | { tipo: "regiono"; id: string };

export interface ProfilaDatumoj {
  kromnomo: string;
  nivelo: Nivelo;
  priskribo: string | null;
  lando: string;
  loko: ElektitaLoko | null;
  videbleco: {
    regiono: Videbleco;
    urbo: Videbleco;
    priskribo: Videbleco;
    lingvoj: Videbleco;
    interesoj: Videbleco;
  };
  lingvoj: string[];
  interesoj: number[];
  ligiloj: Ligilo[];
}

export type ProfilaKampo =
  | "kromnomo"
  | "nivelo"
  | "priskribo"
  | "lando"
  | "loko"
  | "videbleco"
  | "lingvoj"
  | "interesoj"
  | "ligiloj"
  | "ligilo";

export interface ProfilaEraro {
  kampo: ProfilaKampo;
  /** Por "ligilo": la indekso de la vico en la formularo. */
  indekso?: number;
}

const teksto = (v: FormDataEntryValue | null): string => (typeof v === "string" ? v : "");
const tekstoj = (v: FormDataEntryValue[]): string[] =>
  v.filter((x): x is string => typeof x === "string");

// biome-ignore lint/suspicious/noControlCharactersInRegex: ni intence malpermesas regsignojn
const REGSIGNOJ = /[\u0000-\u001f\u007f]/;
// biome-ignore lint/suspicious/noControlCharactersInRegex: novlinioj estas permesataj en la priskribo
const REGSIGNOJ_KROM_NOVLINIO = /[\u0000-\u0009\u000b-\u001f\u007f]/;

const estasVideblaco = (v: string): v is Videbleco => (VIDEBLECOJ as readonly string[]).includes(v);

export function analiziLokon(valoro: string): ElektitaLoko | null | "eraro" {
  if (valoro === "") return null;
  const urbo = /^urbo:(\d{1,10})$/.exec(valoro);
  if (urbo) return { tipo: "urbo", id: Number(urbo[1]) };
  const regiono = /^regiono:([A-Z]{2}\.[A-Za-z0-9]{1,20})$/.exec(valoro);
  if (regiono) return { tipo: "regiono", id: regiono[1] };
  return "eraro";
}

export function validigiProfilon(
  f: Formularo,
): { bone: true; datumoj: ProfilaDatumoj } | { bone: false; eraroj: ProfilaEraro[] } {
  const eraroj: ProfilaEraro[] = [];

  const kromnomo = teksto(f.get("kromnomo")).replace(/\s+/g, " ").trim();
  if (kromnomo.length < 1 || kromnomo.length > 60 || REGSIGNOJ.test(kromnomo)) {
    eraroj.push({ kampo: "kromnomo" });
  }

  const nivelo = teksto(f.get("nivelo"));
  if (!(NIVELOJ as readonly string[]).includes(nivelo)) eraroj.push({ kampo: "nivelo" });

  const priskribo = teksto(f.get("priskribo")).replace(/\r\n?/g, "\n").trim();
  if (priskribo.length > MAKS_PRISKRIBO || REGSIGNOJ_KROM_NOVLINIO.test(priskribo)) {
    eraroj.push({ kampo: "priskribo" });
  }

  const lando = teksto(f.get("lando"));
  if (!/^[A-Z]{2}$/.test(lando)) eraroj.push({ kampo: "lando" });

  const loko = analiziLokon(teksto(f.get("loko")));
  if (loko === "eraro" || (loko?.tipo === "regiono" && !loko.id.startsWith(`${lando}.`))) {
    eraroj.push({ kampo: "loko" });
  }

  const videbleco = {
    regiono: teksto(f.get("vid_regiono")),
    urbo: teksto(f.get("vid_urbo")),
    priskribo: teksto(f.get("vid_priskribo")),
    lingvoj: teksto(f.get("vid_lingvoj")),
    interesoj: teksto(f.get("vid_interesoj")),
  };
  if (!Object.values(videbleco).every(estasVideblaco)) eraroj.push({ kampo: "videbleco" });

  const lingvoj = [...new Set(tekstoj(f.getAll("lingvoj")))];
  if (
    lingvoj.length > MAKS_LINGVOJ ||
    lingvoj.some((l) => l === "eo" || !Object.hasOwn(KONATAJ_LINGVOJ, l))
  ) {
    eraroj.push({ kampo: "lingvoj" });
  }

  const interesoj = [...new Set(tekstoj(f.getAll("interesoj")))];
  if (interesoj.length > MAKS_INTERESOJ || interesoj.some((i) => !/^\d{1,4}$/.test(i))) {
    eraroj.push({ kampo: "interesoj" });
  }

  const tipoj = tekstoj(f.getAll("ligilo_tipo"));
  const valoroj = tekstoj(f.getAll("ligilo_valoro"));
  const videblecoj = tekstoj(f.getAll("ligilo_videbleco"));
  const ligiloj: Ligilo[] = [];
  if (tipoj.length !== valoroj.length || tipoj.length !== videblecoj.length) {
    eraroj.push({ kampo: "ligiloj" });
  } else {
    tipoj.forEach((tipo, indekso) => {
      const valoro = valoroj[indekso].trim();
      if (valoro === "") return; // malplena vico: ignorata
      const vid = videblecoj[indekso];
      if (!(LIGILAJ_TIPOJ as readonly string[]).includes(tipo) || !estasVideblaco(vid)) {
        eraroj.push({ kampo: "ligilo", indekso });
        return;
      }
      const normigita = normigi(tipo as LigilaTipo, valoro);
      if (!normigita.bone) {
        eraroj.push({ kampo: "ligilo", indekso });
        return;
      }
      ligiloj.push({
        tipo: tipo as LigilaTipo,
        valoro: normigita.valoro,
        videbleco: vid,
        ordo: ligiloj.length,
      });
    });
    if (ligiloj.length > MAKS_LIGILOJ) eraroj.push({ kampo: "ligiloj" });
  }

  if (eraroj.length > 0) return { bone: false, eraroj };

  return {
    bone: true,
    datumoj: {
      kromnomo,
      nivelo: nivelo as Nivelo,
      priskribo: priskribo || null,
      lando,
      loko: loko as ElektitaLoko | null,
      videbleco: videbleco as ProfilaDatumoj["videbleco"],
      lingvoj,
      interesoj: interesoj.map(Number),
      ligiloj,
    },
  };
}

/** Konservas la profilon en unu atoma aro. Redonas false, se iu intereso ne ekzistas. */
export async function konserviProfilon(
  db: D1Database,
  uzantoId: string,
  d: ProfilaDatumoj,
  loko: KontrolitaLoko,
): Promise<boolean> {
  if (d.interesoj.length > 0) {
    const lokokupiloj = d.interesoj.map((_, i) => `?${i + 1}`).join(", ");
    const trovitaj = await db
      .prepare(`SELECT count(*) AS n FROM interesoj WHERE id IN (${lokokupiloj})`)
      .bind(...d.interesoj)
      .first<{ n: number }>();
    if (trovitaj?.n !== d.interesoj.length) return false;
  }

  const t = nun();
  await db.batch([
    db
      .prepare(
        `UPDATE uzantoj SET kromnomo = ?2, nivelo = ?3, priskribo = ?4,
           lando_kodo = ?5, regiono_id = ?6, urbo_id = ?7,
           vid_regiono = ?8, vid_urbo = ?9, vid_priskribo = ?10, vid_lingvoj = ?11,
           vid_interesoj = ?12, gxisdatigita = ?13
         WHERE id = ?1`,
      )
      .bind(
        uzantoId,
        d.kromnomo,
        d.nivelo,
        d.priskribo,
        loko.landoKodo,
        loko.regionoId,
        loko.urboId,
        d.videbleco.regiono,
        d.videbleco.urbo,
        d.videbleco.priskribo,
        d.videbleco.lingvoj,
        d.videbleco.interesoj,
        t,
      ),
    db.prepare("DELETE FROM ligiloj WHERE uzanto_id = ?1").bind(uzantoId),
    db.prepare("DELETE FROM uzanto_lingvoj WHERE uzanto_id = ?1").bind(uzantoId),
    db.prepare("DELETE FROM uzanto_interesoj WHERE uzanto_id = ?1").bind(uzantoId),
    ...d.ligiloj.map((l) =>
      db
        .prepare(
          "INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES (?1, ?2, ?3, ?4, ?5)",
        )
        .bind(uzantoId, l.tipo, l.valoro, l.videbleco, l.ordo),
    ),
    ...d.lingvoj.map((l) =>
      db
        .prepare("INSERT INTO uzanto_lingvoj (uzanto_id, lingvo_kodo) VALUES (?1, ?2)")
        .bind(uzantoId, l),
    ),
    ...d.interesoj.map((i) =>
      db
        .prepare("INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES (?1, ?2)")
        .bind(uzantoId, i),
    ),
  ]);
  return true;
}
