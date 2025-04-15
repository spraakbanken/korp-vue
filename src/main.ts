import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

async function loadMode() {
  // Get mode from URL parameter
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode') || 'default'

  // Load mode-specific code if available
  const { setup } = await import(`@instance/modes/${mode}.ts`)
  if (setup) setup(app)
}

loadMode().then(() => {
  app.mount('#app')
})
