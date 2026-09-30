# Changelog

All notable changes to this project shall be documented in this file.

Versioning follows a `MAJOR`.`MINOR`.`PATCH` pattern, where:

- `MAJOR` denotes changes that are expected to **significantly affect** or the user experience or the development workflow
- `MINOR` denotes changes that **may affect** the user experience or the development workflow
- `PATCH` denotes changes that are **insignificant** to the user experience or the develpment workflow

## 10.0.0 (2016-09-29)

First release of the Vue.js rewrite 🎉

The codebase has moved from the `korp-frontend` repository to `korp-vue`.
The purpose is still being the official "Korp frontend",
so you can still call it that in speech and writing.

Comparing to the previous repo,
the core code is practically identical,
but the UI layer has been completely rewritten.

To set up your own instance, get started with [INSTANCE.md](docs/INSTANCE.md).

### Configuration changes

While the settings in app config and corpus config have been mostly left unchanged,
the file structure of instance code has been completely reworked.

Here is an overview of the differences:

| Customization                | In korp-frontend (v9)             | In korp-vue (v10)                            |
| ---------------------------- | --------------------------------- | -------------------------------------------- |
| App settings                 | `<conf>/config.yml`               | `@instance/settings`                         |
| Translations                 | `<conf>/translations/*.json`      | `@instance/locale/<lang>.yaml`               |
| Mode-specific functionality  | `<conf>/modes/<mode>_mode.js`     | Use `options.mode` in `@instance/plugin`     |
| Branding                     | `settings.logo`                   | `componentInjectionKeys.*`                   |
| Auth module                  | `settings.auth_module`            | `injectionKeys.auth`                         |
| Custom auth module           | `<conf>/custom/<name>.js`         | `injectionKeys.auth`                         |
| Attribute formatters         | `<conf>/custom/sidebar.js`        | `injectionKeys.attribute.formatters`         |
| Attribute stringifiers       | `<conf>/custom/stringify.js`      | `injectionKeys.attribute.(list)Stringifiers` |
| Attribute stats stringifiers | `<conf>/custom/statistics.js`     | `injectionKeys.attribute.(list)Stringifiers` |
| Attribute CQP stringifiers   | `<conf>/custom/statistics.js`     | `injectionKeys.attribute.cqpStringifiers`    |
| Attribute search widgets     | `<conf>/custom/extended.js`       | `injectionKeys.search.widgets`               |
| Statistics postprocessor     | `settings.statistics_postprocess` | `injectionKeys.statisticsPostprocess`        |
| Custom AngularJS components  | `<conf>/custom/components.js`     | In Vue, just import the component            |

### Some specific settings

The init-related config settings `config_dependent_on_authentication` and `initialization_checks` have been removed.
The init flow now always awaits auth init.
To require login, show a modal in the auth status component.

The `navigation` config setting was added.
It can be used to provide related links in the app header.

## Older versions

See [korp-frontend/CHANGELOG.md](https://github.com/spraakbanken/korp-frontend/blob/master/CHANGELOG.md).
