import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";

/**
 * Sankontrolo: konfirmas, ke la Worker funkcias kaj atingas la datumbazon.
 * Uzata de la deploja laborfluo kaj de ekstera monitorado.
 */
export const GET: APIRoute = async () => {
  try {
    await env.DB.prepare("SELECT 1").first();
    return Response.json({ stato: "bone", datumbazo: "bone" });
  } catch {
    return Response.json({ stato: "eraro", datumbazo: "ne atingebla" }, { status: 503 });
  }
};
