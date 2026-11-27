# Procezo de la projekto

Ĉi tiu dokumento priskribas, kiel ni konstruas Adresaron, de la ideo ĝis la funkciigo. La diferenco inter profesia projekto kaj malbona projekto malofte estas en la kodo: ĝi estas en tio, kion oni decidas antaŭ ol skribi ĝin, kaj en tio, kion oni faras post la lanĉo.

## Fazo 0: Malkovro — ĉu indas konstrui ĝin?

- Intervjuoj kun 12 esperantistoj de diversaj profiloj.
- Analizo de la ekzistantaj alternativoj.
- Mezurebla celo de sukceso.

**Rezulto:** unupaĝa dokumento kun la problemo, la uzantoj, la valorpropono kaj la metrikoj, bazita sur pruvoj. Detaloj en [`fazo-0/`](fazo-0/).

## Fazo 1: Postuloj

- Produkta postulo-dokumento (PRD) kun uzanto-rakontoj.
- Nefunkciaj postuloj: privateco, internaciigo, alirebleco, rapideco en poŝtelefonoj kaj malrapidaj konektoj, moderigado.
- Juraj aspektoj: privateca deklaro (meksika leĝo LFPDPPP kaj eŭropa GDPR), uzkondiĉoj, kondutkodo.
- Prioritata laborlisto laŭ MoSCoW (*Must / Should / Could / Won't*).

## Fazo 2: Dizajno

**Produkto kaj uzosperto**
- Uzantaj fluoj, skizoj kaj navigebla prototipo.
- Testo de la prototipo kun 5 veraj uzantoj antaŭ ol programi.

**Arkitekturo**
- C4-diagramoj (kunteksto, ujoj, komponantoj).
- ADR-oj por ĉiu grava decido (vidu [`adr/`](adr/)).
- Datummodelo kaj API-kontrakto (OpenAPI) antaŭ la realigo.
- Minacmodelado (STRIDE): ĉikanado, amasa elkopiado de profiloj, spamo, falsaj kontoj.

## Fazo 3: Teknikaj fundamentoj

- Deponejo kun klaraj konvencioj, mallongaj branĉoj kaj devigaj kunfando-petoj kun revizio.
- Daŭra integrado (CI): lintilo, tipkontrolo kaj testoj por ĉiu peto.
- Daŭra liverado (CD) kun tri medioj: disvolvado, provmedio kaj produktado.
- Infrastrukturo kiel kodo, sekretoj ekster la deponejo, versiigitaj datumbazaj migradoj.
- Observeblo ekde la unua tago: strukturitaj protokoloj, erarspurado, bazaj metrikoj.
- Skribita *Difino de Finita* (*Definition of Done*).

## Fazo 4: Iteracia konstruado

- Cikloj de 1–2 semajnoj, ĉiu kun io funkcianta kaj montrebla.
- Testpiramido: multaj unuotestoj, kelkaj integrigaj testoj, malmultaj fin-al-finaj testoj por la kritikaj fluoj (aliĝo, serĉado, kontakto).
- Funkcio-flagoj por laŭgrada aktivigo.
- Demonstro kaj retrospektivo fine de ĉiu ciklo.

## Fazo 5: Kvalito kaj sekureco antaŭ la lanĉo

- Revizio laŭ OWASP Top 10, rapidlimigo kaj protekto kontraŭ elkopiado.
- Alirebleco laŭ WCAG 2.2 AA.
- Lingva revizio de ĉiuj tekstoj.
- Bazaj ŝarĝtestoj.
- Sekurkopioj kun provita restarigo.

## Fazo 6: Lanĉo

- Fermita beta-versio kun malgranda grupo.
- Korektoj kaj poste laŭgrada publika lanĉo.
- Agadmanlibro (*runbook*) por incidentoj kaj plano por malfari.
- Statuspaĝo kaj subtena kanalo.

## Fazo 7: Funkciigo kaj daŭra plibonigo

- Servnivelaj celoj (SLO) pri disponebleco kaj respondtempo.
- Statistiko respektanta privatecon.
- Aktiva moderigado kaj respondo al raportoj.
- Reago-ciklo: la petoj de uzantoj nutras la laborliston.

## Kio distingas profesian projekton

1. **La decidoj estas skribitaj** (PRD, ADR), ne nur en ies kapo.
2. **Nenio atingas produktadon sen CI kaj revizio.**
3. **Sekureco kaj privateco estas dizajnitaj de la komenco**, ne flikitaj poste.
4. **Ni mezuras**, ĉu la produkto atingas sian celon.
5. **Ni kontrolas kun veraj uzantoj** en ĉiu fazo, ne nur fine.
