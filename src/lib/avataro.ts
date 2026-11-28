/** Koloroj de la avataroj (sen foto), kiel en la prototipo: ĉiam la sama por la sama persono. */
const KOLOROJ = [
  { fono: "#D7EBDD", teksto: "#17663F" },
  { fono: "#E3E6F4", teksto: "#2F3F8F" },
  { fono: "#F6E3D8", teksto: "#8A3B12" },
  { fono: "#E5EFEF", teksto: "#1D5E60" },
  { fono: "#F1EEE4", teksto: "#6B5A1E" },
  { fono: "#EDE3F1", teksto: "#6D2F73" },
] as const;

export function avataraKoloro(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return KOLOROJ[h % KOLOROJ.length];
}

export const avataraStilo = (slug: string) => {
  const k = avataraKoloro(slug);
  return `background:${k.fono};color:${k.teksto}`;
};
