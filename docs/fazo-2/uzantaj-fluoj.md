# Uzantaj fluoj

- **Stato:** Skizo por diskuto
- **Dato:** 2026-11-27

Kvin fluoj kovras ĉiujn "Must"-rakontojn de la [PRD](../fazo-1/prd.md).

## Ekranoj

| Ekrano | Adreso | Rakontoj |
| --- | --- | --- |
| Hejmpaĝo kun mapo | `/` | M6 |
| Serĉado | `/sercxi` | M5 |
| Publika profilo | `/s/<slug>` | M3, M4, S1, S3 |
| Ensaluto | `/ensaluti` | M1 |
| Redakti profilon | `/mia-profilo` | M2, M3, M4 |
| Agordoj: eksporti kaj forigi | `/agordoj` | M7 |
| Moderigado | `/moderigado` | M8 |

## 1. Vizitanto malkovras samideanojn

```mermaid
flowchart LR
    A[Hejmpaĝo kun mapo] -->|alklakas urbon| B[Serĉado filtrita laŭ urbo]
    A -->|serĉas| B
    B -->|alklakas profilon| C[Publika profilo]
    C -->|vidas ligilojn 'nur por ensalutintoj'| D[Ensaluto]
    D --> C
```

La vizitanto vidas la publikajn kampojn sen konto. Kiam kampo estas "nur por ensalutintoj", ri vidas la tipon de la ligilo (ekz. "Telegramo") kun invito ensaluti, ne la valoron.

## 2. Novulo aliĝas kaj kreas profilon

```mermaid
flowchart LR
    A[Ensaluto] -->|Telegramo, Google aŭ GitHub| B{Ĉu konto ekzistas?}
    B -->|ne| C[Krei profilon: kromnomo, urbo, nivelo]
    C --> D[Aldoni ligilojn kaj elekti videblecon]
    D --> E[Antaŭvido: 'Tiel aliaj vidas vin']
    E --> F[Publika profilo]
    B -->|jes| F
```

- La unua paŝo petas nur tri kampojn; ĉio alia estas nedeviga kaj aldonebla poste.
- La antaŭvido montras la profilon kiel vizitanto kaj kiel ensalutinto vidus ĝin, antaŭ ol publikigi.

## 3. Uzanto redaktas profilon

```mermaid
flowchart LR
    A[Mia profilo] --> B[Redakti kampojn]
    B --> C[Ŝanĝi videblecon de ĉiu kampo]
    C --> D[Konservi]
    D --> E[Antaŭvido]
```

## 4. Uzanto eksportas aŭ forigas sian konton

```mermaid
flowchart LR
    A[Agordoj] -->|Eksporti| B[Elŝuti JSON-dosieron]
    A -->|Forigi konton| C[Konfirmo: tajpi la kromnomon]
    C --> D[Ĉiuj datumoj forigitaj tuj]
```

## 5. Raporto kaj moderigado

```mermaid
flowchart LR
    A[Publika profilo] -->|Raporti| B[Elekti kialon]
    B --> C[Raporto en la vico]
    C --> D[Moderiganto revizias]
    D -->|akcepti| E[Profilo kaŝita]
    D -->|malakcepti| F[Nenio ŝanĝiĝas]
```
