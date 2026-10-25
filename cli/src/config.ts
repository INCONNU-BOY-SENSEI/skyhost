import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";

export interface GlobalConfig {
  apiUrl: string;
  apiKey?: string;
  teamId?: string;
}

export interface ProjectLink {
  projectId: string;
  serviceId: string;
  environmentId: string;
}

export const DEFAULT_API_URL = process.env.SKYHOST_API_URL ?? "https://skyhost.tech";

export function configPath() {
  const base = process.env.SKYHOST_CONFIG_DIR ?? join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "skyhost");
  return join(base, "config.json");
}

export function readConfig(): GlobalConfig {
  const fromEnv: Partial<GlobalConfig> = {
    ...(process.env.SKYHOST_API_URL ? { apiUrl: process.env.SKYHOST_API_URL } : {}),
    ...(process.env.SKYHOST_TOKEN ? { apiKey: process.env.SKYHOST_TOKEN } : {}),
    ...(process.env.SKYHOST_TEAM_ID ? { teamId: process.env.SKYHOST_TEAM_ID } : {}),
  };
  let file: Partial<GlobalConfig> = {};
  try {
    file = JSON.parse(readFileSync(configPath(), "utf8"));
  } catch {
  }
  return { apiUrl: DEFAULT_API_URL, ...file, ...fromEnv } as GlobalConfig;
}

export function writeConfig(c: GlobalConfig) {
  const p = configPath();
  mkdirSync(dirname(p), { recursive: true, mode: 0o700 });
  writeFileSync(p, JSON.stringify(c, null, 2), { mode: 0o600 });
  chmodSync(p, 0o600);
}

export function clearConfig() {
  rmSync(configPath(), { force: true });
}

const LINK_DIR = ".skyhost";

export function findLink(from = process.cwd()): { root: string; link: ProjectLink } | null {
  let dir = resolve(from);
  for (;;) {
    const f = join(dir, LINK_DIR, "project.json");
    if (existsSync(f)) {
      try {
        return { root: dir, link: JSON.parse(readFileSync(f, "utf8")) };
      } catch {
        return null;
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function writeLink(root: string, link: ProjectLink) {
  mkdirSync(join(root, LINK_DIR), { recursive: true });
  writeFileSync(join(root, LINK_DIR, "project.json"), JSON.stringify(link, null, 2));
  writeFileSync(join(root, LINK_DIR, ".gitignore"), "*\n");
}

export function removeLink(root: string) {
  rmSync(join(root, LINK_DIR), { recursive: true, force: true });
}
