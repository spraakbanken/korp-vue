# Architecture

## System

## Layout

Overview, core/ui.

## Instance code

The code requires an instance plugin with site-specific config and extensions to be placed in `instance/`.

```
src/                  # Main app code, alias: "@/"
instance/             # This folder is in .gitignore, add it yourself, alias: "@instance/"
instance/plugin.ts    # Instance plugin
instance/settings.ts  # Instance settings
```

- **Instance plugin** – must export an function that returns `Promise<Plugin>`, used by [src/main.ts](./src/main.ts), see [Vue Plugin docs](https://vuejs.org/guide/reusability/plugins)
- **Instance settings** - must export an object with frontend settings

## Data flow

(Dev docs, not user docs)

Init, search, results, dynamic tabs, export

## Libraries

Bootstrap, Chart

## Helper subsystems?

## Tests
