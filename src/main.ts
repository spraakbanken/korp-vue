import { createApp } from "vue"
import { createPinia } from "pinia"
import createInstancePlugin from "@instance/plugin"
import settings from "@instance/settings"
import setupI18n from "@/i18n/plugin"
import App from "@/App.vue"
import "@/assets/styles.scss"
import "@fontsource/source-sans-pro/400.css"
import "@fontsource/source-sans-pro/600.css"

// Get URL parameters
const params = new URLSearchParams(location.search)
const mode = params.get("mode") || "default"
const lang = params.get("lang") || settings.default_language

const app = createApp(App)

app.use(createPinia())

// These plugins depend on dynamic loading, and must be in async.
async function setup() {
  // Set up i18n plugin and use the t() function (look up a given key in the current language)
  const i18n = await setupI18n(lang)
  const t = (key: string) => i18n.global.t(key)
  app.use(i18n)

  // Set up instance plugin for the current mode
  await app.use(await createInstancePlugin({ mode, t }))

  app.mount("#app")
}

setup()
