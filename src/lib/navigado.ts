/** Helpiloj por la navigado: la vojo sen lingva prefikso, por scii kiu ligilo estas aktiva. */

export function vojoSenLingvo(pathname: string): string {
  const v = pathname.replace(/^\/(es|en)(?=\/|$)/, "").replace(/\/+$/, "");
  return v === "" ? "/" : v;
}

export type Sekcio = "mapo" | "sercxi" | "profilo" | "alia";

export function aktivaSekcio(pathname: string, propraSlug: string | null): Sekcio {
  const v = vojoSenLingvo(pathname);
  if (v === "/") return "mapo";
  if (v === "/sercxi") return "sercxi";
  if (
    v === "/mia-profilo" ||
    v === "/agordoj" ||
    v === "/ensaluti" ||
    v === "/aligxi" ||
    (propraSlug !== null && v === `/s/${propraSlug}`)
  ) {
    return "profilo";
  }
  return "alia";
}
