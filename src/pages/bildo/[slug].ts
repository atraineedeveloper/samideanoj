import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { legiProfilonLauxSlug } from "../../lib/profiloj";
import { filtriProfilon } from "../../lib/videbleco";

/**
 * GET /bildo/<slug>?v=<versio>: la profilbildo, se la rigardanto rajtas vidi ĝin.
 * La decido venas de filtriProfilon, la sama filtrilo kiel por la profilo.
 */
export const GET: APIRoute = async ({ params, locals }) => {
  const nenio = () =>
    new Response(null, { status: 404, headers: { "Cache-Control": "private, no-store" } });

  const profilo = await legiProfilonLauxSlug(env.DB, params.slug ?? "");
  if (!profilo) return nenio();
  if (!filtriProfilon(profilo, locals.rigardanto)?.bildo) return nenio();

  const vico = await env.DB.prepare("SELECT bildo, tipo FROM profilbildoj WHERE uzanto_id = ?1")
    .bind(profilo.id)
    .first<{ bildo: ArrayBuffer | number[]; tipo: string }>();
  if (!vico) return nenio();

  const bajtoj = vico.bildo instanceof ArrayBuffer ? vico.bildo : new Uint8Array(vico.bildo);
  return new Response(bajtoj, {
    headers: {
      "Content-Type": vico.tipo,
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Content-Disposition": "inline",
      // Privata: la videbleco dependas de la rigardanto. La adreso ŝanĝiĝas kun ĉiu nova bildo.
      "Cache-Control": "private, max-age=86400",
    },
  });
};
