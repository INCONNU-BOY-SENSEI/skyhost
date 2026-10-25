import WebSocket from "ws";
import type { GlobalConfig } from "./config";
import { VERSION } from "./version";

export class CliError extends Error {
  constructor(message: string, public exitCode = 1) {
    super(message);
  }
}

export class Api {
  constructor(private cfg: GlobalConfig) {}

  get base() {
    if (!this.cfg.apiUrl) throw new CliError("No API URL configured. Run `skyhost login` or set SKYHOST_API_URL.");
    return this.cfg.apiUrl.replace(/\/+$/, "");
  }

  private headers(extra: Record<string, string> = {}) {
    return { ...(this.cfg.apiKey ? { Authorization: `Bearer ${this.cfg.apiKey}` } : {}), "User-Agent": `skyhost-cli/${VERSION}`, ...extra };
  }

  async request<T = any>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.base}/api/v1${path}`, {
        method,
        headers: this.headers(body !== undefined ? { "Content-Type": "application/json" } : {}),
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new CliError(`Cannot reach ${this.base}: ${(e as Error).message}`);
    }
    return this.parse<T>(res);
  }

  get = <T = any>(p: string) => this.request<T>("GET", p);
  post = <T = any>(p: string, b: unknown = {}) => this.request<T>("POST", p, b);
  put = <T = any>(p: string, b: unknown = {}) => this.request<T>("PUT", p, b);
  del = <T = any>(p: string) => this.request<T>("DELETE", p);

  async upload<T = any>(path: string, file: Buffer, filename: string): Promise<T> {
    const form = new FormData();
    form.append("file", new Blob([new Uint8Array(file)], { type: "application/zip" }), filename);
    const res = await fetch(`${this.base}/api/v1${path}`, { method: "POST", headers: this.headers(), body: form });
    return this.parse<T>(res);
  }

  private async parse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const err = (data as { error?: { message?: string } } | null)?.error;
      if (res.status === 401) throw new CliError("Not authenticated (or the API key was revoked). Run `skyhost login`.");
      throw new CliError(err?.message ?? `Request failed with status ${res.status}`);
    }
    return data as T;
  }

  websocket(path: string) {
    const url = `${this.base.replace(/^http/, "ws")}/api/v1${path}`;
    return new WebSocket(url, { headers: this.headers() });
  }
}
