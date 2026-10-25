import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import yauzl from "yauzl";
import { describe, expect, it } from "vitest";
import { listFiles, zipDirectory } from "../src/pack";

function project(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "skyhost-cli-"));
  for (const [p, content] of Object.entries(files)) {
    mkdirSync(join(root, p, ".."), { recursive: true });
    writeFileSync(join(root, p), content);
  }
  return root;
}

describe("packaging", () => {
  it("never uploads secrets, dependencies or VCS data", () => {
    const root = project({
      "package.json": "{}",
      "src/index.js": "",
      ".env": "SECRET=1",
      ".env.production": "SECRET=2",
      ".env.example": "SECRET=",
      "node_modules/x/index.js": "",
      ".git/config": "",
      "certs/server.key": "",
      "packages/a/node_modules/y.js": "",
    });
    expect(listFiles(root)).toEqual([".env.example", "package.json", "src/index.js"]);
  });

  it("honours .gitignore and .skyhostignore", () => {
    const root = project({ "a.txt": "", "build/out.js": "", "logs/x.log": "", "keep.log": "", ".gitignore": "build/\n# comment\n", ".skyhostignore": "logs\n*.tmp\n", "x.tmp": "" });
    expect(listFiles(root)).toEqual([".gitignore", ".skyhostignore", "a.txt", "keep.log"]);
  });

  it("skips symlinks that could leak files outside the project", () => {
    const root = project({ "index.js": "" });
    symlinkSync("/etc/passwd", join(root, "passwd"));
    expect(listFiles(root)).toEqual(["index.js"]);
  });

  it("produces a valid ZIP archive", async () => {
    const root = project({ "package.json": '{"name":"x"}', "src/a.js": "console.log(1)" });
    const { buffer, files } = await zipDirectory(root);
    expect(files).toBe(2);
    const names = await new Promise<string[]>((resolve, reject) =>
      yauzl.fromBuffer(buffer, { lazyEntries: true }, (err, zip) => {
        if (err) return reject(err);
        const out: string[] = [];
        zip.on("entry", (e) => { out.push(e.fileName); zip.readEntry(); });
        zip.on("end", () => resolve(out));
        zip.readEntry();
      }),
    );
    expect(names.sort()).toEqual(["package.json", "src/a.js"]);
  });
});
