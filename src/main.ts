import { createApp } from "vue"
import { createPinia } from "pinia"
import createInstancePlugin from "@instance/plugin"
import settings from "@/core/config"
import setupI18n from "@/i18n/plugin"
import { getInstanceConfig } from "@/core/config/instanceConfig"
import App from "@/App.vue"
import "@/assets/styles.scss"
import "@fontsource/source-sans-pro/400.css"
import "@fontsource/source-sans-pro/600.css"

// Get URL parameters
const params = new URLSearchParams(location.search)

const app = createApp(App)

app.use(createPinia())

// These plugins depend on dynamic loading, and must be in async.
async function setup() {
  // Load instance settings and merge into global settings
  const instanceConfig = getInstanceConfig()
  Object.assign(settings, instanceConfig)

  // Set up i18n plugin and use the t() function (look up a given key in the current language)
  const lang = params.get("lang") || instanceConfig["default_language"]
  const i18n = await setupI18n(lang)
  const t = (key: string) => i18n.global.t(key)
  app.use(i18n)

  // Set up instance plugin for the current mode
  const mode = params.get("mode") || "default"
  app.use(await createInstancePlugin({ mode, t }))

  // Mount the app
  app.mount("#app")
}

setup()
