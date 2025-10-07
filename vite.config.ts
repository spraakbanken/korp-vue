import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import yaml from '@modyfi/vite-plugin-yaml'
import { ServerOptions } from 'node:https'
import { readFileSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Vite will do it itself, but only after evaluating this config.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  /** Read HTTPS cert and key, if their paths are specified in env. */
  function getHttpsOptions(): Pick<ServerOptions, 'key' | 'cert'> | undefined {
    if (env.DEV_HTTPS_KEY && env.DEV_HTTPS_CERT) {
      return {
        key: readFileSync(env.DEV_HTTPS_KEY),
        cert: readFileSync(env.DEV_HTTPS_CERT),
      }
    }
  }

  return {
    plugins: [vue(), vueDevTools(), yaml()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // Resolve imports of app settings and custom code
        '@instance': fileURLToPath(new URL('./instance', import.meta.url)),
      },
    },
    // Configurable base url, should start with slash
    base: env.BASE || '/korp',
    server: {
      // Remap hostname and enable HTTPS, in order for authentication to work.
      // Map this hostname to 127.0.0.1 in /etc/hosts.
      host: 'korpdev.spraakbanken.gu.se',
      https: getHttpsOptions(),
    },
  }
})
