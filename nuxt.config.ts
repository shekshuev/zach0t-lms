// https://nuxt.com/docs/api/configuration/nuxt-config
import svgLoader from "vite-svg-loader";

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  vite: {
    plugins: [svgLoader()],
  },
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/test-utils",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "nuxt-mongoose",
    "nuxt-tiptap-editor",
    "nuxt-monaco-editor",
    "@vee-validate/nuxt",
    "nuxt-auth-utils",
    "dayjs-nuxt",
  ],
  css: ["~/assets/app.css"],
  i18n: {
    defaultLocale: "en",
    locales: [
      { code: "en", name: "English", file: "en.json" },
      { code: "ru", name: "Russian", file: "ru.json" },
    ],
  },
  mongoose: {
    uri: import.meta.env.MONGODB_URI,
    options: {},
    modelsDir: "models",
    devtools: true,
  },
  eslint: {
    config: {
      autoInit: false,
    },
  },
});