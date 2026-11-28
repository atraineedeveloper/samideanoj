/** La logiko de la paĝo "Moderigado", komuna por ĉiuj lingvoj. */

import { getRelativeLocaleUrl } from "astro:i18n";
import { env } from "cloudflare:workers";
import type { AstroGlobal } from "astro";
import {
  AGOJ,
  type Ago,
  estasModeriganto,
  kasxitajProfiloj,
  lastajAgoj,
  novajRaportoj,
  plenumiAgon,
} from "./moderigado";

export interface ModerigaStato {
  vico: Awaited<ReturnType<typeof novajRaportoj>>;
  kasxitaj: Awaited<ReturnType<typeof kasxitajProfiloj>>;
  agoj: Awaited<ReturnType<typeof lastajAgoj>>;
  rezulto: "farita" | "ne-farita" | null;
}

/** null: la paĝo ne ekzistas por ĉi tiu rigardanto (ni ne malkaŝas, ke ĝi ekzistas). */
export async function traktiModeradon(
  Astro: AstroGlobal,
): Promise<Response | ModerigaStato | null> {
  const lingvo = Astro.currentLocale ?? "eo";
  const uzanto = Astro.locals.uzanto;
  if (!uzanto || !estasModeriganto(uzanto.rolo)) return null;
  const pagxo = getRelativeLocaleUrl(lingvo, "moderigado");

  if (Astro.request.method === "POST") {
    const f = await Astro.request.formData();
    const ago = f.get("ago");
    const profiloId = f.get("profilo");
    const bone =
      typeof ago === "string" &&
      AGOJ.includes(ago as Ago) &&
      typeof profiloId === "string" &&
      (await plenumiAgon(env.DB, { moderigantoId: uzanto.id, profiloId, ago: ago as Ago }));
    return Astro.redirect(`${pagxo}?rezulto=${bone ? "farita" : "ne-farita"}`, 303);
  }

  const [vico, kasxitaj, agoj] = await Promise.all([
    novajRaportoj(env.DB),
    kasxitajProfiloj(env.DB),
    lastajAgoj(env.DB),
  ]);
  const r = Astro.url.searchParams.get("rezulto");
  return { vico, kasxitaj, agoj, rezulto: r === "farita" || r === "ne-farita" ? r : null };
}
