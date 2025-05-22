import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import createInstancePlugin from '@instance/plugin'
import settings from '@instance/settings'
import setupI18n from '@/i18n'
import PrimeVue from 'primevue/config'
import Nora from '@primeuix/themes/nora'
import App from './App.vue'

// Get URL parameters
const params = new URLSearchParams(location.search)
const mode = params.get('mode') || 'default'
const lang = params.get('lang') || settings.default_language

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, { theme: { preset: Nora } })

// These plugins depend on dynamic loading, and must be in async.
async function setup() {
  app.use(await setupI18n(lang))
  app.use(await createInstancePlugin({ mode }))
  app.mount('#app')
}

setup()
