import type { APIRoute } from "astro";
import { agordoj, komenciOauth, revokoUrl } from "../../lib/ensaluto";
import { githubRajtigaUrl } from "../../lib/provizantoj";

export const GET: APIRoute = async (konteksto) => {
  const github = agordoj().github;
  if (!github) return new Response(null, { status: 404 });
  const { stato, pkceDefio } = await komenciOauth(konteksto, "github");
  return konteksto.redirect(
    githubRajtigaUrl({
      klientoId: github.klientoId,
      revokoUrl: revokoUrl(konteksto, "github"),
      stato,
      pkceDefio,
    }),
    303,
  );
};
