#!/bin/sh
set -eu
API="${SKYHOST_API_URL:-https://skyhost.tech}/api/v1"
AUTH="Authorization: Bearer $SKYHOST_TOKEN"

DEPLOYMENT=$(curl -fsS -X POST -H "$AUTH" -H "Content-Type: application/json" \
  -d "{\"environmentId\":\"$ENVIRONMENT_ID\"}" "$API/services/$SERVICE_ID/deploy" | sed -E 's/.*"deployment":\{"id":"([^"]+)".*/\1/')
echo "Deployment $DEPLOYMENT queued"

while :; do
  STATUS=$(curl -fsS -H "$AUTH" "$API/deployments/$DEPLOYMENT" | sed -E 's/.*"status":"([a-z_]+)".*/\1/')
  echo "  status: $STATUS"
  case "$STATUS" in
    live) echo "✓ Live"; exit 0 ;;
    failed|cancelled) curl -fsS -H "$AUTH" "$API/deployments/$DEPLOYMENT/diagnosis"; echo; exit 1 ;;
  esac
  sleep 3
done
