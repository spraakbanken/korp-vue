# Development

To run the code, you need Node.js 22 or higher and [mkcert](https://mkcert.dev) or similar.

## Environment

### Editor

As a suggestion, run
[Visual Studio Code](https://code.visualstudio.com/) with the plugins
[Vue](https://marketplace.visualstudio.com/items?itemName=Vue.volar),
[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint),
[Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) and
[Bootstrap Class Autocomplete](https://marketplace.visualstudio.com/items?itemName=torresgol10.bootstrap-class-autocomplete).

Recommended VSCode settings (see [docs on settings.json](https://code.visualstudio.com/docs/configure/settings#_settings-json-file)):

```jsonc
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "always",
  },
  "editor.formatOnSave": true,
  "editor.formatOnType": true,
  "[javascript][typescript][vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[json][jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  "[html][css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
  },
  // Include instance code when searching
  "search.useIgnoreFiles": false,
  "search.exclude": {
    "dist": true,
    "stats.html": true,
  },
}
```

### Instance plugin

For the code to build, you must create `instance/plugin.ts`
with an async function returning a Vue plugin.
See [ARCHITECTURE.md: Instance code](./ARCHITECTURE.md#instance-code).

### Environment variables

Vite will read variables from env files.
See [Vite docs](https://vitejs.dev/guide/env-and-mode).

| Variable       | Comment                             |
| -------------- | ----------------------------------- |
| BASE           | Base path, defaults to `/korp-vue/` |
| DEV_HOST       | Hostname for dev server             |
| DEV_HTTPS_CERT | Path to HTTPS certificate file      |
| DEV_HTTPS_KEY  | Path to HTTPS private key file      |

### Enabling HTTPS

To load protected resources, you may need to serve the frontend under a specific origin and enable HTTPS.

For instance, this is needed in Språkbanken's Mink mode, using SB-Auth with the Federated auth module.

1. Point the hostname `korpdev.spraakbanken.gu.se` to localhost
   - On a UNIX system, you can do this by editing `/etc/hosts`
2. Create certificate files with mkcert:
   ```sh
   mkcert "*.spraakbanken.gu.se"
   ```
3. Set these environment variables in `.env` or otherwise:
   ```ini
   KORP_HOST=korpdev.spraakbanken.gu.se
   DEV_HTTPS_KEY=_wildcard.spraakbanken.gu.se-key.pem
   DEV_HTTPS_CERT=_wildcard.spraakbanken.gu.se.pem
   ```

## Development tasks

Some of these commands are defined in the `scripts` section of `package.json`.

| Task                                                 | Command         |
| ---------------------------------------------------- | --------------- |
| Install the dependencies needed to run the code      | `npm install`   |
| Serve the frontend from a temporary local dev server | `npm start`     |
| Check for formatting problems                        | `npm run check` |
| Attempt to fix formatting problems automatically     | `npm run fix`   |
| Build the frontend as optimized HTML + assets        | `npm run build` |

## Version control

A commit should contain a single, coherent change.
If suitable, note the change in [CHANGELOG.md](../CHANGELOG.md).

Continual development happens on the **main** branch.
It should always be healthy, so any changes that break the build should be fixed as soon as possible.

For a larger change, please create a specific branch, and squash-merge to main when ready.

Change suggestions in the form of pull requests are very welcome.
Fork the repo, create a branch, add your commits, push it to your fork, and then open a pull request against the main branch.

Close collaborators can ask for write access to the repo, and do not need to fork it.

## Releases

The timing of a release is determined by maintainers, and may be more or less connected to the ongoing work at Språkbanken Text.

1. Check and test the code carefully
2. Update [CHANGELOG.md](../CHANGELOG.md) and docs
3. Update the version number in `package.json`
   - and run `npm install` to have it propagated into `package-lock.json`
4. Commit changes
5. Tag the commit as `v` + version number, e.g. `git tag v1.2.3`
6. Push the branch and the tag: `git push --tags origin main`
7. Build and deploy
