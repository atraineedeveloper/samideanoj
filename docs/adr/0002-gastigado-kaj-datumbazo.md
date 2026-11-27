# 0002. Gastigado kaj datumbazo: Cloudflare Workers kaj D1

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## Kunteksto

La [PRD](../fazo-1/prd.md) postulas:

- Koston de **0 USD monate, por ĉiam**, sen pagata domajno.
- Ke la retejo funkciu **almenaŭ 2 jarojn sen ia prizorgo**.
- Ke ĉiuj datumoj estu facile eksporteblaj.

La antaŭaj adresaroj de esperantistoj (La Esperantista Mondmapo, adresaro.org) malaperis pro manko de daŭripovo. La elekto de gastigado estas do la plej grava arkitektura decido.

## Konsideritaj opcioj

### 1. Supabase (senpaga plano)

- ✅ Ensaluto per Google kaj GitHub jam inkluzivita; PostgreSQL; tre komforta disvolvado.
- ❌ Senpagaj projektoj estas **paŭzigataj post 7 tagoj de malalta aktiveco** ([dokumentado](https://supabase.com/docs/guides/platform/free-project-pausing)). Iu devas mane restarigi ilin.
- ❌ La kutima solvo (perioda "ping" per GitHub Actions) ne estas fidinda: GitHub malŝaltas planitajn laborfluojn en deponejoj sen aktiveco.
- ❌ Ensaluto per Telegramo ne estas inkluzivita.

### 2. Cloudflare Workers + D1 (senpaga plano)

- ✅ Neniu dokumentita paŭzigo pro neaktiveco.
- ✅ Malavaraj senpagaj limoj ([D1](https://developers.cloudflare.com/d1/platform/pricing/), [Workers](https://developers.cloudflare.com/workers/platform/pricing/)): 100 000 petoj tage; 5 milionoj da legitaj vicoj kaj 100 000 skribitaj vicoj tage; 5 GB da konservado por la tuta konto, sed **maksimume 500 MB por ĉiu datumbazo** ([limoj](https://developers.cloudflare.com/d1/platform/limits/); korektita la 2026-11-27). Statikaj dosieroj estas senpagaj kaj senlimaj.
- ✅ Senpaga subdomajno, do neniu domajno por renovigi.
- ✅ D1 estas SQLite: eksporti aŭ migri la datumojn estas simple.
- ✅ Se oni superas limon, la petoj malsukcesas ĝis la taga restarigo (00:00 UTC); neniu neatendita fakturo.
- ❌ Ensaluton ni devas realigi mem.
- ❌ Limo de 10 ms da CPU-tempo por ĉiu peto en la senpaga plano.

### 3. Propra servilo (VPS aŭ senpaga virtuala maŝino)

- ❌ Postulas daŭran prizorgon: ĝisdatigoj, sekureco, sekurkopioj. Kontraŭas la celon de 2 jaroj sen prizorgo.

## Decido

Ni uzas **Cloudflare Workers** por la aplikaĵo kaj **Cloudflare D1** por la datumbazo, en la senpaga plano.

La ensaluton ni realigas per normaj protokoloj: OAuth 2.0 por Google kaj GitHub, kaj HMAC-kontrolo por la ensalutilo de Telegramo. La elekto de kadro kaj bibliotekoj estos aparta ADR.

## Sekvoj

- **Pozitivaj:** nula kosto, neniu paŭzigo, senpaga domajno, simpla eksporto de datumoj.
- **Negativaj:** pli da laboro por la ensaluto; SQLite anstataŭ PostgreSQL (malpli da funkcioj, sed sufiĉaj por adresaro).
- **Riskoj:**
    - Cloudflare povas ŝanĝi siajn senpagajn kondiĉojn. Mildigo: la datumoj estas norma SQLite, kaj ni tenas dokumentitan planon por migri.
    - La limo de 10 ms da CPU-tempo povas malhelpi pezajn operaciojn. Mildigo: simplaj demandoj kun indeksoj; neniu peza kalkulado en la servilo.
    - La 100 000 skribitaj vicoj tage limigas amasajn importojn. Por normala uzo de adresaro ili sufiĉas.
