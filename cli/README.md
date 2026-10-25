# SKYHOST CLI — source

The `skyhost` command line interface. User guide: [docs/cli.md](../docs/cli.md).

```bash
npm install          # Node.js 18+
npm run typecheck
npm test
npm run build        # bundles everything into dist/skyhost.js (one file, no dependencies)
node dist/skyhost.js help
```

`dist/skyhost.js` is committed: it is what the installers download and what `npm install -g
github:INCONNU-BOY-SENSEI/skyhost` installs. CI checks that it matches the source — run `npm run build` and
commit it with your change.

| File | |
| --- | --- |
| `src/index.ts` | Argument parsing and help |
| `src/commands.ts` | Every command |
| `src/api.ts` | HTTP + WebSocket client for `https://skyhost.tech/api/v1` |
| `src/config.ts` | Credentials (`~/.config/skyhost/config.json`, mode 0600) and folder links (`.skyhost/`) |
| `src/pack.ts` | Builds the ZIP uploaded by `skyhost deploy` (ignore rules, size limits) |
