import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { sercxiLokojn } from "../../lib/lokoj";

/** GET /api/lokoj?lando=MX&q=villa → urboj kaj regionoj de Meksiko komenciĝantaj per "villa". */
export const GET: APIRoute = async ({ url }) => {
  const lokoj = await sercxiLokojn(
    env.DB,
    (url.searchParams.get("lando") ?? "").toUpperCase(),
    url.searchParams.get("q") ?? "",
  );
  return Response.json(lokoj, { headers: { "Cache-Control": "public, max-age=86400" } });
};
