# 0007. Propra mapo, sen eksteraj kaheloj

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## Kunteksto

La PRD postulas publikan mapon kun la nombro de samideanoj por ĉiu urbo (M6), sen individuaj punktoj. La prototipo uzis kahelojn de OpenStreetMap, kiel plej multaj retaj mapoj.

Tamen la PRD ankaŭ postulas:

- **neniujn spurilojn de triaj partioj**: ĉiu peto al ekstera kahelservilo sendas al ĝi la IP-adreson de la vizitanto kaj la paĝon, kiun ri rigardas;
- **2 jarojn sen prizorgo kaj 0 USD**: la publikaj kahelserviloj havas uzregulojn, kiuj povas ŝanĝiĝi, kaj ne garantias servon al ekstera retejo;
- **paĝon sub 1 MB kaj rapidan ŝargon en 4G**: interaktiva mapo kun Leaflet aŭ MapLibre aldonas centojn da KB da JavaScript.

## Decido

Ni desegnas la mapon mem, el la datumoj de [Natural Earth](https://www.naturalearthdata.com/) (publika havaĵo), per la pako `world-atlas`:

- `scripts/generi-mapon.mjs` generas **statikajn SVG-ojn** dum la konstruo: unu por la mondo (1:110m) kaj unu por ĉiu lando (1:50m, aŭ 1:110m por tre grandaj landoj), tondita al la vido. Ili ne estas en git.
- Ĉiuj uzas la saman projekcion (Equal Earth). La servilo projekcias la urbojn per `src/lib/projekcio.ts`, kaj la skripto kontrolas, ke ĝi kongruas kun d3-geo.
- La servilo metas la **vezikojn** kiel HTML-ligilojn super la bildo, kun pozicio en procentoj. Ili estas realaj ligiloj al la serĉado: atingeblaj per klavaro kaj ekranlegilo, kaj ili funkcias sen JavaScript.
- La nombroj venas de `src/lib/mapo.ts`, kun la privatecaj reguloj: urbo aperas nur kun almenaŭ 3 samideanoj kun publika urbo. La rezulto restas 10 minutojn en la tabelo `kasxmemoro` (unu vico, unu skribo).

## Konsekvencoj

- **Pozitivaj:** neniu tria partio vidas la vizitantojn; neniu ekstera servo povas rompi la mapon; la bazaj mapoj estas statikaj dosieroj, senpagaj kaj senlimaj ĉe Cloudflare, kaj la retumilo konservas ilin; neniu JavaScript por la mapo.
- **Negativaj:** ne eblas libere zomi aŭ movi la mapon: oni vidas la mondon aŭ unu landon. Por adresaro tio sufiĉas, ĉar la celo estas trovi samideanojn en lando aŭ urbo, ne navigi.
- **Grandeco:** la mondo pezas 118 KB (42 KB kunpremita); la plej peza lando (Kanado) 198 KB. Ĉiuj kune ĉ. 4 MB en la statikaj dosieroj.
- **Se ni iam volos liberan zomon:** ni povus aldoni MapLibre kun memgastigitaj vektoraj kaheloj (PMTiles en statikaj dosieroj), denove sen tria partio.
