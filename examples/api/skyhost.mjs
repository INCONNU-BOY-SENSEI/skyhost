const API = `${process.env.SKYHOST_API_URL ?? "https://skyhost.tech"}/api/v1`;

export async function skyhost(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${process.env.SKYHOST_TOKEN}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data?.error?.code}: ${data?.error?.message}`);
  return data;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { teams } = await skyhost("GET", "/teams");
  for (const team of teams) {
    const { projects } = await skyhost("GET", `/teams/${team.id}/projects`);
    for (const p of projects) {
      const detail = await skyhost("GET", `/projects/${p.id}`);
      for (const s of detail.services) {
        for (const i of s.instances) console.log(`${team.name} / ${p.name} / ${s.name}: ${i.status} ${i.url ?? ""}`);
      }
    }
  }
}
