# Agordi la ensaluton

Samideanoj ensalutigas per Telegramo, Google kaj GitHub ([ADR 0004](adr/0004-ensaluto-kaj-seancoj.md), [ADR 0006](adr/0006-minimumaj-permesoj-kaj-jxetonoj.md)). Ĉiu provizanto estas sendependa: **provizanto sen kompleta agordo simple ne aperas** en la ensaluta paĝo.

En la ekzemploj sube, `<RETEJO>` estas la adreso de la medio, ekzemple `https://samideanoj-provmedio.otilio-latam.workers.dev`. Ĉiu medio (provmedio, produktado) bezonas siajn proprajn agordojn.

## Kie meti la sekretojn

**En Cloudflare**, ne en GitHub: *Workers & Pages → (la Worker, ekz. `samideanoj-provmedio`) → Settings → Variables and Secrets → Add*.

- Elektu la tipon **Secret** por ĉiuj, eĉ por la nomo de la roboto. La deplojo forigas simplajn variablojn kiuj ne estas en `wrangler.jsonc`, sed konservas sekretojn.
- Por loka disvolvado, kopiu `.dev.vars.example` al `.dev.vars`.

| Nomo | Provizanto |
| --- | --- |
| `TELEGRAM_BOT_NAME` | Telegramo |
| `TELEGRAM_BOT_TOKEN` | Telegramo |
| `GOOGLE_CLIENT_ID` | Google |
| `GOOGLE_CLIENT_SECRET` | Google |
| `GITHUB_CLIENT_ID` | GitHub |
| `GITHUB_CLIENT_SECRET` | GitHub |

## Telegramo

1. En Telegramo, skribu al **@BotFather** kaj sendu `/newbot`. Donu nomon (ekz. *Samideanoj*) kaj uzantnomon finiĝantan per `bot` (ekz. `SamideanojBot`).
2. BotFather donas **ĵetonon** (`123456:ABC…`). Ĝi estas `TELEGRAM_BOT_TOKEN`; la uzantnomo sen `@` estas `TELEGRAM_BOT_NAME`.
3. Sendu `/setdomain` al BotFather, elektu la roboton kaj skribu la domajnon de la retejo **sen** `https://`, ekz. `samideanoj-provmedio.otilio-latam.workers.dev`.

Ni neniam petas permeson, ke la roboto skribu al la uzantoj.

## Google

1. En [console.cloud.google.com](https://console.cloud.google.com), kreu projekton *Samideanoj*.
2. *APIs & Services → OAuth consent screen*: tipo **External**, nomo de la aplikaĵo, kontakta retpoŝto. Ne aldonu skopojn: ni uzas nur `openid`.
3. *APIs & Services → Credentials → Create credentials → OAuth client ID*, tipo **Web application**.
4. En *Authorized redirect URIs*, aldonu `<RETEJO>/auth/google/revoko`.
5. Kopiu la **Client ID** kaj la **Client secret**.

## GitHub

1. En GitHub: *Settings → Developer settings → OAuth Apps → New OAuth App*.
2. *Homepage URL*: `<RETEJO>`. *Authorization callback URL*: `<RETEJO>/auth/github/revoko`.
3. Kreu ĝin, kopiu la **Client ID** kaj generu **Client secret**.

Ni petas neniun skopon: nur la publikan identigilon de la konto. La alirĵetono estas nuligata tuj post la ensaluto.

## Kontroli

Malfermu `<RETEJO>/ensaluti`: la butono de ĉiu agordita provizanto aperas. Se ensaluto malsukcesas, la paĝo montras eraron; la protokoloj de la Worker (*Workers & Pages → Worker → Logs*) montras la kialon.
