# Produkta postulo-dokumento (PRD) — versio 1

- **Stato:** Akceptita
- **Dato:** 2026-11-27

## 1. Vizio

Samideanoj estas **altnivela adresaro** de esperantistoj: ĉiu kreas profilon, decidas kion montri, kaj iu ajn povas trovi samideanojn laŭ loko, nivelo kaj interesoj, kun ligiloj al iliaj sociaj retoj kaj kontaktiloj.

Ĝi **ne** estas socia reto. Ĝi ne havas fluon, afiŝojn nek babilejon: la konversacioj okazas en la iloj, kiujn la homoj jam uzas (Telegramo, Mastodon, ktp.). Tio tenas la projekton simpla, malmultekosta kaj daŭrigebla.

## 2. Kunteksto

- La Esperantista Mondmapo kaj adresaro.org pruvis, ke la bezono ekzistas, sed ambaŭ fermiĝis.
- Verdkomunumo, la antaŭulo de ĉi tiu projekto, fermiĝis ĉar ĝi iĝis tro komplika.
- Pasporta Servo celas gastigadon, ne ĉiutagan kontakton, kaj ne montras sociajn retojn.

Detaloj en [`../fazo-0/alternativoj.md`](../fazo-0/alternativoj.md).

## 3. Uzantoj

| Profilo | Ĉefa bezono |
| --- | --- |
| Komencanto | Trovi iun por ekzerci |
| Aktiva parolanto | Trovi samideanojn laŭ interesoj aŭ dum vojaĝo |
| Loka organizanto | Malkovri parolantojn en sia regiono |
| Vizitanto sen konto | Vidi, ĉu estas esperantistoj en sia urbo, antaŭ ol aliĝi |

## 4. Uzanto-rakontoj kaj prioritatoj (MoSCoW)

### Must — sen ĉi tio ne estas versio 1

| # | Rakonto |
| --- | --- |
| M1 | Kiel novulo, mi volas aliĝi **sen pasvorto, per konto de Telegramo, Google aŭ GitHub**, por ke aliĝo estu rapida, sekura kaj senpaga. |
| M2 | Kiel uzanto, mi volas krei profilon kun kromnomo, lando, urbo, nivelo, lingvoj, interesoj kaj mallonga priskribo. |
| M3 | Kiel uzanto, mi volas aldoni ligilojn al miaj kontaktiloj: **mesaĝiloj** (Telegramo, WhatsApp, Signal, Discord), **sociaj retoj** (Mastodon, Instagram, Fejsbuko, X, Bluesky, YouTube, TikTok), **Esperanto-retejoj** (lernu.net, Pasporta Servo, Amikumu), kaj **retejo kaj retpoŝto**. |
| M4 | Kiel uzanto, mi volas elekti la **videblecon de ĉiu kampo**: publika, nur por ensalutintoj, aŭ kaŝita. |
| M5 | Kiel vizitanto, mi volas serĉi kaj filtri laŭ lando, urbo, nivelo, lingvoj kaj interesoj. |
| M6 | Kiel vizitanto, eĉ sen konto, mi volas vidi **publikan mapon kun la nombro de samideanoj por ĉiu urbo**, sen individuaj punktoj. |
| M7 | Kiel uzanto, mi volas **eksporti** ĉiujn miajn datumojn kaj **forigi** mian konton por ĉiam. |
| M8 | Kiel uzanto, mi volas raporti misuzan profilon, kaj kiel moderiganto mi volas kaŝi ĝin. |
| M9 | Kiel uzanto, mi volas uzi la retejon en Esperanto. |

### Should — grava, sed povas atendi kelkajn semajnojn

| # | Rakonto |
| --- | --- |
| S1 | Kiel uzanto, mi volas konstantan adreson por mia profilo, por kunhavigi ĝin. |
| S2 | Kiel uzanto, mi volas la interfacon ankaŭ en la hispana kaj la angla. |
| S3 | Kiel vizitanto, mi volas vidi, kiam profilo estis laste ĝisdatigita, por scii ĉu ĝi estas aktuala. |
| S4 | Kiel sistemo, mi volas kaŝi profilojn sen aktiveco dum 12 monatoj, por ke la adresaro ne pleniĝu per forlasitaj profiloj. |

### Could — bonvena, se restas tempo

| # | Rakonto |
| --- | --- |
| C1 | Kiel novulo, mi volas aliĝi per magia ligilo en mia retpoŝto, se ni trovos fidindan senpagan servon por sendi retpoŝtojn. |
| C2 | Kiel organizanto, mi volas krei profilon por loka grupo, ne nur por persono. |
| C3 | Kiel uzanto, mi volas instali la retejon en mia poŝtelefono kiel aplikaĵon (PWA). |

### Won't — eksplicite ekster versio 1

- Mesaĝilo, fluo, afiŝoj, komentoj aŭ ŝatoj (la leciono de Verdkomunumo).
- Kontaktformularo: la kontakto okazas per la sociaj retoj, kiujn ĉiu elektas montri. Sendi retpoŝtojn senpage kaj por ĉiam ne estas garantiebla.
- Ensaluto per Fejsbuko: ĝi postulas revizion de la aplikaĵo kaj kontrolon de komerco.
- Preciza loko aŭ GPS.
- Denaskaj poŝtelefonaj aplikaĵoj.
- Reklamoj aŭ pagataj funkcioj.

## 5. Nefunkciaj postuloj

### Kosto kaj daŭripovo

- **Kosto: 0 USD monate, por ĉiam.** Neniu pagata domajno; neniu servo, kiu paŭzas aŭ forigas projektojn pro neaktiveco.
- La retejo devas funkcii **almenaŭ 2 jarojn sen ia prizorgo**.
- Almenaŭ 2 prizorgantoj kun aliro al ĉiuj kontoj kaj servoj.
- Dokumentita deplojo: iu ajn povu restarigi la retejon el la deponejo.
- Ĉiuj datumoj eksporteblaj en malferma formato.

### Privateco

- Ni kolektas nur la minimumon. Loko maksimume je urba nivelo.
- Neniu datumo estas montrata sen la konsento de ĝia posedanto.
- Konformeco kun la meksika leĝo LFPDPPP kaj la eŭropa GDPR: privateca deklaro, rajto vidi, korekti, eksporti kaj forigi.
- Minimuma aĝo: 16 jaroj.
- Neniuj spuriloj de triaj partioj.

### Sekureco

- Revizio laŭ OWASP Top 10.
- Rapidlimigo kaj protekto kontraŭ amasa elkopiado de profiloj.
- Ligiloj validigitaj laŭ formato; neniu ekzekutebla enhavo en profiloj.

### Alirebleco kaj rapideco

- WCAG 2.2 AA.
- Funkcias bone en poŝtelefono kaj en malrapida konekto: paĝo sub 1 MB, LCP sub 2,5 s en 4G.

### Lingvoj

- Esperanto kiel ĉefa lingvo; ĉiuj tekstoj en tradukdosieroj ekde la komenco.

## 6. Metrikoj de sukceso (6 monatojn post la lanĉo)

| Metriko | Celo |
| --- | --- |
| Kreitaj profiloj | 500 |
| Profiloj ĝisdatigitaj en la lastaj 6 monatoj | 60 % |
| Reprezentitaj landoj | 30 |
| Monata kosto | 0 USD |

## 7. Riskoj

| Risko | Mildigo |
| --- | --- |
| Malplena adresaro ĉe la lanĉo | Fermita beta kun 50 esperantistoj antaŭ la publika lanĉo |
| Elkopiado kaj ĉikanado | Videbleco por ĉiu kampo, rapidlimigo, raportoj |
| Senpaga servo ŝanĝas siajn kondiĉojn | Arkitekturo sendependa de unu provizanto; dokumentita plano por migri |
| La projekto iĝas tro komplika | La listo "Won't"; ĉiu nova funkcio postulas ADR |

## 8. Decidoj kaj malfermaj demandoj

- [x] Ensaluto: Telegramo, Google kaj GitHub (ĉiuj senpagaj). Magia ligilo per retpoŝto nur kiel "Could".
- [x] Kontaktformularo: ekster versio 1.
- [x] Gastigado kaj datumbazo: vidu [ADR 0002](../adr/0002-gastigado-kaj-datumbazo.md).
- [x] La mapo kun nombroj por ĉiu urbo estas publika.
- [x] Kontaktiloj en versio 1: mesaĝiloj, sociaj retoj, Esperanto-retejoj, retejo kaj retpoŝto (vidu M3).
- [x] Moderigado: komence la kreinto de la projekto estas la sola moderiganto; li nomumas aliajn fidindajn moderigantojn laŭ la kresko.
