import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import instancePlugin from '@instance/plugin'
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
app.use(instancePlugin, { mode })

app.mount('#app')
