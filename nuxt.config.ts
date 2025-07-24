// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },

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
