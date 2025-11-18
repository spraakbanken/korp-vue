# korp-vue

A Vue 3 rewrite of [korp-frontend](https://github.com/spraakbanken/korp-frontend).

**Status: experimental**

## Quick setup

```
git clone git@github.com:spraakbanken/korp-vue
git clone git@github.com:spraakbanken/korp-vue-sb
cd korp-vue
ln -s ../korp-vue-sb instance
yarn install
yarn dev
```

## Setup details

The code requires an instance plugin with site-specific config and extensions to be placed in `instance/`.

```
src/                  # Main app code, alias: "@/"
instance/             # This folder is in .gitignore, add it yourself, alias: "@instance/"
instance/plugin.ts    # Instance plugin
instance/settings.ts  # Instance settings
```

- **Instance plugin** – must export an function that returns `Promise<Plugin>`, used by [src/main.ts](./src/main.ts), see [Vue Plugin docs](https://vuejs.org/guide/reusability/plugins)
- **Instance settings** - must export an object with frontend settings

## Development

- Install deps by running `yarn` (v1)
- Run with `yarn dev`
