/** Komunaj formatiloj por montri profilojn. */
import { nomoDe } from "../i18n/tradukoj";
import type { VideblaProfilo } from "./videbleco";

/** "Toluca, México, Meksiko": nur la videblaj partoj, en la lingvo de la interfaco. */
export function lokaTeksto(
  p: Pick<VideblaProfilo, "urbo" | "regiono" | "landoKodo">,
  lingvo: string,
): string {
  return [
    p.urbo ? (lingvo === "eo" ? (p.urbo.nomoEo ?? p.urbo.nomo) : p.urbo.nomo) : null,
    p.regiono?.nomo ?? null,
    p.landoKodo ? nomoDe("region", p.landoKodo, lingvo) : null,
  ]
    .filter(Boolean)
    .join(", ");
}
