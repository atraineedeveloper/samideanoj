import type { APIRoute } from "astro";
import { agordoj, komenciOauth, revokoUrl } from "../../lib/ensaluto";
import { googleRajtigaUrl } from "../../lib/provizantoj";

export const GET: APIRoute = async (konteksto) => {
  const google = agordoj().google;
  if (!google) return new Response(null, { status: 404 });
  const { stato, pkceDefio } = await komenciOauth(konteksto, "google");
  return konteksto.redirect(
    googleRajtigaUrl({
      klientoId: google.klientoId,
      revokoUrl: revokoUrl(konteksto, "google"),
      stato,
      pkceDefio,
    }),
    303,
  );
};
