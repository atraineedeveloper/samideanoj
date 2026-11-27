import type { APIRoute } from "astro";
import {
  agordoj,
  erarRedirekto,
  finiEnsaluton,
  kontroliOauthRevenon,
  revokoUrl,
} from "../../../lib/ensaluto";
import { githubIdentigilo } from "../../../lib/provizantoj";

export const GET: APIRoute = async (konteksto) => {
  const github = agordoj().github;
  if (!github) return new Response(null, { status: 404 });
  const stato = kontroliOauthRevenon(konteksto, "github");
  if (!stato) return erarRedirekto(konteksto, "eo");

  const eksteraId = await githubIdentigilo({
    klientoId: github.klientoId,
    klientoSekreto: github.klientoSekreto,
    revokoUrl: revokoUrl(konteksto, "github"),
    kodo: stato.kodo,
    pkceKontrolilo: stato.kontrolilo,
  }).catch(() => null);
  if (!eksteraId) return erarRedirekto(konteksto, stato.lingvo);

  return finiEnsaluton(konteksto, {
    provizanto: "github",
    eksteraId,
    lingvo: stato.lingvo,
    reveno: stato.reveno,
  });
};
