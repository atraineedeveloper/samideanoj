# 0001. Registri arkitekturajn decidojn

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## Kunteksto

Samideanoj estas malferma projekto, al kiu volontuloj povas aliĝi kaj foriri iam ajn. Sen skribita historio, la kialoj de gravaj decidoj perdiĝas, kaj novaj kontribuantoj ne povas kompreni aŭ pridiskuti ilin.

## Konsideritaj opcioj

1. Ne registri decidojn; diskuti ilin nur en temoj (*issues*).
2. Teni unu longan dokumenton pri arkitekturo.
3. Registri ĉiun decidon en aparta mallonga dosiero (ADR).

## Decido

Ni uzas ADR-ojn en `docs/adr/`, unu dosieron por ĉiu decido, laŭ la [ŝablono](0000-sablono.md). Ili estas mallongaj, facile reviziataj en kunfando-petoj, kaj montras kiel decidoj evoluis.

## Sekvoj

- **Pozitivaj:** la kialoj restas skribitaj; novaj kontribuantoj komprenas la sistemon pli rapide.
- **Negativaj:** iom da kroma laboro por ĉiu grava decido.
- **Riskoj:** se ni forgesas verki ilin, la registro iĝas malkompleta. La ŝablono de kunfando-petoj memorigas pri ĝi.
