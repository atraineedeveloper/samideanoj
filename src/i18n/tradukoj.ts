/**
 * Tradukoj de la interfaco. Esperanto estas la ĉefa lingvo; la aliaj lingvoj
 * povas manki iujn ŝlosilojn, kaj tiam ni montras la esperantan tekston.
 */

import { LANDOJ, LINGVOJ as LINGVONOMOJ, MONATOJ } from "./esperantaj-nomoj";

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

  "navigado.hejmo": "Hejmo",
  "navigado.cxefa": "Ĉefa navigado",

  "profilo.interesoj": "Interesoj",
  "profilo.ankaux-parolas": "Ankaŭ parolas",
  "profilo.kie-trovi": "Kie trovi min",
  "profilo.neniuj-kontaktiloj": "Ĉi tiu samideano ankoraŭ ne aldonis publikajn kontaktilojn.",
  "profilo.sxlosita": "Ensalutu por vidi",
  "profilo.pli-post-ensaluto": "Ensalutu por vidi pli da informoj pri ĉi tiu samideano.",
  "profilo.gxisdatigita": "Laste ĝisdatigita",
  "profilo.via-profilo": "Ĉi tio estas via profilo, kiel vi vidas ĝin.",

  "navigado.ensaluti": "Ensaluti",
  "navigado.elsaluti": "Elsaluti",
  "navigado.mia-profilo": "Mia profilo",

  "ensaluti.titolo": "Bonvenon, samideano!",
  "ensaluti.subtitolo":
    "Ensalutu per konto, kiun vi jam havas. Neniu pasvorto, neniu retpoŝto de ni.",
  "ensaluti.google": "Daŭrigi per Google",
  "ensaluti.github": "Daŭrigi per GitHub",
  "ensaluti.promeso1": "Ni konservas nur la identigilon de via konto, ne vian nomon nek retpoŝton.",
  "ensaluti.promeso2": "Vi decidas, kio estas videbla, kampon post kampo.",
  "ensaluti.promeso3": "Vi povas eksporti aŭ forigi ĉion iam ajn.",
  "ensaluti.sekureco":
    "La ensaluto okazas ĉe accounts.google.com, github.com aŭ oauth.telegram.org. Neniam tajpu vian pasvorton en alia retejo.",
  "ensaluti.eraro": "La ensaluto ne sukcesis. Bonvolu provi denove.",
  "ensaluti.neniu-provizanto": "La ensaluto ankoraŭ ne estas agordita en ĉi tiu medio.",
  "ensaluti.jam": "Vi jam estas ensalutinta.",
  "ensaluti.agxo": "Minimuma aĝo: 16 jaroj.",

  "aligxi.titolo": "Kreu vian profilon",
  "aligxi.subtitolo": "Nur du demandoj por komenci. Vi povos aldoni pli poste.",
  "aligxi.kromnomo": "Kromnomo",
  "aligxi.kromnomo-helpo": "Ĝi estas ĉiam publika. Ne necesas uzi vian veran nomon.",
  "aligxi.nivelo": "Via nivelo de Esperanto",
  "aligxi.agxo": "Mi havas almenaŭ 16 jarojn.",
  "aligxi.krei": "Krei mian profilon",
  "aligxi.eraro.kromnomo": "Skribu kromnomon de 1 ĝis 60 signoj.",
  "aligxi.eraro.nivelo": "Elektu vian nivelon.",
  "aligxi.eraro.agxo": "Samideanoj estas por homoj de almenaŭ 16 jaroj.",
  "aligxi.eksvalidigxis": "La aliĝo eksvalidiĝis. Bonvolu ensaluti denove.",

  "eraro.404.titolo": "Paĝo ne trovita",
  "eraro.404.teksto": "Ni ne trovis tion, kion vi serĉas. Eble la profilo ne plu ekzistas.",
  "eraro.reen": "Reen al la hejmpaĝo",

  "nivelo.komencanto": "Komencanto",
  "nivelo.progresanto": "Progresanto",
  "nivelo.flua": "Flua",
  "nivelo.denaska": "Denaska",

  "ligilo.telegramo": "Telegramo",
  "ligilo.whatsapp": "WhatsApp",
  "ligilo.signal": "Signal",
  "ligilo.discord": "Discord",
  "ligilo.mastodon": "Mastodon",
  "ligilo.instagram": "Instagram",
  "ligilo.fejsbuko": "Fejsbuko",
  "ligilo.x": "X",
  "ligilo.bluesky": "Bluesky",
  "ligilo.youtube": "YouTube",
  "ligilo.tiktok": "TikTok",
  "ligilo.lernu": "lernu.net",
  "ligilo.pasporta_servo": "Pasporta Servo",
  "ligilo.amikumu": "Amikumu",
  "ligilo.retejo": "Retejo",
  "ligilo.retposxto": "Retpoŝto",

  "intereso.literaturo": "Literaturo",
  "intereso.vojagxoj": "Vojaĝoj",
  "intereso.muziko": "Muziko",
  "intereso.programado": "Programado",
  "intereso.sxako": "Ŝako",
  "intereso.kantado": "Kantado",
  "intereso.kuirado": "Kuirado",
  "intereso.historio": "Historio",
  "intereso.filmoj": "Filmoj",
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
    "navigado.hejmo": "Inicio",
    "navigado.cxefa": "Navegación principal",
    "profilo.interesoj": "Intereses",
    "profilo.ankaux-parolas": "También habla",
    "profilo.kie-trovi": "Dónde encontrarme",
    "profilo.neniuj-kontaktiloj": "Este samideano todavía no ha agregado contactos públicos.",
    "profilo.sxlosita": "Inicia sesión para ver",
    "profilo.pli-post-ensaluto": "Inicia sesión para ver más información de este samideano.",
    "profilo.gxisdatigita": "Última actualización",
    "profilo.via-profilo": "Este es tu perfil, tal como tú lo ves.",
    "navigado.ensaluti": "Iniciar sesión",
    "navigado.elsaluti": "Cerrar sesión",
    "navigado.mia-profilo": "Mi perfil",
    "ensaluti.titolo": "¡Bienvenido, samideano!",
    "ensaluti.subtitolo":
      "Inicia sesión con una cuenta que ya tienes. Sin contraseñas y sin pedirte el correo.",
    "ensaluti.google": "Continuar con Google",
    "ensaluti.github": "Continuar con GitHub",
    "ensaluti.promeso1": "Solo guardamos el identificador de tu cuenta, no tu nombre ni tu correo.",
    "ensaluti.promeso2": "Tú decides qué es visible, campo por campo.",
    "ensaluti.promeso3": "Puedes exportar o borrar todo en cualquier momento.",
    "ensaluti.sekureco":
      "El inicio de sesión ocurre en accounts.google.com, github.com u oauth.telegram.org. Nunca escribas tu contraseña en otro sitio.",
    "ensaluti.eraro": "No se pudo iniciar sesión. Inténtalo de nuevo.",
    "ensaluti.neniu-provizanto": "El inicio de sesión todavía no está configurado en este entorno.",
    "ensaluti.jam": "Ya iniciaste sesión.",
    "ensaluti.agxo": "Edad mínima: 16 años.",
    "aligxi.titolo": "Crea tu perfil",
    "aligxi.subtitolo": "Solo dos preguntas para empezar. Podrás agregar más después.",
    "aligxi.kromnomo": "Apodo",
    "aligxi.kromnomo-helpo": "Siempre es público. No hace falta usar tu nombre real.",
    "aligxi.nivelo": "Tu nivel de esperanto",
    "aligxi.agxo": "Tengo al menos 16 años.",
    "aligxi.krei": "Crear mi perfil",
    "aligxi.eraro.kromnomo": "Escribe un apodo de 1 a 60 caracteres.",
    "aligxi.eraro.nivelo": "Elige tu nivel.",
    "aligxi.eraro.agxo": "Samideanoj es para personas de al menos 16 años.",
    "aligxi.eksvalidigxis": "El registro expiró. Vuelve a iniciar sesión.",
    "eraro.404.titolo": "Página no encontrada",
    "eraro.404.teksto": "No encontramos lo que buscas. Quizá el perfil ya no existe.",
    "eraro.reen": "Volver al inicio",
    "nivelo.komencanto": "Principiante",
    "nivelo.progresanto": "Intermedio",
    "nivelo.flua": "Fluido",
    "nivelo.denaska": "Nativo",
    "ligilo.fejsbuko": "Facebook",
    "ligilo.retejo": "Sitio web",
    "ligilo.retposxto": "Correo",
    "intereso.literaturo": "Literatura",
    "intereso.vojagxoj": "Viajes",
    "intereso.muziko": "Música",
    "intereso.programado": "Programación",
    "intereso.sxako": "Ajedrez",
    "intereso.kantado": "Canto",
    "intereso.kuirado": "Cocina",
    "intereso.historio": "Historia",
    "intereso.filmoj": "Cine",
  },
  en: {
    "retejo.priskribo": "An open, opt-in directory of Esperanto speakers.",
    "hejmo.titolo": "Find samideanoj near you",
    "hejmo.subtitolo": "An opt-in directory of Esperanto speakers. You decide what to show.",
    "hejmo.baldaux":
      "We are building Samideanoj. Soon you will be able to add yourself to the map.",
    "hejmo.deponejo": "Follow the project on GitHub",
    "navigado.hejmo": "Home",
    "navigado.cxefa": "Main navigation",
    "profilo.interesoj": "Interests",
    "profilo.ankaux-parolas": "Also speaks",
    "profilo.kie-trovi": "Where to find me",
    "profilo.neniuj-kontaktiloj": "This samideano has not added any public contacts yet.",
    "profilo.sxlosita": "Sign in to see",
    "profilo.pli-post-ensaluto": "Sign in to see more about this samideano.",
    "profilo.gxisdatigita": "Last updated",
    "profilo.via-profilo": "This is your profile, as you see it.",
    "navigado.ensaluti": "Sign in",
    "navigado.elsaluti": "Sign out",
    "navigado.mia-profilo": "My profile",
    "ensaluti.titolo": "Welcome, samideano!",
    "ensaluti.subtitolo":
      "Sign in with an account you already have. No passwords, and we never ask for your email.",
    "ensaluti.google": "Continue with Google",
    "ensaluti.github": "Continue with GitHub",
    "ensaluti.promeso1": "We only store your account ID, not your name or email.",
    "ensaluti.promeso2": "You decide what is visible, field by field.",
    "ensaluti.promeso3": "You can export or delete everything at any time.",
    "ensaluti.sekureco":
      "Sign-in happens at accounts.google.com, github.com or oauth.telegram.org. Never type your password on any other site.",
    "ensaluti.eraro": "Sign-in failed. Please try again.",
    "ensaluti.neniu-provizanto": "Sign-in is not configured in this environment yet.",
    "ensaluti.jam": "You are already signed in.",
    "ensaluti.agxo": "Minimum age: 16.",
    "aligxi.titolo": "Create your profile",
    "aligxi.subtitolo": "Just two questions to start. You can add more later.",
    "aligxi.kromnomo": "Nickname",
    "aligxi.kromnomo-helpo": "It is always public. You don't need to use your real name.",
    "aligxi.nivelo": "Your Esperanto level",
    "aligxi.agxo": "I am at least 16 years old.",
    "aligxi.krei": "Create my profile",
    "aligxi.eraro.kromnomo": "Enter a nickname of 1 to 60 characters.",
    "aligxi.eraro.nivelo": "Choose your level.",
    "aligxi.eraro.agxo": "Samideanoj is for people aged 16 and over.",
    "aligxi.eksvalidigxis": "Your sign-up expired. Please sign in again.",
    "eraro.404.titolo": "Page not found",
    "eraro.404.teksto":
      "We could not find what you are looking for. The profile may no longer exist.",
    "eraro.reen": "Back to the home page",
    "nivelo.komencanto": "Beginner",
    "nivelo.progresanto": "Intermediate",
    "nivelo.flua": "Fluent",
    "nivelo.denaska": "Native",
    "ligilo.telegramo": "Telegram",
    "ligilo.fejsbuko": "Facebook",
    "ligilo.retejo": "Website",
    "ligilo.retposxto": "Email",
    "intereso.literaturo": "Literature",
    "intereso.vojagxoj": "Travel",
    "intereso.muziko": "Music",
    "intereso.programado": "Programming",
    "intereso.sxako": "Chess",
    "intereso.kantado": "Singing",
    "intereso.kuirado": "Cooking",
    "intereso.historio": "History",
    "intereso.filmoj": "Film",
  },
};

export function estasLingvo(valoro: unknown): valoro is Lingvo {
  return typeof valoro === "string" && (LINGVOJ as readonly string[]).includes(valoro);
}

export function estasSxlosilo(valoro: string): valoro is Sxlosilo {
  return Object.hasOwn(eo, valoro);
}

/** Redonas tradukilon por la donita lingvo, kun Esperanto kiel rezervo. */
export function tradukilo(lingvo: string | undefined) {
  const l: Lingvo = estasLingvo(lingvo) ? lingvo : CXEFA_LINGVO;
  return (sxlosilo: Sxlosilo): string => tradukoj[l][sxlosilo] ?? eo[sxlosilo];
}

/**
 * Tradukas ŝlosilon konstruitan dum rultempo (ekz. "intereso." + valoro el la
 * datumbazo). Se la ŝlosilo ne ekzistas, redonas la rezervan tekston.
 */
export function tradukiDinamike(lingvo: string | undefined, sxlosilo: string, rezervo: string) {
  return estasSxlosilo(sxlosilo) ? tradukilo(lingvo)(sxlosilo) : rezervo;
}

/** Nomo de lingvo aŭ lando en la lingvo de la interfaco, kun la kodo kiel lasta rezervo. */
export function nomoDe(tipo: "language" | "region", kodo: string, lingvo: string | undefined) {
  if (!estasLingvo(lingvo) || lingvo === "eo") {
    const esperanta = tipo === "language" ? LINGVONOMOJ[kodo] : LANDOJ[kodo];
    if (esperanta) return esperanta;
  }
  try {
    return new Intl.DisplayNames([lingvo ?? CXEFA_LINGVO, "en"], { type: tipo }).of(kodo) ?? kodo;
  } catch {
    return kodo;
  }
}

/** Monato kaj jaro, ekz. "oktobro 2026", "octubre de 2026", "October 2026". */
export function monatoKajJaro(dato: Date, lingvo: string | undefined) {
  if (!estasLingvo(lingvo) || lingvo === "eo") {
    return `${MONATOJ[dato.getUTCMonth()]} ${dato.getUTCFullYear()}`;
  }
  try {
    return new Intl.DateTimeFormat(lingvo, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(dato);
  } catch {
    return dato.toISOString().slice(0, 7);
  }
}
