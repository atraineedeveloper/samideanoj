import { ALIGXA_DAUXRO, SEANCA_DAUXRO } from "./seancoj";

/** Ĉiuj niaj kuketoj: nur HTTPS, nealireblaj de JavaScript, kun la prefikso __Host-. */
const bazo = { path: "/", httpOnly: true, secure: true, sameSite: "lax" as const };

export const seancaKuketo = () => ({ ...bazo, maxAge: SEANCA_DAUXRO });
export const aligxaKuketo = () => ({ ...bazo, maxAge: ALIGXA_DAUXRO });
export const oauthKuketo = () => ({ ...bazo, maxAge: 10 * 60 });

export const OAUTH_KUKETO = "__Host-oauth";
