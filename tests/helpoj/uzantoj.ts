import type { DatabaseSync } from "node:sqlite";

/** Kreas uzanton kun ĉiuj eblaj ligitaj datumoj, por testoj. */
export function plenaUzanto(sqlite: DatabaseSync, id: string, rolo = "uzanto") {
  sqlite
    .prepare(
      `INSERT INTO uzantoj (id, slug, kromnomo, priskribo, nivelo, lando_kodo, rolo, kreita, gxisdatigita, lasta_ensaluto)
       VALUES (?, ?, ?, 'Saluton!', 'flua', 'MX', ?, 1790000000, 1790000000, 1790000000)`,
    )
    .run(id, id.toLowerCase(), id, rolo);
  sqlite
    .prepare("INSERT INTO identecoj (uzanto_id, provizanto, ekstera_id) VALUES (?, 'github', ?)")
    .run(id, `gh-${id}`);
  sqlite
    .prepare("INSERT INTO seancoj (id_hash, uzanto_id, eksvalidigxo) VALUES (?, ?, 9999999999)")
    .run(`seanca-hasxo-${id}`, id);
  sqlite
    .prepare(
      "INSERT INTO ligiloj (uzanto_id, tipo, valoro, videbleco, ordo) VALUES (?, 'retejo', 'https://example.org', 'publika', 1)",
    )
    .run(id);
  sqlite.prepare("INSERT INTO uzanto_lingvoj (uzanto_id, lingvo_kodo) VALUES (?, 'es')").run(id);
  sqlite.prepare("INSERT INTO uzanto_interesoj (uzanto_id, interes_id) VALUES (?, 1)").run(id);
  sqlite
    .prepare(
      "INSERT INTO profilbildoj (uzanto_id, bildo, tipo, grandeco, gxisdatigita) VALUES (?, ?, 'image/webp', 3, 1790000000)",
    )
    .run(id, new Uint8Array([1, 2, 3]));
}
