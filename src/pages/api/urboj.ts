import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { sercxiUrbojn } from "../../lib/urboj";

/** GET /api/urboj?q=tolu → la plej grandaj urboj kies nomo komenciĝas per "tolu". */
export const GET: APIRoute = async ({ url }) => {
  const urboj = await sercxiUrbojn(env.DB, url.searchParams.get("q") ?? "");
  return Response.json(urboj, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
};
