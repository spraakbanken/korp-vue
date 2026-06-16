# Development

## Environment

### Editor

### Instance plugin

## Development tasks

### Running and building

- Install deps by running `npm install`
- Run with `npm run dev`

### Environment variables

### Linting and formatting

### Enabling SSL

To activate SSL (e.g. for `?mode=mink` which uses SB-Auth):

1. Point the hostname `korpdev.spraakbanken.gu.se` to localhost. On a UNIX system, you can do this by editing `/etc/hosts`.
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

## Version control

## Releases
