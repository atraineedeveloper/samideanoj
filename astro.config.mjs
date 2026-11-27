// @ts-check
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// Vidu ADR 0002 (Cloudflare) kaj ADR 0003 (Astro kun React-insuloj).
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react()],
  i18n: {
    locales: ["eo", "es", "en"],
    defaultLocale: "eo",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
