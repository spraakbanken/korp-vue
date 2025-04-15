import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import settings from '@instance/settings'
import setupI18n from '@/i18n'
import App from './App.vue'

// Get URL parameters
const params = new URLSearchParams(location.search)
const mode = params.get('mode') || 'default'
const lang = params.get('lang') || settings.default_language

const app = createApp(App)

app.use(createPinia())
app.use(setupI18n(lang))

async function loadMode() {
  // Load mode-specific code if available
  try {
    const modePlugin = await import(`@instance/modes/${mode}.ts`)
    app.use(modePlugin, { params })
  } catch {}
}

loadMode().then(() => {
  app.mount('#app')
})
