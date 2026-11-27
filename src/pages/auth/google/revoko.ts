import type { APIRoute } from "astro";
import {
  agordoj,
  erarRedirekto,
  finiEnsaluton,
  kontroliOauthRevenon,
  revokoUrl,
} from "../../../lib/ensaluto";
import { googleIdentigilo } from "../../../lib/provizantoj";
import { nun } from "../../../lib/seancoj";

export const GET: APIRoute = async (konteksto) => {
  const google = agordoj().google;
  if (!google) return new Response(null, { status: 404 });
  const stato = kontroliOauthRevenon(konteksto, "google");
  if (!stato) return erarRedirekto(konteksto, "eo");

  const eksteraId = await googleIdentigilo({
    klientoId: google.klientoId,
    klientoSekreto: google.klientoSekreto,
    revokoUrl: revokoUrl(konteksto, "google"),
    kodo: stato.kodo,
    pkceKontrolilo: stato.kontrolilo,
    nunSekundoj: nun(),
  }).catch(() => null);
  if (!eksteraId) return erarRedirekto(konteksto, stato.lingvo);

  return finiEnsaluton(konteksto, {
    provizanto: "google",
    eksteraId,
    lingvo: stato.lingvo,
    reveno: stato.reveno,
  });
};
