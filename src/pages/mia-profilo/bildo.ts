import { env } from "cloudflare:workers";
import type { APIRoute } from "astro";
import { kontroliBildon, MAKS_BAJTOJ } from "../../lib/bildoj";
import { VIDEBLECOJ, type Videbleco } from "../../lib/tipoj";

/**
 * POST /mia-profilo/bildo: alŝuti, ŝanĝi la videblecon de aŭ forigi la propran profilbildon.
 * La mezvaro jam kontrolis la Origin-kapon (CSRF). Respondas per JSON.
 *
 * Kampoj: ago = "alsxuti" (kun bildo kaj videbleco) | "videbleco" (kun videbleco) | "forigi".
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const respondo = (status: number, korpo: Record<string, unknown>) =>
    Response.json(korpo, { status, headers: { "Cache-Control": "private, no-store" } });

  const uzanto = locals.uzanto;
  if (!uzanto) return respondo(401, { eraro: "ne-ensalutinta" });

  // Malakcepti grandegajn petojn antaŭ ol legi ilin.
  const longo = Number(request.headers.get("Content-Length") ?? "0");
  if (longo > MAKS_BAJTOJ + 16_384) return respondo(413, { eraro: "tro-granda" });

  const formularo = await request.formData().catch(() => null);
  if (!formularo) return respondo(400, { eraro: "malgxusta-peto" });

  const ago = formularo.get("ago");
  const videblecoEnigo = formularo.get("videbleco")?.toString() ?? "ensalutintoj";
  if (!VIDEBLECOJ.includes(videblecoEnigo as Videbleco)) {
    return respondo(400, { eraro: "malgxusta-videbleco" });
  }
  const videbleco = videblecoEnigo as Videbleco;
  const nun = Math.floor(Date.now() / 1000);

  if (ago === "forigi") {
    await env.DB.prepare("DELETE FROM profilbildoj WHERE uzanto_id = ?1").bind(uzanto.id).run();
    return respondo(200, { bone: true });
  }

  if (ago === "videbleco") {
    await env.DB.prepare("UPDATE uzantoj SET vid_bildo = ?2 WHERE id = ?1")
      .bind(uzanto.id, videbleco)
      .run();
    return respondo(200, { bone: true });
  }

  if (ago !== "alsxuti") return respondo(400, { eraro: "malgxusta-peto" });

  const dosiero = formularo.get("bildo");
  if (!dosiero || typeof dosiero === "string") return respondo(400, { eraro: "malplena" });
  if (dosiero.size > MAKS_BAJTOJ) return respondo(413, { eraro: "tro-granda" });

  const bajtoj = new Uint8Array(await dosiero.arrayBuffer());
  const kontrolo = kontroliBildon(bajtoj);
  if (!kontrolo.bone) return respondo(422, { eraro: kontrolo.kialo });

  // Se moderiganto kaŝis la antaŭan bildon, la nova restas kaŝita ĝis moderiganto revidos ĝin:
  // alie oni povus eviti la moderigon per nova alŝuto.
  await env.DB.batch([
    env.DB.prepare(
      `INSERT INTO profilbildoj (uzanto_id, bildo, tipo, grandeco, kasxita_de_moderiganto, gxisdatigita)
       VALUES (?1, ?2, ?3, ?4, 0, ?5)
       ON CONFLICT (uzanto_id) DO UPDATE SET bildo = excluded.bildo, tipo = excluded.tipo,
         grandeco = excluded.grandeco, gxisdatigita = excluded.gxisdatigita`,
    ).bind(uzanto.id, bajtoj, kontrolo.tipo, bajtoj.length, nun),
    env.DB.prepare("UPDATE uzantoj SET vid_bildo = ?2 WHERE id = ?1").bind(uzanto.id, videbleco),
  ]);
  return respondo(200, { bone: true, versio: nun });
};
