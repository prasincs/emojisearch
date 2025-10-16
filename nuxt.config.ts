// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxthq/ui",
    "@vueuse/nuxt",
    "@nuxtjs/fontaine",
    "@nuxtjs/google-fonts",
    "@vite-pwa/nuxt",
  ],
  runtimeConfig: {
    openaiApiKey: "",
  },
  colorMode: {
    preference: "dark",
  },
  googleFonts: {
    families: {
      Chewy: true,
    },
  },
  nitro: {
    prerender: {
      routes: ["/"],
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
    routeRules: {
      "/**": {
        headers: {
          "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';",
        },
      },
    },
  },
  fontMetrics: {
    fallbacks: ["BlinkMacSystemFont", "Segoe UI", "Helvetica Neue", "Arial", "Noto Sans"],
    fonts: ["Chewy"],
  },
  pwa: {
    manifest: {
      name: "Emoji Search",
      short_name: "EmojiSearch",
      theme_color: "#121212",
      background_color: "#121212",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
    },
  },
});
