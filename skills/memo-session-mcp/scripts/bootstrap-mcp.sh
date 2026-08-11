#!/usr/bin/env bash
# Bootstrap memo-session-mcp for Cursor (Linux/macOS)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MCP_DIR="$REPO_ROOT/skills/memo-session-mcp"
GLOBAL_MEMORY="${GLOBAL_MEMORY_ROOT:-$HOME/global-memory}"
INDEX_DIR="${MEMO_SESSION_MCP_INDEX_DIR:-$HOME/.local/share/memo-session-mcp}"
CONFIG_DIR="$HOME/.config/memo-session-mcp"

echo "Installing memo-session-mcp from $MCP_DIR"
pip install -e "$MCP_DIR"

mkdir -p "$CONFIG_DIR"
if [[ ! -f "$CONFIG_DIR/config.yaml" ]]; then
  sed "s|~/global-memory|$GLOBAL_MEMORY|g" "$MCP_DIR/config.example.yaml" > "$CONFIG_DIR/config.yaml"
  echo "Wrote $CONFIG_DIR/config.yaml"
fi

export GLOBAL_MEMORY_ROOT="$GLOBAL_MEMORY"
export MEMO_SESSION_MCP_INDEX_DIR="$INDEX_DIR"
memo-session-index reindex

echo ""
echo "Add to ~/.cursor/mcp.json:"
cat <<EOF
{
  "memo-session-mcp": {
    "command": "memo-session-mcp",
    "env": {
      "GLOBAL_MEMORY_ROOT": "$GLOBAL_MEMORY",
      "MEMO_SESSION_MCP_INDEX_DIR": "$INDEX_DIR"
    }
  }
}
EOF
