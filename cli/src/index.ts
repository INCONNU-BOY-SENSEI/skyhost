import { parseArgs } from "node:util";
import { CliError } from "./api";
import { c, Commands } from "./commands";
import { VERSION } from "./version";

const HELP = `SKYHOST CLI ${VERSION}

Usage: skyhost <command> [options]

Account
  login [--token KEY] [--no-browser]                    Sign in (browser device flow, or an API key)
  logout                                                Forget the local credentials
  whoami                                                Show the current user and team

Project
  projects                       List the projects of your team
  init [--name N] [--type web]   Create a project from this directory and deploy it
  link [--project P] [--service S] [--environment E]   Link this directory to a service
  unlink                         Remove the link
  status                         Show services, status and URLs

Deploy
  deploy [--detach]              Upload this directory and deploy it, streaming the logs
  redeploy                       Redeploy the live version (e.g. after changing variables)
  deployments                    List recent deployments
  rollback [DEPLOYMENT_ID]       Roll back to the previous (or given) version
  logs [-f] [--deployment ID] [--tail N]   Runtime logs, or the logs of one deployment
  open                           Open the live URL

Variables
  env list [--reveal]            List variables of the linked service
  env set KEY=value… [--secret]  Create or update variables
  env unset KEY…                 Remove variables

Databases
  db list                        List databases of the project
  db create ENGINE [NAME] [--no-connect]   Create postgres, mariadb, mongodb or redis

Other
  shell [-c COMMAND]             Secure shell inside the service container
  help, --help                   Show this help
  --version                      Show the version

Environment: SKYHOST_TOKEN (API key, for CI), SKYHOST_TEAM_ID, SKYHOST_API_URL (default https://skyhost.tech), NO_COLOR

Docs: https://github.com/INCONNU-BOY-SENSEI/skyhost · Dashboard: https://skyhost.tech`;

export async function main(argv: string[]) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      "api-url": { type: "string" },
      token: { type: "string" },
      "no-browser": { type: "boolean" },
      project: { type: "string" },
      service: { type: "string" },
      environment: { type: "string" },
      name: { type: "string" },
      type: { type: "string" },
      detach: { type: "boolean" },
      follow: { type: "boolean", short: "f" },
      deployment: { type: "string" },
      tail: { type: "string" },
      reveal: { type: "boolean" },
      secret: { type: "boolean" },
      "no-connect": { type: "boolean" },
      command: { type: "string", short: "c" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });
  const [cmd, sub, ...rest] = positionals;
  if (values.version) return console.log(VERSION);
  if (values.help || !cmd || cmd === "help") return console.log(HELP);
  const k = new Commands();
  switch (cmd) {
    case "login": return k.login({ apiUrl: values["api-url"], token: values.token, noBrowser: values["no-browser"] });
    case "logout": return k.logout();
    case "whoami": return k.whoami();
    case "projects": return k.projects();
    case "init": return k.init({ name: values.name, type: values.type, detach: values.detach });
    case "link": return k.link({ project: values.project, service: values.service, environment: values.environment });
    case "unlink": return k.unlink();
    case "status": return k.status();
    case "deploy":
    case "up": return k.deploy({ detach: values.detach });
    case "redeploy": return k.redeploy();
    case "deployments": return k.deployments();
    case "rollback": return k.rollback(sub);
    case "logs": return k.logs({ follow: values.follow, deployment: values.deployment, tail: values.tail ? Number(values.tail) : undefined });
    case "open": return k.open();
    case "shell": return k.shell(values.command);
    case "env":
      if (sub === "list" || !sub) return k.envList({ reveal: values.reveal });
      if (sub === "set") return k.envSet(rest, { secret: values.secret });
      if (sub === "unset") return k.envUnset(rest);
      throw new CliError(`Unknown env command "${sub}"`);
    case "db":
      if (sub === "list" || !sub) return k.dbList();
      if (sub === "create") {
        if (!rest[0]) throw new CliError("Usage: skyhost db create ENGINE [NAME]");
        return k.dbCreate(rest[0], rest[1], { connect: !values["no-connect"] });
      }
      throw new CliError(`Unknown db command "${sub}"`);
    default:
      throw new CliError(`Unknown command "${cmd}". Run \`skyhost help\`.`);
  }
}

const isEntry = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("skyhost.js") || process.argv[1]?.endsWith("skyhost");
if (isEntry) {
  main(process.argv.slice(2)).catch((e) => {
    if (e instanceof CliError) {
      if (e.message) console.error(c.red(`Error: ${e.message}`));
      process.exit(e.exitCode);
    }
    if ((e as { code?: string }).code?.startsWith("ERR_PARSE_ARGS")) {
      console.error(c.red((e as Error).message));
      process.exit(2);
    }
    console.error(e);
    process.exit(1);
  });
}
