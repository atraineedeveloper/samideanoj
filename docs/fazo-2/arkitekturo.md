# Arkitekturo

- **Stato:** Skizo por diskuto
- **Dato:** 2026-11-27
- **Decidoj:** [ADR 0002](../adr/0002-gastigado-kaj-datumbazo.md) (gastigado), [ADR 0003](../adr/0003-kadro.md) (kadro), [ADR 0004](../adr/0004-ensaluto-kaj-seancoj.md) (ensaluto)

La tuta sistemo estas **unu Worker de Cloudflare kun unu datumbazo D1**. Neniu alia servilo, neniu pagata servo.

## Nivelo 1: Kunteksto

Kiu uzas la sistemon kaj kun kiuj eksteraj sistemoj ĝi parolas.

```mermaid
flowchart TB
    vizitanto["👤 Vizitanto<br/>(sen konto)"]
    uzanto["👤 Samideano<br/>(kun konto)"]
    moderiganto["👤 Moderiganto"]

    sistemo["<b>Samideanoj</b><br/>Adresaro de esperantistoj"]

    google["Google<br/>(OAuth)"]
    github["GitHub<br/>(OAuth)"]
    telegramo["Telegramo<br/>(ensalutilo)"]
    retoj["Sociaj retoj<br/>(nur ligiloj)"]

    vizitanto -->|serĉas, vidas mapon kaj publikajn profilojn| sistemo
    uzanto -->|kreas kaj redaktas sian profilon| sistemo
    moderiganto -->|revizias raportojn| sistemo
    sistemo -->|kontrolas identecon| google
    sistemo -->|kontrolas identecon| github
    sistemo -->|kontrolas subskribon| telegramo
    vizitanto -.->|sekvas ligilojn| retoj
```

Samideanoj **ne parolas** kun la sociaj retoj: ĝi nur montras ligilojn. Ne ekzistas API-integriĝoj kiuj povus rompiĝi.

## Nivelo 2: Ujoj

```mermaid
flowchart TB
    retumilo["<b>Retumilo</b><br/>HTML bildigita en la servilo<br/>+ malgrandaj interagaj insuloj"]

    subgraph cf["Cloudflare (senpaga plano)"]
        statikaj["<b>Statikaj dosieroj</b><br/>CSS, tiparoj, SVG-mapo<br/>senpagaj kaj senlimaj"]
        worker["<b>Worker: Astro-aplikaĵo</b><br/>paĝoj, formularoj, ensaluto,<br/>serĉado, moderigado"]
        d1[("<b>D1 (SQLite)</b><br/>uzantoj, ligiloj, urboj,<br/>seancoj, raportoj")]
        kasxmemoro["<b>Kaŝmemoro</b><br/>nombroj por la mapo"]
    end

    retumilo -->|HTTPS| statikaj
    retumilo -->|HTTPS| worker
    worker -->|SQL| d1
    worker -->|legas / skribas| kasxmemoro
```

| Ujo | Respondeco | Teknologio |
| --- | --- | --- |
| Statikaj dosieroj | CSS, tiparoj, bildoj, la SVG-mapo de la mondo | Cloudflare Workers Static Assets |
| Worker | Bildigas paĝojn, traktas formularojn kaj ensaluton | Astro + TypeScript |
| D1 | Ĉiuj konstantaj datumoj | SQLite, laŭ la [datummodelo](datummodelo.md) |
| Kaŝmemoro | Antaŭkalkulitaj nombroj por la mapo | Cache API de Workers |

## Nivelo 3: Komponantoj de la Worker

```mermaid
flowchart LR
    subgraph worker["Worker"]
        vojigo["Vojigo kaj plurlingveco<br/>/eo /es /en"]
        pagxoj["Paĝoj<br/>hejmo, serĉado, profilo"]
        ensaluto["Ensaluto<br/>OAuth + Telegramo"]
        seancoj["Seancoj<br/>kuketoj + SHA-256"]
        profiloj["Profiloj<br/>redakti, videbleco"]
        sercxado["Serĉado<br/>filtriloj, paĝigo"]
        mapo["Mapo<br/>nombroj, sojlo de 3"]
        moderigado["Moderigado<br/>raportoj"]
        eksporto["Eksporto kaj forigo"]
        limigo["Rapidlimigo"]
        videbleco["Videbleca filtrilo"]
    end
    d1[(D1)]

    vojigo --> pagxoj
    vojigo --> limigo
    pagxoj --> sercxado
    pagxoj --> mapo
    pagxoj --> profiloj
    ensaluto --> seancoj
    profiloj --> videbleco
    sercxado --> videbleco
    videbleco --> d1
    seancoj --> d1
    mapo --> d1
    moderigado --> d1
    eksporto --> d1
```

**La videbleca filtrilo estas la plej grava komponanto.** Ĉiu datumo de profilo, kiu eliras el la servilo, pasas tra ĝi: ĝi forigas la kampojn, kiujn la rigardanto ne rajtas vidi. Neniu paĝo legas profilojn rekte el D1. Tiel unu sola loko garantias la privatecon, kaj unu aro de testoj kontrolas ĝin.

## Deplojo

```mermaid
flowchart LR
    pr["Kunfando-peto"] --> ci["GitHub Actions:<br/>lintilo, tipoj, testoj"]
    ci -->|kunfandita en main| prov["Deplojo al provmedio"]
    prov -->|mana aprobo| prod["Deplojo al produktado"]
```

- La deplojo uzas `wrangler` kun ĵetono konservita en la sekretoj de GitHub.
- La migradoj de D1 estas versiigitaj en la deponejo kaj aplikataj dum la deplojo.
- Se GitHub Actions malŝaltiĝas pro neaktiveco, **la retejo daŭre funkcias**: Actions servas nur por deploji, ne por funkciigi.
