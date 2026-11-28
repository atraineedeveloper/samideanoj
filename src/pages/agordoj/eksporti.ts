import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { eksportiDatumojn } from "../../lib/konto";

/** GET /agordoj/eksporti: elŝuto de ĉiuj propraj datumoj (JSON). Nur por la ensalutinto mem. */
export const GET: APIRoute = async ({ locals }) => {
  const uzanto = locals.uzanto;
  if (!uzanto) return new Response("Ensalutu unue.", { status: 401 });
  const datumoj = await eksportiDatumojn(env.DB, uzanto.id);
  if (!datumoj) return new Response(null, { status: 404 });
  const dato = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(datumoj, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="samideanoj-${uzanto.slug}-${dato}.json"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
