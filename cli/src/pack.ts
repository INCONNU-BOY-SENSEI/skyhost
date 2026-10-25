import { readdirSync, readFileSync, statSync, lstatSync } from "node:fs";
import { join, relative, sep } from "node:path";
import yazl from "yazl";

const ALWAYS_IGNORED = [".git", "node_modules", ".skyhost", ".DS_Store", ".env", ".env.*", "*.pem", "*.key", "__pycache__", ".venv", "venv", ".next/cache", "dist/.cache"];
const MAX_BYTES = 500 * 1024 * 1024;
export const MAX_ARCHIVE_BYTES = 100 * 1024 * 1024;

function globToRegex(glob: string): RegExp {
  const g = glob.replace(/\/+$/, "");
  const re = g
    .split("")
    .map((c) => (c === "*" ? "[^/]*" : c === "?" ? "[^/]" : /[.+^${}()|[\]\\]/.test(c) ? `\\${c}` : c))
    .join("")
    .replace(/\[\^\/\]\*\[\^\/\]\*/g, ".*");
  return g.includes("/") ? new RegExp(`^${re.replace(/^\\\//, "")}(/.*)?$`) : new RegExp(`(^|/)${re}(/.*)?$`);
}

export function loadIgnore(root: string): { ignored: (rel: string) => boolean } {
  const patterns = [...ALWAYS_IGNORED];
  for (const f of [".skyhostignore", ".gitignore"]) {
    try {
      patterns.push(...readFileSync(join(root, f), "utf8").split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && !l.startsWith("!")));
    } catch {
    }
  }
  const res = patterns.map(globToRegex);
  const keep = /(^|\/)\.env\.(example|sample|template)$/;
  return { ignored: (rel) => !keep.test(rel) && res.some((r) => r.test(rel)) };
}

export function listFiles(root: string): string[] {
  const { ignored } = loadIgnore(root);
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const abs = join(dir, name);
      const rel = relative(root, abs).split(sep).join("/");
      if (ignored(rel)) continue;
      const st = lstatSync(abs);
      if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) walk(abs);
      else if (st.isFile()) out.push(rel);
    }
  };
  walk(root);
  return out.sort();
}

export function zipDirectory(root: string): Promise<{ buffer: Buffer; files: number }> {
  const files = listFiles(root);
  if (!files.length) throw new Error("Nothing to deploy: the directory is empty (after ignore rules)");
  let total = 0;
  const zip = new yazl.ZipFile();
  for (const f of files) {
    const abs = join(root, f);
    total += statSync(abs).size;
    if (total > MAX_BYTES) throw new Error(`The project is larger than ${MAX_BYTES / 1024 / 1024} MB. Add a .skyhostignore file.`);
    zip.addFile(abs, f);
  }
  zip.end();
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    zip.outputStream.on("data", (c: Buffer) => chunks.push(c));
    zip.outputStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      if (buffer.length > MAX_ARCHIVE_BYTES) return reject(new Error(`The archive is ${Math.round(buffer.length / 1048576)} MB; the upload limit is ${MAX_ARCHIVE_BYTES / 1048576} MB. Add a .skyhostignore file.`));
      resolve({ buffer, files: files.length });
    });
    zip.outputStream.on("error", reject);
  });
}
