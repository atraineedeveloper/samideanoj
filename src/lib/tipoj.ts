/** Tipoj de la domajno. Vidu docs/fazo-2/datummodelo.md. */

export const VIDEBLECOJ = ["publika", "ensalutintoj", "kasxita"] as const;
export type Videbleco = (typeof VIDEBLECOJ)[number];

export const NIVELOJ = ["komencanto", "progresanto", "flua", "denaska"] as const;
export type Nivelo = (typeof NIVELOJ)[number];

export const LIGILAJ_TIPOJ = [
  "telegramo",
  "whatsapp",
  "signal",
  "discord",
  "mastodon",
  "instagram",
  "fejsbuko",
  "x",
  "bluesky",
  "youtube",
  "tiktok",
  "lernu",
  "pasporta_servo",
  "amikumu",
  "retejo",
  "retposxto",
] as const;
export type LigilaTipo = (typeof LIGILAJ_TIPOJ)[number];

export type ProfilaStato = "aktiva" | "kasxita_de_moderiganto" | "neaktiva";

export interface Urbo {
  id: number;
  nomo: string;
  nomoEo: string | null;
  landoKodo: string;
}

export interface Regiono {
  id: string;
  nomo: string;
}

export interface Ligilo {
  tipo: LigilaTipo;
  valoro: string;
  videbleco: Videbleco;
  ordo: number;
}

/** La tuta profilo, kiel ĝi estas en la datumbazo. NENIAM sendu ĝin rekte al la retumilo. */
export interface PlenaProfilo {
  id: string;
  slug: string;
  kromnomo: string;
  nivelo: Nivelo;
  priskribo: string | null;
  /** Lando (ISO 3166-1 alfa-2): ĉiam publika. */
  landoKodo: string | null;
  regiono: Regiono | null;
  urbo: Urbo | null;
  lingvoj: string[];
  interesoj: string[];
  ligiloj: Ligilo[];
  videbleco: {
    regiono: Videbleco;
    urbo: Videbleco;
    priskribo: Videbleco;
    lingvoj: Videbleco;
    interesoj: Videbleco;
  };
  stato: ProfilaStato;
  gxisdatigita: number;
}

/** Kiu rigardas la profilon. */
export type Rigardanto =
  | { tipo: "vizitanto" }
  | { tipo: "ensalutinto"; uzantoId: string }
  | { tipo: "moderiganto"; uzantoId: string };
