import { createApp } from "vue"
import { createPinia } from "pinia"
import createInstancePlugin from "@instance/plugin"
import settings from "@/core/config"
import setupI18n from "@/i18n/plugin"
import { getInstanceConfig } from "@/core/config/instanceConfig"
import App from "@/App.vue"
import "@/assets/styles.scss"
import "@fontsource-variable/jost"
import { createVueMatomo } from "vue3-matomo"

// Get URL parameters
const params = new URLSearchParams(location.search)
const hash = new URLSearchParams(location.hash.slice(1))

const app = createApp(App) //
  .use(createPinia())

// These plugins depend on dynamic loading, and must be in async.
async function setup() {
  // Dynamic import of Fontawesome for code-splitting
  import("./fontawesome").then(({ default: fontawesome }) => app.use(fontawesome))

  // Load instance settings and merge into global settings
  const instanceConfig = getInstanceConfig()
  Object.assign(settings, instanceConfig)

  // Set up i18n plugin and use the t() function (look up a given key in the current language)
  const lang = hash.get("lang") || instanceConfig["default_language"]
  const i18n = await setupI18n(lang)
  const t = (key: string) => i18n.global.t(key)
  app.use(i18n)

  if (settings.matomo?.url && settings.matomo.site) {
    const matomo = createVueMatomo({
      // Url expected without trailing slash
      host: settings.matomo.url.replace(/\/$/, ""),
      siteId: settings.matomo.site,
    })
    app.use(matomo)
  }

  // Set up instance plugin for the current mode
  const mode = params.get("mode") || "default"
  app.use(await createInstancePlugin({ mode, t }))

  // Mount the app
  app.mount("#app")
}

setup()
