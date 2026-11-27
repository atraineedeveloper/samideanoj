// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Vidu ADR 0002 (Cloudflare) kaj ADR 0003 (Astro kun React-insuloj).
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react()],
  // Niaj seancoj vivas en D1 (ADR 0004); ne uzu la KV-seancojn de Astro.
  session: false,
  i18n: {
    locales: ["eo", "es", "en"],
    defaultLocale: "eo",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
