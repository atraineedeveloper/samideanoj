/**
 * Normigo por serĉado: minuskloj, sen diakritaj signoj, sen interpunkcio.
 * "São Paulo" → "sao paulo"; "Ĉiĉero" → "cicero"; "Zürich" → "zurich".
 * La sama funkcio estas uzata de la importilo de urboj (scripts/importi-lokojn.mjs).
 */
export function normigiSercxon(teksto: string): string {
  return teksto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}
