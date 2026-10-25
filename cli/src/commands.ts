import { basename } from "node:path";
import { createInterface } from "node:readline/promises";
import { setTimeout as sleep } from "node:timers/promises";
import { Api, CliError } from "./api";
import { clearConfig, findLink, readConfig, removeLink, writeConfig, writeLink, type GlobalConfig, type ProjectLink } from "./config";
import { zipDirectory } from "./pack";

export interface Io {
  out: (s: string) => void;
  err: (s: string) => void;
  prompt: (q: string) => Promise<string>;
  openUrl: (url: string) => void;
}

export const defaultIo: Io = {
  out: (s) => process.stdout.write(`${s}\n`),
  err: (s) => process.stderr.write(`${s}\n`),
  prompt: async (q) => {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    try {
      return (await rl.question(q)).trim();
    } finally {
      rl.close();
    }
  },
  openUrl: (url) => {
    const cmd = process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
    import("node:child_process").then(({ spawn }) => spawn(cmd, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" }).on("error", () => {}).unref()).catch(() => {});
  },
};

const color = (code: number) => (s: string) => (process.stdout.isTTY && !process.env.NO_COLOR ? `\x1b[${code}m${s}\x1b[0m` : s);
export const c = { dim: color(2), red: color(31), green: color(32), yellow: color(33), blue: color(34), bold: color(1) };

const TERMINAL = ["live", "failed", "cancelled", "superseded", "stopped"];

export class Commands {
  cfg: GlobalConfig;
  api: Api;

  constructor(private io: Io = defaultIo) {
    this.cfg = readConfig();
    this.api = new Api(this.cfg);
  }

  private requireAuth() {
    if (!this.cfg.apiKey) throw new CliError("You are not logged in. Run `skyhost login`.");
  }

  private requireLink(): { root: string; link: ProjectLink } {
    this.requireAuth();
    const l = findLink();
    if (!l) throw new CliError("This directory is not linked to a SKYHOST service. Run `skyhost link`.");
    return l;
  }

  async login(opts: { apiUrl?: string; token?: string; noBrowser?: boolean }) {
    const apiUrl = (opts.apiUrl ?? this.cfg.apiUrl ?? "").replace(/\/+$/, "");
    if (!apiUrl) throw new CliError("No API URL: set SKYHOST_API_URL or pass --api-url");
    this.cfg = { ...this.cfg, apiUrl };
    this.api = new Api(this.cfg);
    if (opts.token) {
      this.cfg.apiKey = opts.token;
      this.api = new Api(this.cfg);
      const me = await this.api.get("/auth/me");
      writeConfig({ apiUrl, apiKey: opts.token, teamId: me.apiKey?.teamId });
      this.io.out(`${c.green("✓")} Logged in as ${me.user.email}`);
      return;
    }
    const start = await this.api.post<{ deviceCode: string; userCode: string; verificationUrl: string; expiresIn: number; interval: number }>("/auth/cli/start");
    this.io.out(`Open ${c.bold(start.verificationUrl)} and confirm the code ${c.bold(start.userCode)}`);
    if (!opts.noBrowser) this.io.openUrl(start.verificationUrl);
    const deadline = Date.now() + start.expiresIn * 1000;
    while (Date.now() < deadline) {
      await sleep(start.interval * 1000);
      const r = await this.api.post<{ status: string; apiKey?: string; teamId?: string }>("/auth/cli/poll", { deviceCode: start.deviceCode });
      if (r.status === "approved" && r.apiKey) {
        writeConfig({ apiUrl, apiKey: r.apiKey, teamId: r.teamId });
        this.cfg = readConfig();
        this.api = new Api(this.cfg);
        const me = await this.api.get("/auth/me");
        this.io.out(`${c.green("✓")} Logged in as ${me.user.email}`);
        return;
      }
      if (r.status === "expired") break;
    }
    throw new CliError("The login request expired. Run `skyhost login` again.");
  }

  async logout() {
    clearConfig();
    this.io.out("Logged out. The API key stays valid until you revoke it in Account → API keys.");
  }

  async whoami() {
    this.requireAuth();
    const me = await this.api.get("/auth/me");
    const teams = await this.api.get("/teams");
    const team = teams.teams.find((t: any) => t.id === (me.apiKey?.teamId ?? this.cfg.teamId));
    this.io.out(`${me.user.name} <${me.user.email}>`);
    if (team) this.io.out(`Team: ${team.name} (${team.role})`);
    if (me.apiKey) this.io.out(`Key scopes: ${me.apiKey.scopes.join(", ")}`);
  }

  private async pick<T>(items: T[], label: (t: T) => string, what: string, wanted?: string, match?: (t: T, w: string) => boolean): Promise<T> {
    if (wanted) {
      const found = items.find((i) => match!(i, wanted));
      if (!found) throw new CliError(`No ${what} matches "${wanted}"`);
      return found;
    }
    if (!items.length) throw new CliError(`No ${what} found`);
    if (items.length === 1) return items[0]!;
    items.forEach((i, n) => this.io.err(`  ${n + 1}) ${label(i)}`));
    const answer = await this.io.prompt(`Choose a ${what} [1-${items.length}]: `);
    const idx = Number(answer) - 1;
    if (!Number.isInteger(idx) || !items[idx]) throw new CliError("Invalid choice");
    return items[idx]!;
  }

  async link(opts: { project?: string; service?: string; environment?: string }) {
    this.requireAuth();
    const teamId = this.cfg.teamId;
    if (!teamId) throw new CliError("Your API key is not bound to a team. Run `skyhost login` again.");
    const { projects } = await this.api.get(`/teams/${teamId}/projects`);
    const byNameOrId = (x: any, w: string) => x.id === w || x.name.toLowerCase() === w.toLowerCase() || x.slug === w;
    const project = await this.pick<any>(projects, (p) => p.name, "project", opts.project, byNameOrId);
    const detail = await this.api.get(`/projects/${project.id}`);
    const service = await this.pick<any>(detail.services, (s) => `${s.name} (${s.type})`, "service", opts.service, byNameOrId);
    const env = await this.pick<any>(detail.environments, (e) => e.name, "environment", opts.environment ?? (detail.environments.length > 1 ? "production" : undefined), byNameOrId);
    writeLink(process.cwd(), { projectId: project.id, serviceId: service.id, environmentId: env.id });
    this.io.out(`${c.green("✓")} Linked to ${project.name} / ${service.name} (${env.name})`);
  }

  async unlink() {
    const l = findLink();
    if (!l) throw new CliError("This directory is not linked");
    removeLink(l.root);
    this.io.out("Unlinked");
  }

  async init(opts: { name?: string; type?: string; detach?: boolean }) {
    this.requireAuth();
    const teamId = this.cfg.teamId;
    if (!teamId) throw new CliError("Your API key is not bound to a team. Run `skyhost login` again.");
    if (findLink()) throw new CliError("This directory is already linked. Use `skyhost deploy`.");
    const name = (opts.name ?? basename(process.cwd())).replace(/[^a-zA-Z0-9 _-]/g, "-").replace(/^[^a-zA-Z0-9]+/, "").slice(0, 48) || "app";
    const { buffer, files } = await zipDirectory(process.cwd());
    this.io.out(`Packaging ${files} files (${(buffer.length / 1024).toFixed(0)} KB)…`);
    const up = await this.api.upload(`/uploads?teamId=${teamId}`, buffer, "source.zip");
    const { project, environment } = await this.api.post("/projects", { teamId, name });
    const svc = await this.api.post(`/projects/${project.id}/services`, { name, type: opts.type ?? "web", source: { kind: "zip", uploadId: up.upload.id }, deploy: true });
    writeLink(process.cwd(), { projectId: project.id, serviceId: svc.service.id, environmentId: environment.id });
    this.io.out(`${c.green("✓")} Created ${project.name} and linked this directory`);
    if (svc.deployment && !opts.detach) await this.follow(svc.deployment.id);
  }

  async deploy(opts: { detach?: boolean; message?: string }) {
    const { root, link } = this.requireLink();
    const { buffer, files } = await zipDirectory(root);
    this.io.out(`Uploading ${files} files (${(buffer.length / 1024).toFixed(0)} KB)…`);
    const r = await this.api.upload(`/services/${link.serviceId}/deploy-zip?environmentId=${link.environmentId}`, buffer, "source.zip");
    this.io.out(`Deployment ${c.bold(r.deployment.id.slice(0, 8))} queued`);
    if (opts.detach) return;
    await this.follow(r.deployment.id);
  }

  async redeploy() {
    const { link } = this.requireLink();
    const r = await this.api.post(`/services/${link.serviceId}/redeploy`, { environmentId: link.environmentId });
    this.io.out(`Deployment ${c.bold(r.deployment.id.slice(0, 8))} queued`);
    await this.follow(r.deployment.id);
  }

  async follow(deploymentId: string) {
    let cursor = 0;
    for (;;) {
      const logs = await this.api.get(`/deployments/${deploymentId}/logs?after=${cursor}`);
      for (const l of logs.lines) this.io.out(l.level === "error" ? c.red(l.line) : l.level === "warn" ? c.yellow(l.line) : l.line);
      cursor = logs.nextCursor;
      const { deployment: d } = await this.api.get(`/deployments/${deploymentId}`);
      if (TERMINAL.includes(d.status)) {
        const rest = await this.api.get(`/deployments/${deploymentId}/logs?after=${cursor}`);
        for (const l of rest.lines) this.io.out(l.line);
        if (d.status === "live") {
          const url = await this.liveUrl(d.serviceId, d.environmentId);
          this.io.out(`${c.green("✓")} Live${url ? ` at ${c.bold(url)}` : ""}`);
          return;
        }
        if (d.status === "failed") {
          const diag = await this.api.get(`/deployments/${deploymentId}/diagnosis`).catch(() => ({ diagnoses: [] }));
          this.io.err(c.red(`✗ Deployment failed: ${d.error ?? "unknown error"}. The previous version stays live.`));
          for (const x of diag.diagnoses) this.io.err(`  ${c.bold(x.problem)}\n  Cause: ${x.cause}\n  Fix: ${x.suggestedFix}`);
          throw new CliError("", 1);
        }
        this.io.out(`Deployment ${d.status}`);
        return;
      }
      await sleep(1500);
    }
  }

  private async liveUrl(serviceId: string, environmentId: string) {
    const link = findLink();
    if (!link) return null;
    const p = await this.api.get(`/projects/${link.link.projectId}`);
    return p.services.find((s: any) => s.id === serviceId)?.instances.find((i: any) => i.environmentId === environmentId)?.url ?? null;
  }

  async status() {
    const { link } = this.requireLink();
    const p = await this.api.get(`/projects/${link.projectId}`);
    const env = p.environments.find((e: any) => e.id === link.environmentId);
    this.io.out(`${c.bold(p.project.name)} · ${env?.name ?? "?"}`);
    for (const s of p.services) {
      const inst = s.instances.find((i: any) => i.environmentId === link.environmentId);
      const mark = s.id === link.serviceId ? "›" : " ";
      this.io.out(`${mark} ${s.name.padEnd(20)} ${String(inst?.status ?? "idle").padEnd(10)} ${inst?.url ?? ""}`);
      if (inst?.latestDeployment) this.io.out(c.dim(`    last deploy: ${inst.latestDeployment.status} ${inst.latestDeployment.commitMessage?.split("\n")[0] ?? ""}`));
    }
  }

  async deployments() {
    const { link } = this.requireLink();
    const { deployments } = await this.api.get(`/services/${link.serviceId}/deployments?environmentId=${link.environmentId}&limit=15`);
    for (const d of deployments) this.io.out(`${d.id.slice(0, 8)}  ${d.status.padEnd(11)} ${d.trigger.padEnd(8)} ${new Date(d.createdAt).toLocaleString()}  ${d.commitSha?.slice(0, 7) ?? ""} ${d.commitMessage?.split("\n")[0] ?? ""}`);
  }

  async rollback(target?: string) {
    const { link } = this.requireLink();
    const { deployments } = await this.api.get(`/services/${link.serviceId}/deployments?environmentId=${link.environmentId}&limit=50`);
    const liveImage = deployments.find((d: any) => d.status === "live")?.image;
    const candidates = deployments.filter((d: any) => d.image && d.image !== liveImage && ["superseded", "stopped"].includes(d.status));
    const d = target ? deployments.find((x: any) => x.id.startsWith(target)) : candidates[0];
    if (!d) throw new CliError(target ? `No deployment ${target}` : "No previous version to roll back to");
    const r = await this.api.post(`/deployments/${d.id}/rollback`);
    this.io.out(`Rolling back to ${d.id.slice(0, 8)}…`);
    await this.follow(r.deployment.id);
  }

  async logs(opts: { follow?: boolean; deployment?: string; tail?: number }) {
    const { link } = this.requireLink();
    if (opts.deployment) {
      const { deployments } = await this.api.get(`/services/${link.serviceId}/deployments?environmentId=${link.environmentId}&limit=50`);
      const d = deployments.find((x: any) => x.id.startsWith(opts.deployment!));
      if (!d) throw new CliError(`No deployment ${opts.deployment}`);
      if (opts.follow && !TERMINAL.includes(d.status)) return this.follow(d.id);
      const logs = await this.api.get(`/deployments/${d.id}/logs`);
      for (const l of logs.lines) this.io.out(l.line);
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const ws = this.api.websocket(`/services/${link.serviceId}/logs/stream?environmentId=${link.environmentId}&tail=${opts.tail ?? 200}`);
      let quiet: NodeJS.Timeout | undefined;
      const armQuiet = () => {
        if (opts.follow) return;
        clearTimeout(quiet);
        quiet = setTimeout(() => ws.close(), 1500);
      };
      ws.on("open", armQuiet);
      ws.on("message", (raw) => {
        const l = JSON.parse(raw.toString());
        this.io.out(`${c.dim(l.ts?.slice(11, 19) ?? "")} ${l.stream === "stderr" ? c.red(l.line) : l.line}`);
        armQuiet();
      });
      ws.on("close", (code, reason) => (code === 4401 || code === 4403 ? reject(new CliError(`Logs refused: ${reason.toString() || code}`)) : resolve()));
      ws.on("error", (e) => reject(new CliError(e.message)));
    });
  }

  async envList(opts: { reveal?: boolean }) {
    const { link } = this.requireLink();
    const { variables } = await this.api.get(`/environments/${link.environmentId}/variables?serviceId=${link.serviceId}${opts.reveal ? "&reveal=true" : ""}`);
    if (!variables.length) this.io.out(c.dim("No variables"));
    for (const v of variables) this.io.out(`${v.key}=${v.value ?? c.dim("•••••• (secret)")}`);
  }

  async envSet(pairs: string[], opts: { secret?: boolean }) {
    const { link } = this.requireLink();
    if (!pairs.length) throw new CliError("Usage: skyhost env set KEY=value [KEY2=value2…]");
    const variables = pairs.map((p) => {
      const i = p.indexOf("=");
      if (i < 1) throw new CliError(`Expected KEY=value, got "${p}"`);
      return { key: p.slice(0, i), value: p.slice(i + 1), secret: !!opts.secret };
    });
    await this.api.put(`/environments/${link.environmentId}/variables`, { serviceId: link.serviceId, variables, replace: false });
    this.io.out(`${c.green("✓")} ${variables.length} variable(s) saved. Run \`skyhost redeploy\` to apply them.`);
  }

  async envUnset(keys: string[]) {
    const { link } = this.requireLink();
    const { variables } = await this.api.get(`/environments/${link.environmentId}/variables?serviceId=${link.serviceId}`);
    for (const k of keys) {
      const v = variables.find((x: any) => x.key === k && x.serviceId === link.serviceId);
      if (!v) {
        this.io.err(c.yellow(`${k} is not set on this service`));
        continue;
      }
      await this.api.del(`/variables/${v.id}`);
      this.io.out(`Removed ${k}`);
    }
  }

  async shell(command?: string) {
    const { link } = this.requireLink();
    const ws = this.api.websocket(`/services/${link.serviceId}/shell?environmentId=${link.environmentId}`);
    const send = (cmd: string) => ws.send(JSON.stringify({ cmd }));
    await new Promise<void>((resolve, reject) => {
      let rl: ReturnType<typeof createInterface> | null = null;
      ws.on("message", (raw) => {
        const m = JSON.parse(raw.toString());
        if (m.type === "ready") {
          if (command) return send(command);
          this.io.err(c.dim("Connected. Commands run inside the service container; type exit to quit."));
          rl = createInterface({ input: process.stdin, output: process.stdout, prompt: "skyhost$ " });
          rl.prompt();
          rl.on("line", (line) => {
            const cmd = line.trim();
            if (cmd === "exit" || cmd === "quit") return ws.close();
            if (cmd) send(cmd);
            else rl!.prompt();
          });
          rl.on("close", () => ws.close());
        } else if (m.type === "output") {
          if (m.stdout) process.stdout.write(m.stdout);
          if (m.stderr) process.stderr.write(m.stderr);
          if (command) {
            process.exitCode = m.exitCode ?? 0;
            ws.close();
          } else rl?.prompt();
        } else if (m.type === "error" || m.type === "info") {
          this.io.err(m.type === "error" ? c.red(m.message) : m.message);
          if (command) {
            process.exitCode = 1;
            ws.close();
          } else rl?.prompt();
        }
      });
      ws.on("close", (code, reason) => {
        rl?.close();
        code === 4401 || code === 4403 ? reject(new CliError(`Shell refused: ${reason.toString() || code}`)) : resolve();
      });
      ws.on("error", (e) => reject(new CliError(e.message)));
    });
  }

  async dbCreate(engine: string, name: string | undefined, opts: { connect?: boolean }) {
    const { link } = this.requireLink();
    const dbName = name ?? engine;
    const r = await this.api.post("/databases", { projectId: link.projectId, name: dbName, engine, connectServiceIds: opts.connect === false ? [] : [link.serviceId] });
    this.io.out(`${c.green("✓")} ${engine} database ${dbName} is being provisioned${opts.connect === false ? "" : " and connected to this service"}.`);
    this.io.out(c.dim(`id: ${r.database.id}`));
  }

  async dbList() {
    const { link } = this.requireLink();
    const { databases } = await this.api.get(`/projects/${link.projectId}/databases`);
    if (!databases.length) this.io.out(c.dim("No databases"));
    for (const d of databases) this.io.out(`${d.name.padEnd(20)} ${d.engine.padEnd(10)} ${d.version ?? ""} ${d.status}`);
  }

  async open() {
    const { link } = this.requireLink();
    const url = await this.liveUrl(link.serviceId, link.environmentId);
    if (!url) throw new CliError("The service has no public URL yet");
    this.io.out(url);
    this.io.openUrl(url);
  }

  async projects() {
    this.requireAuth();
    if (!this.cfg.teamId) throw new CliError("Your API key is not bound to a team. Run `skyhost login` again.");
    const { projects } = await this.api.get(`/teams/${this.cfg.teamId}/projects`);
    for (const p of projects) this.io.out(`${p.name.padEnd(28)} ${p.services.length} service(s) · ${p.databases.length} database(s)`);
  }
}
