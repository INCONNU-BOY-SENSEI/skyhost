import { build } from "esbuild";

await build({
  entryPoints: ["src/index.ts"],
  outfile: "dist/skyhost.js",
  bundle: true,
  platform: "node",
  target: "node18",
  format: "esm",
  external: ["bufferutil", "utf-8-validate"],
  banner: { js: "#!/usr/bin/env node\nimport { createRequire } from 'module'; const require = createRequire(import.meta.url);" },
});
console.log("CLI bundled to dist/skyhost.js");
