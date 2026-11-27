# 0003. Kadro: Astro kun React-insuloj sur Cloudflare Workers

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## Kunteksto

Laŭ [ADR 0002](0002-gastigado-kaj-datumbazo.md), la aplikaĵo funkcias sur Cloudflare Workers kun D1. La kadro devas:

- **Bildigi en la servilo** (SSR): publikaj profiloj kaj la mapo devas esti troveblaj de serĉiloj kaj rapidaj en malrapidaj konektoj.
- **Sendi malmulte da JavaScript**: la paĝo devas pezi malpli ol 1 MB (vidu la [PRD](../fazo-1/prd.md)).
- **Resti en la limo de 10 ms da CPU-tempo** por ĉiu peto.
- **Subteni plurlingvecon** de la komenco.
- **Daŭri jarojn sen prizorgo**: malmultaj dependaĵoj, stabila projekto.

## Konsideritaj opcioj

### 1. Astro

- ✅ Bildigo en la servilo kun nula JavaScript defaŭlte; interagaj "insuloj" nur kie necesas (ekz. la mapo, la videblecaj elektiloj).
- ✅ Enkonstruita plurlingva vojigo (`/eo/`, `/es/`, `/en/`).
- ✅ Cloudflare aĉetis la teamon de Astro en januaro 2026 kaj promesis teni ĝin malferma ([gazetara komuniko](https://www.cloudflare.com/press/press-releases/2026/cloudflare-acquires-astro-to-accelerate-the-future-of-high-performance-web-development/)). La kadro kaj la gastiganto estas do de la sama firmao: bona subteno longtempe.
- ❌ Pli da dependaĵoj ol Hono.

### 2. Hono kun JSX

- ✅ Tre malgranda kaj rapida, farita por Workers; [oficiala ekzemplo kun D1](https://developers.cloudflare.com/d1/examples/d1-and-hono/).
- ✅ Malmultaj dependaĵoj: facile prizorgebla.
- ❌ Ni devus mem konstrui plurlingvecon, formularojn kaj interagajn partojn.

### 3. SvelteKit aŭ Next.js

- ✅ Potencaj kaj popularaj.
- ❌ Pli pezaj; pli da JavaScript en la kliento. Next.js sur Workers postulas aldonan adaptilon.

## Decido

**Astro** kun la Cloudflare-adaptilo kaj TypeScript por ĉiuj paĝoj, kaj **React** nur por la interagaj insuloj (videblecaj elektiloj, antaŭvido de la profilo, filtriloj).

Kial React por la insuloj: ĝi estas la plej konata biblioteko por interfacoj, do estontaj kontribuantoj povos facile daŭrigi la laboron. Ĝia JavaScript ŝarĝiĝas nur en la paĝoj kiuj vere bezonas interagon; la publikaj paĝoj (hejmo, serĉado, profilo) restas sen JavaScript aŭ kun tre malmulte.

Por la mapo: unue **statika SVG-mapo de la mondo** kun la vezikoj de nombroj, sen eksteraj kaheloj. Ĝi ne dependas de iu ekstera servo, do ĝi ne povas rompiĝi. Interaga mapo (ekz. MapLibre) estas posta plibonigo, nur se ni trovos senpagan kaj daŭran fonton de kaheloj.

## Sekvoj

- **Pozitivaj:** rapidaj paĝoj, bona trovebleco, plurlingveco sen kroma laboro, kadro subtenata de la gastiganto.
- **Negativaj:** pli da dependaĵoj ol Hono; necesas konservi ĝisdatigojn de Astro.
- **Riskoj:** se Cloudflare ŝanĝus la direkton de Astro, la kodo restas normala TypeScript kaj HTML; migri al Hono estus ebla.
