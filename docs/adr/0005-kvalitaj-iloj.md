# 0005. Kvalitaj iloj: Biome, Vitest kaj astro check

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## Kunteksto

La projekto bezonas lintilon, formatilon, tipkontrolon kaj testojn, kontrolatajn en ĉiu kunfando-peto. Ĉar la projekto devas esti prizorgebla dum jaroj per malmultaj homoj, ni preferas malmultajn ilojn kun malmulta agordado.

## Konsideritaj opcioj

1. **ESLint + Prettier:** la plej disvastigitaj, sed du iloj kun multaj kromaĵoj kaj agordoj.
2. **Biome:** unu ilo por lintado kaj formatado, rapida, kun preskaŭ nula agordo.

Por testoj: **Vitest**, kiu uzas la saman konstruan sistemon kiel Astro (Vite). Por tipoj: **astro check**, la oficiala ilo, kiu kontrolas ankaŭ `.astro`-dosierojn.

## Decido

- **Biome** por lintado kaj formatado de TypeScript, JavaScript, JSON kaj CSS.
- **Vitest** por unuotestoj.
- **astro check** por tipoj.

Biome kontrolas nur la kodan parton de `.astro`-dosieroj kaj ne vidas, kiujn variablojn la ŝablono uzas. Tial la reguloj `noUnusedImports` kaj `noUnusedVariables` estas malŝaltitaj nur por `.astro`; `astro check` kovras tiujn dosierojn.

Biome ne formatas Markdown en ĉi tiu projekto, por ne ŝanĝi la dokumentadon sen kialo.

## Sekvoj

- **Pozitivaj:** malmultaj dependaĵoj; rapidaj kontroloj; simpla agordo.
- **Negativaj:** malpli da kromaĵoj ol ESLint.
- **Riskoj:** se Biome ĉesus esti prizorgata, ESLint kaj Prettier estas facila anstataŭaĵo.
