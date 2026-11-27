import { env } from "cloudflare:workers";
import { legiProfilonLauxSlug } from "./profiloj";
import type { Rigardanto } from "./tipoj";
import { filtriProfilon, type VideblaProfilo } from "./videbleco";

/** Ŝargas profilon por montri, jam filtritan laŭ la rigardanto. */
export async function sxargiVideblanProfilon(
  slug: string | undefined,
  rigardanto: Rigardanto,
): Promise<VideblaProfilo | null> {
  if (!slug) return null;
  const plena = await legiProfilonLauxSlug(env.DB, slug);
  return plena ? filtriProfilon(plena, rigardanto) : null;
}
