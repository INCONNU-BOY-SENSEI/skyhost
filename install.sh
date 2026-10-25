#!/bin/sh
set -eu

REPO="INCONNU-BOY-SENSEI/skyhost"
REF="${SKYHOST_VERSION:-main}"
DIR="${SKYHOST_INSTALL_DIR:-$HOME/.skyhost/bin}"
URL="https://raw.githubusercontent.com/$REPO/$REF/cli/dist/skyhost.js"

orange() { printf '\033[38;2;217;96;64m%s\033[0m\n' "$1"; }
fail() { printf '\033[31mError:\033[0m %s\n' "$1" >&2; exit 1; }

orange "SKYHOST CLI installer"

command -v node >/dev/null 2>&1 || fail "Node.js 18 or newer is required. Install it from https://nodejs.org and run this again."
NODE_MAJOR=$(node -p 'process.versions.node.split(".")[0]')
[ "$NODE_MAJOR" -ge 18 ] || fail "Node.js 18 or newer is required (found $(node -v))."

mkdir -p "$DIR"
TMP="$DIR/.skyhost.download"
if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$URL" -o "$TMP" || fail "Download failed: $URL"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$TMP" "$URL" || fail "Download failed: $URL"
else
  fail "curl or wget is required."
fi
head -n 1 "$TMP" | grep -q "node" || { rm -f "$TMP"; fail "The downloaded file is not the SKYHOST CLI."; }
mv "$TMP" "$DIR/skyhost"
chmod +x "$DIR/skyhost"

VERSION=$("$DIR/skyhost" --version 2>/dev/null || echo "?")
printf '\033[32m✓\033[0m Installed skyhost %s to %s\n' "$VERSION" "$DIR/skyhost"

case ":$PATH:" in
  *":$DIR:"*) ;;
  *)
    LINE="export PATH=\"$DIR:\$PATH\""
    for RC in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
      if [ -f "$RC" ] && ! grep -qs "$DIR" "$RC"; then printf '\n# SKYHOST CLI\n%s\n' "$LINE" >> "$RC"; fi
    done
    echo "Added $DIR to your PATH. Open a new terminal, or run:"
    echo "  $LINE"
    ;;
esac

echo
echo "Next steps:"
echo "  skyhost login      # approve this device in your browser"
echo "  skyhost init       # deploy the current folder"
echo
echo "Docs: https://github.com/$REPO · Dashboard: https://skyhost.tech"
