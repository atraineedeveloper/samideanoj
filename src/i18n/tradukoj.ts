/**
 * Tradukoj de la interfaco. Esperanto estas la ĉefa lingvo; la aliaj lingvoj
 * povas manki iujn ŝlosilojn, kaj tiam ni montras la esperantan tekston.
 */

export const LINGVOJ = ["eo", "es", "en"] as const;
export type Lingvo = (typeof LINGVOJ)[number];
export const CXEFA_LINGVO: Lingvo = "eo";

const eo = {
  "retejo.nomo": "Samideanoj",
  "retejo.priskribo": "Malferma kaj libervola adresaro de esperantistoj.",
  "hejmo.titolo": "Trovu samideanojn ĉirkaŭ vi",
  "hejmo.subtitolo": "Libervola adresaro de esperantistoj. Vi decidas, kion montri.",
  "hejmo.baldaux": "Ni konstruas Samideanojn. Baldaŭ vi povos aldoni vin al la mapo.",
  "hejmo.deponejo": "Sekvu la projekton en GitHub",
} as const;

export type Sxlosilo = keyof typeof eo;

const tradukoj: Record<Lingvo, Partial<Record<Sxlosilo, string>>> = {
  eo,
  es: {
    "retejo.priskribo": "Directorio abierto y voluntario de esperantistas.",
    "hejmo.titolo": "Encuentra samideanos cerca de ti",
    "hejmo.subtitolo": "Directorio voluntario de esperantistas. Tú decides qué mostrar.",
    "hejmo.baldaux": "Estamos construyendo Samideanoj. Pronto podrás agregarte al mapa.",
    "hejmo.deponejo": "Sigue el proyecto en GitHub",
  },
  en: {
    "retejo.priskribo": "An open, opt-in directory of Esperanto speakers.",
    "hejmo.titolo": "Find samideanoj near you",
    "hejmo.subtitolo": "An opt-in directory of Esperanto speakers. You decide what to show.",
    "hejmo.baldaux":
      "We are building Samideanoj. Soon you will be able to add yourself to the map.",
    "hejmo.deponejo": "Follow the project on GitHub",
  },
};

export function estasLingvo(valoro: unknown): valoro is Lingvo {
  return typeof valoro === "string" && (LINGVOJ as readonly string[]).includes(valoro);
}

/** Redonas tradukilon por la donita lingvo, kun Esperanto kiel rezervo. */
export function tradukilo(lingvo: string | undefined) {
  const l: Lingvo = estasLingvo(lingvo) ? lingvo : CXEFA_LINGVO;
  return (sxlosilo: Sxlosilo): string => tradukoj[l][sxlosilo] ?? eo[sxlosilo];
}
