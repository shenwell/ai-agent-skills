# Bootstrap memo-session-mcp for Cursor (Windows PowerShell)
$ErrorActionPreference = "Stop"

$McpDir = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "skills\memo-session-mcp"
if (-not (Test-Path $McpDir)) {
    throw "Cannot find memo-session-mcp at $McpDir. Run this script from the ai-agent-skills repo."
}

$GlobalMemory = if ($env:GLOBAL_MEMORY_ROOT) {
    $env:GLOBAL_MEMORY_ROOT
} else {
    Join-Path $env:USERPROFILE "portfolio-memory"
}
$IndexDir = if ($env:MEMO_SESSION_MCP_INDEX_DIR) { $env:MEMO_SESSION_MCP_INDEX_DIR } else { "$env:USERPROFILE\.local\share\memo-session-mcp" }
$ConfigDir = Join-Path $env:USERPROFILE ".config\memo-session-mcp"

Write-Host "MCP package: $McpDir"
Write-Host "Portfolio root: $GlobalMemory"
Write-Host "Using uv run (recommended) or: pip install -e `"$McpDir`""

New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null
$ConfigPath = Join-Path $ConfigDir "config.yaml"
if (-not (Test-Path $ConfigPath)) {
    @"
global_memory_root: $($GlobalMemory -replace '\\','/')
index_dir: $($IndexDir -replace '\\','/')
index_project_memories: true
"@ | Set-Content -Path $ConfigPath -Encoding utf8
    Write-Host "Wrote $ConfigPath"
}

$env:GLOBAL_MEMORY_ROOT = $GlobalMemory
$env:MEMO_SESSION_MCP_INDEX_DIR = $IndexDir
uv run --directory $McpDir memo-session-index reindex

Write-Host ""
Write-Host "Add to $env:USERPROFILE\.cursor\mcp.json:"
@"

  "memo-session-mcp": {
    "type": "stdio",
    "command": "uv",
    "args": ["run", "--directory", "$($McpDir -replace '\\','\\')", "memo-session-mcp"],
    "env": {
      "GLOBAL_MEMORY_ROOT": "$($GlobalMemory -replace '\\','\\')",
      "MEMO_SESSION_MCP_INDEX_DIR": "$($IndexDir -replace '\\','\\')"
    }
  }
"@
