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

  "piedo.geonames": "Geografiaj datumoj",
  "piedo.kodo": "Malferma kodo",
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

  "provo.titolo": "Prova medio",
  "provo.teksto":
    "Ĉi tio ekzistas nur en la provmedio. Ensalutu kiel ekzempla uzanto por vidi la sistemon el ĉiu rolo.",
  "provo.moderiganto": "moderiganto",
  "provo.kasxita": "kaŝita de moderiganto",

  "aligxi.titolo": "Kreu vian profilon",
  "aligxi.subtitolo": "Nur kelkaj demandoj por komenci. Vi povos aldoni pli poste.",
  "aligxi.kromnomo": "Kromnomo",
  "aligxi.kromnomo-helpo": "Ĝi estas ĉiam publika. Ne necesas uzi vian veran nomon.",
  "aligxi.nivelo": "Via nivelo de Esperanto",
  "aligxi.lando": "Lando",
  "aligxi.lando-elektu": "Elektu vian landon",
  "aligxi.eraro.lando": "Elektu vian landon.",
  "aligxi.agxo": "Mi havas almenaŭ 16 jarojn.",
  "aligxi.krei": "Krei mian profilon",
  "aligxi.eraro.kromnomo": "Skribu kromnomon de 1 ĝis 60 signoj.",
  "aligxi.eraro.nivelo": "Elektu vian nivelon.",
  "aligxi.eraro.agxo": "Samideanoj estas por homoj de almenaŭ 16 jaroj.",
  "aligxi.eksvalidigxis": "La aliĝo eksvalidiĝis. Bonvolu ensaluti denove.",

  "bildo.titolo": "Profilbildo",
  "bildo.helpo":
    "Ni eltondas kvadraton kaj malgrandigas ĝin. La loko kaj aliaj datumoj de la foto estas forigitaj antaŭ la alŝuto.",
  "bildo.elekti": "Elekti bildon",
  "bildo.sxangxi": "Ŝanĝi bildon",
  "bildo.forigi": "Forigi bildon",
  "bildo.via-bildo": "Via profilbildo",
  "bildo.laboranta": "Konservante…",
  "bildo.konservita": "La bildo estas konservita.",
  "bildo.forigita": "La bildo estas forigita.",
  "bildo.kasxita-de-moderiganto":
    "Moderiganto kaŝis ĉi tiun bildon post raporto. Nur vi kaj la moderigantoj vidas ĝin.",
  "bildo.eraro.ne-legebla": "Ni ne povis legi ĉi tiun dosieron. Provu per JPEG- aŭ PNG-bildo.",
  "bildo.eraro.tro-malgranda": "La bildo estas tro malgranda (minimume 64 × 64 bilderoj).",
  "bildo.eraro.tro-granda": "Ni ne sukcesis sufiĉe malgrandigi la bildon. Provu per alia.",
  "bildo.eraro.gxenerala": "La bildo ne estis konservita. Provu denove.",
  "redakti.titolo": "Redakti mian profilon",
  "redakti.konservi": "Konservi",
  "redakti.konservita": "Viaj ŝanĝoj estas konservitaj.",
  "redakti.redakti": "Redakti",
  "redakti.vidi": "Vidi mian publikan profilon",
  "redakti.eraroj": "Bonvolu korekti la markitajn kampojn.",
  "redakti.pri-vi": "Pri vi",
  "redakti.priskribo": "Priskribo",
  "redakti.priskribo-helpo": "Kelkaj vortoj pri vi kaj kial vi ŝatas Esperanton.",
  "redakti.loko": "Loko",
  "redakti.loko-helpo":
    "La lando estas ĉiam publika. Vi povas aldoni vian ŝtaton aŭ urbon, aŭ nenion.",
  "redakti.urbo-aux-regiono": "Urbo aŭ ŝtato",
  "redakti.urbo-ekzemplo": "Tajpu almenaŭ 2 literojn…",
  "redakti.regiono": "Ŝtato aŭ provinco",
  "redakti.urbo": "Urbo",
  "redakti.nur-regiono": "ŝtato",
  "redakti.forigi-lokon": "Forigi la urbon",
  "redakti.neniu-rezulto": "Nenio trovita. Provu alian nomon aŭ elektu vian ŝtaton.",
  "redakti.lingvoj": "Aliaj lingvoj, kiujn vi parolas",
  "redakti.interesoj": "Interesoj",
  "redakti.kontaktiloj": "Kontaktiloj",
  "redakti.kontaktiloj-helpo": "Kie aliaj samideanoj povas trovi vin. Vi elektas, kiu vidas ĉiun.",
  "redakti.tipo": "Tipo",
  "redakti.valoro": "Uzantnomo aŭ ligilo",
  "redakti.aldoni-kontaktilon": "Aldoni kontaktilon",
  "redakti.forigi": "Forigi",
  "redakti.kiu-vidas": "Kiu povas vidi?",
  "redakti.eraro.kromnomo": "Skribu kromnomon de 1 ĝis 60 signoj.",
  "redakti.eraro.priskribo": "La priskribo povas havi maksimume 500 signojn.",
  "redakti.eraro.lando": "Elektu vian landon.",
  "redakti.eraro.loko": "Elektu urbon aŭ ŝtaton el la listo.",
  "redakti.eraro.ligilo": "Ĉi tiu valoro ne ŝajnas valida por ĉi tiu tipo.",
  "redakti.eraro.ligiloj": "Maksimume 20 kontaktiloj.",
  "redakti.eraro.gxenerala": "Io ne funkciis. Bonvolu kontroli la formularon.",
  "videbleco.publika": "Ĉiuj",
  "videbleco.ensalutintoj": "Nur ensalutintoj",
  "videbleco.kasxita": "Nur mi",
  "intereso.lingvoj": "Lingvoj",
  "intereso.tradukado": "Tradukado",
  "intereso.instruado": "Instruado",
  "intereso.sporto": "Sporto",
  "intereso.naturo": "Naturo",
  "intereso.fotografado": "Fotografado",
  "intereso.arto": "Arto",
  "intereso.scienco": "Scienco",
  "intereso.ludoj": "Ludoj",
  "intereso.politiko": "Politiko",
  "intereso.filozofio": "Filozofio",
  "intereso.teatro": "Teatro",
  "intereso.dancado": "Dancado",
  "intereso.ekologio": "Ekologio",
  "intereso.religio": "Religio",
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
    "piedo.geonames": "Datos geográficos",
    "piedo.kodo": "Código abierto",
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
    "provo.titolo": "Entorno de pruebas",
    "provo.teksto":
      "Esto solo existe en el entorno de pruebas. Entra como un usuario de ejemplo para ver el sistema desde cada rol.",
    "provo.moderiganto": "moderador",
    "provo.kasxita": "oculto por moderación",
    "aligxi.titolo": "Crea tu perfil",
    "aligxi.subtitolo": "Solo unas preguntas para empezar. Podrás agregar más después.",
    "aligxi.kromnomo": "Apodo",
    "aligxi.kromnomo-helpo": "Siempre es público. No hace falta usar tu nombre real.",
    "aligxi.nivelo": "Tu nivel de esperanto",
    "aligxi.lando": "País",
    "aligxi.lando-elektu": "Elige tu país",
    "aligxi.eraro.lando": "Elige tu país.",
    "aligxi.agxo": "Tengo al menos 16 años.",
    "aligxi.krei": "Crear mi perfil",
    "aligxi.eraro.kromnomo": "Escribe un apodo de 1 a 60 caracteres.",
    "aligxi.eraro.nivelo": "Elige tu nivel.",
    "aligxi.eraro.agxo": "Samideanoj es para personas de al menos 16 años.",
    "aligxi.eksvalidigxis": "El registro expiró. Vuelve a iniciar sesión.",
    "bildo.titolo": "Foto de perfil",
    "bildo.helpo":
      "Recortamos un cuadrado y lo reducimos. La ubicación y otros datos de la foto se eliminan antes de subirla.",
    "bildo.elekti": "Elegir foto",
    "bildo.sxangxi": "Cambiar foto",
    "bildo.forigi": "Quitar foto",
    "bildo.via-bildo": "Tu foto de perfil",
    "bildo.laboranta": "Guardando…",
    "bildo.konservita": "La foto se guardó.",
    "bildo.forigita": "La foto se quitó.",
    "bildo.kasxita-de-moderiganto":
      "Un moderador ocultó esta foto tras un reporte. Solo tú y los moderadores la ven.",
    "bildo.eraro.ne-legebla": "No pudimos leer este archivo. Prueba con una imagen JPEG o PNG.",
    "bildo.eraro.tro-malgranda": "La imagen es demasiado pequeña (mínimo 64 × 64 píxeles).",
    "bildo.eraro.tro-granda": "No logramos reducir lo suficiente la imagen. Prueba con otra.",
    "bildo.eraro.gxenerala": "La foto no se guardó. Inténtalo de nuevo.",
    "redakti.titolo": "Editar mi perfil",
    "redakti.konservi": "Guardar",
    "redakti.konservita": "Tus cambios se guardaron.",
    "redakti.redakti": "Editar",
    "redakti.vidi": "Ver mi perfil público",
    "redakti.eraroj": "Corrige los campos marcados.",
    "redakti.pri-vi": "Sobre ti",
    "redakti.priskribo": "Descripción",
    "redakti.priskribo-helpo": "Unas palabras sobre ti y por qué te gusta el esperanto.",
    "redakti.loko": "Ubicación",
    "redakti.loko-helpo":
      "El país siempre es público. Puedes agregar tu estado o tu ciudad, o nada.",
    "redakti.urbo-aux-regiono": "Ciudad o estado",
    "redakti.urbo-ekzemplo": "Escribe al menos 2 letras…",
    "redakti.regiono": "Estado o provincia",
    "redakti.urbo": "Ciudad",
    "redakti.nur-regiono": "estado",
    "redakti.forigi-lokon": "Quitar la ciudad",
    "redakti.neniu-rezulto": "No se encontró nada. Prueba otro nombre o elige tu estado.",
    "redakti.lingvoj": "Otros idiomas que hablas",
    "redakti.interesoj": "Intereses",
    "redakti.kontaktiloj": "Contactos",
    "redakti.kontaktiloj-helpo":
      "Dónde pueden encontrarte otros samideanos. Tú eliges quién ve cada uno.",
    "redakti.tipo": "Tipo",
    "redakti.valoro": "Usuario o enlace",
    "redakti.aldoni-kontaktilon": "Agregar contacto",
    "redakti.forigi": "Quitar",
    "redakti.kiu-vidas": "¿Quién puede ver?",
    "redakti.eraro.kromnomo": "Escribe un apodo de 1 a 60 caracteres.",
    "redakti.eraro.priskribo": "La descripción puede tener máximo 500 caracteres.",
    "redakti.eraro.lando": "Elige tu país.",
    "redakti.eraro.loko": "Elige una ciudad o un estado de la lista.",
    "redakti.eraro.ligilo": "Este valor no parece válido para este tipo.",
    "redakti.eraro.ligiloj": "Máximo 20 contactos.",
    "redakti.eraro.gxenerala": "Algo salió mal. Revisa el formulario.",
    "videbleco.publika": "Todos",
    "videbleco.ensalutintoj": "Solo registrados",
    "videbleco.kasxita": "Solo yo",
    "intereso.lingvoj": "Idiomas",
    "intereso.tradukado": "Traducción",
    "intereso.instruado": "Enseñanza",
    "intereso.sporto": "Deporte",
    "intereso.naturo": "Naturaleza",
    "intereso.fotografado": "Fotografía",
    "intereso.arto": "Arte",
    "intereso.scienco": "Ciencia",
    "intereso.ludoj": "Juegos",
    "intereso.politiko": "Política",
    "intereso.filozofio": "Filosofía",
    "intereso.teatro": "Teatro",
    "intereso.dancado": "Baile",
    "intereso.ekologio": "Ecología",
    "intereso.religio": "Religión",
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
    "piedo.geonames": "Geographic data",
    "piedo.kodo": "Open source",
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
    "provo.titolo": "Test environment",
    "provo.teksto":
      "This only exists in the test environment. Sign in as an example user to see the system from each role.",
    "provo.moderiganto": "moderator",
    "provo.kasxita": "hidden by moderation",
    "aligxi.titolo": "Create your profile",
    "aligxi.subtitolo": "Just a few questions to start. You can add more later.",
    "aligxi.kromnomo": "Nickname",
    "aligxi.kromnomo-helpo": "It is always public. You don't need to use your real name.",
    "aligxi.nivelo": "Your Esperanto level",
    "aligxi.lando": "Country",
    "aligxi.lando-elektu": "Choose your country",
    "aligxi.eraro.lando": "Choose your country.",
    "aligxi.agxo": "I am at least 16 years old.",
    "aligxi.krei": "Create my profile",
    "aligxi.eraro.kromnomo": "Enter a nickname of 1 to 60 characters.",
    "aligxi.eraro.nivelo": "Choose your level.",
    "aligxi.eraro.agxo": "Samideanoj is for people aged 16 and over.",
    "aligxi.eksvalidigxis": "Your sign-up expired. Please sign in again.",
    "bildo.titolo": "Profile photo",
    "bildo.helpo":
      "We crop a square and shrink it. The photo's location and other data are removed before uploading.",
    "bildo.elekti": "Choose photo",
    "bildo.sxangxi": "Change photo",
    "bildo.forigi": "Remove photo",
    "bildo.via-bildo": "Your profile photo",
    "bildo.laboranta": "Saving…",
    "bildo.konservita": "The photo was saved.",
    "bildo.forigita": "The photo was removed.",
    "bildo.kasxita-de-moderiganto":
      "A moderator hid this photo after a report. Only you and the moderators can see it.",
    "bildo.eraro.ne-legebla": "We couldn't read this file. Try a JPEG or PNG image.",
    "bildo.eraro.tro-malgranda": "The image is too small (at least 64 × 64 pixels).",
    "bildo.eraro.tro-granda": "We couldn't shrink the image enough. Try another one.",
    "bildo.eraro.gxenerala": "The photo wasn't saved. Please try again.",
    "redakti.titolo": "Edit my profile",
    "redakti.konservi": "Save",
    "redakti.konservita": "Your changes were saved.",
    "redakti.redakti": "Edit",
    "redakti.vidi": "View my public profile",
    "redakti.eraroj": "Please fix the highlighted fields.",
    "redakti.pri-vi": "About you",
    "redakti.priskribo": "Description",
    "redakti.priskribo-helpo": "A few words about you and why you like Esperanto.",
    "redakti.loko": "Location",
    "redakti.loko-helpo":
      "Your country is always public. You can add your state or city, or nothing.",
    "redakti.urbo-aux-regiono": "City or state",
    "redakti.urbo-ekzemplo": "Type at least 2 letters…",
    "redakti.regiono": "State or province",
    "redakti.urbo": "City",
    "redakti.nur-regiono": "state",
    "redakti.forigi-lokon": "Remove the city",
    "redakti.neniu-rezulto": "Nothing found. Try another name or choose your state.",
    "redakti.lingvoj": "Other languages you speak",
    "redakti.interesoj": "Interests",
    "redakti.kontaktiloj": "Contacts",
    "redakti.kontaktiloj-helpo":
      "Where other samideanoj can find you. You choose who sees each one.",
    "redakti.tipo": "Type",
    "redakti.valoro": "Username or link",
    "redakti.aldoni-kontaktilon": "Add contact",
    "redakti.forigi": "Remove",
    "redakti.kiu-vidas": "Who can see it?",
    "redakti.eraro.kromnomo": "Enter a nickname of 1 to 60 characters.",
    "redakti.eraro.priskribo": "The description can be at most 500 characters.",
    "redakti.eraro.lando": "Choose your country.",
    "redakti.eraro.loko": "Choose a city or a state from the list.",
    "redakti.eraro.ligilo": "This value doesn't look valid for this type.",
    "redakti.eraro.ligiloj": "At most 20 contacts.",
    "redakti.eraro.gxenerala": "Something went wrong. Please check the form.",
    "videbleco.publika": "Everyone",
    "videbleco.ensalutintoj": "Signed-in only",
    "videbleco.kasxita": "Only me",
    "intereso.lingvoj": "Languages",
    "intereso.tradukado": "Translation",
    "intereso.instruado": "Teaching",
    "intereso.sporto": "Sport",
    "intereso.naturo": "Nature",
    "intereso.fotografado": "Photography",
    "intereso.arto": "Art",
    "intereso.scienco": "Science",
    "intereso.ludoj": "Games",
    "intereso.politiko": "Politics",
    "intereso.filozofio": "Philosophy",
    "intereso.teatro": "Theatre",
    "intereso.dancado": "Dance",
    "intereso.ekologio": "Ecology",
    "intereso.religio": "Religion",
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

/** Landoj kun iliaj nomoj en la lingvo de la interfaco, ordigitaj laŭ nomo. */
export function landaListo(kodoj: string[], lingvo: string | undefined) {
  const l = estasLingvo(lingvo) ? lingvo : CXEFA_LINGVO;
  return kodoj
    .map((kodo) => ({ kodo, nomo: nomoDe("region", kodo, l) }))
    .sort((a, b) => a.nomo.localeCompare(b.nomo, l === "eo" ? "eo" : l));
}

/** Lingvoj kiujn uzanto povas aldoni al sia profilo (krom Esperanto). */
export function lingvaListo(lingvo: string | undefined) {
  const l = estasLingvo(lingvo) ? lingvo : CXEFA_LINGVO;
  return Object.keys(LINGVONOMOJ)
    .map((kodo) => ({ kodo, nomo: nomoDe("language", kodo, l) }))
    .sort((a, b) => a.nomo.localeCompare(b.nomo, l));
}
