import type { APIRoute } from "astro";
import { agordoj, erarRedirekto, finiEnsaluton, lingvoEl } from "../../../lib/ensaluto";
import { sekuraReveno, telegramaIdentigilo } from "../../../lib/provizantoj";
import { nun } from "../../../lib/seancoj";

export const GET: APIRoute = async (konteksto) => {
  const telegramo = agordoj().telegramo;
  if (!telegramo) return new Response(null, { status: 404 });
  const parametroj = konteksto.url.searchParams;
  const lingvo = lingvoEl(parametroj.get("lingvo"));

  const eksteraId = await telegramaIdentigilo(parametroj, telegramo.robotoJxetono, nun());
  if (!eksteraId) return erarRedirekto(konteksto, lingvo);

  return finiEnsaluton(konteksto, {
    provizanto: "telegramo",
    eksteraId,
    lingvo,
    reveno: sekuraReveno(parametroj.get("reveno")),
  });
};
