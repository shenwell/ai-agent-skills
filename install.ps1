# Install Goal Mode into a target project via bootstrap (from skills/goal-mode).
# Usage: .\install.ps1
#        .\install.ps1 -Target D:\projects\my-app

param(
    [string]$Target = (Get-Location).Path,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$boot = Join-Path $Source "skills\goal-mode\scripts\goal-bootstrap.js"

if (-not (Test-Path $boot)) {
    Write-Error "Missing $boot — clone https://github.com/shenwell/skills and retry."
}

Write-Host "Goal Mode — project install" -ForegroundColor Cyan
Write-Host "Source: $Source"
Write-Host "Target: $Target"

$args = @($boot, $Target, "--json")
if ($Force) { $args += "--force" }

node @args
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1. Edit .cursor/goal.config.yml (verify commands)"
Write-Host "  2. In Cursor: /goal <your objective>"
Write-Host "  Or: npx skills add shenwell/skills --skill goal-mode -g"
