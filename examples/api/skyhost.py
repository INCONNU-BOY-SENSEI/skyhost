import json
import os
import urllib.error
import urllib.request

API = os.environ.get("SKYHOST_API_URL", "https://skyhost.tech") + "/api/v1"


def skyhost(method, path, body=None):
    req = urllib.request.Request(API + path, method=method)
    req.add_header("Authorization", "Bearer " + os.environ["SKYHOST_TOKEN"])
    data = None
    if body is not None:
        data = json.dumps(body).encode()
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, data) as res:
            raw = res.read()
            return json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        err = json.loads(e.read() or b"{}").get("error", {})
        raise RuntimeError(f"{e.code} {err.get('code')}: {err.get('message')}") from None


if __name__ == "__main__":
    for team in skyhost("GET", "/teams")["teams"]:
        for project in skyhost("GET", f"/teams/{team['id']}/projects")["projects"]:
            detail = skyhost("GET", f"/projects/{project['id']}")
            for service in detail["services"]:
                deps = skyhost("GET", f"/services/{service['id']}/deployments?limit=3")["deployments"]
                for d in deps:
                    print(f"{project['name']}/{service['name']}  {d['status']:<11} {d['createdAt']}")
