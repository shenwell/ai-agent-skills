# Install Goal Mode as a GLOBAL Cursor skill (available in every project)
# Usage:
#   .\install-global.ps1
#   .\install-global.ps1 -Force
#
# Prefers public package: skills/goal-mode/
# Fallback:              .cursor/skills/goal-mode/
#
# Installs to:
#   ~/.cursor/skills/goal-mode/
#   ~/.cursor/agents/goal-*.md
#   ~/.cursor/commands/goal.md

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$UserCursor = Join-Path $env:USERPROFILE ".cursor"

$skillSrcPublic = Join-Path $Source "skills\goal-mode"
$skillSrcCursor = Join-Path $Source ".cursor\skills\goal-mode"
$skillSrc = if (Test-Path (Join-Path $skillSrcPublic "SKILL.md")) { $skillSrcPublic } else { $skillSrcCursor }

$agentsSrc = if (Test-Path (Join-Path $skillSrc "agents")) {
    Join-Path $skillSrc "agents"
} else {
    Join-Path $Source ".cursor\agents"
}

$cmdSrc = if (Test-Path (Join-Path $skillSrc "commands\goal.md")) {
    Join-Path $skillSrc "commands\goal.md"
} else {
    Join-Path $Source ".cursor\commands\goal.md"
}

if (-not (Test-Path (Join-Path $skillSrc "SKILL.md"))) {
    Write-Error "Skill source not found. Expected skills\goal-mode or .cursor\skills\goal-mode"
}

$skillDst = Join-Path $UserCursor "skills\goal-mode"
$agentsDst = Join-Path $UserCursor "agents"
$cmdDst = Join-Path $UserCursor "commands\goal.md"

Write-Host "Goal Mode - global install" -ForegroundColor Cyan
Write-Host "Source skill: $skillSrc"
Write-Host "Target: $UserCursor"

if ((Test-Path $skillDst) -and -not $Force) {
    Write-Host "Updating existing global skill (overwrite)" -ForegroundColor Yellow
}
New-Item -ItemType Directory -Force -Path $skillDst | Out-Null
Copy-Item -Path (Join-Path $skillSrc "*") -Destination $skillDst -Recurse -Force
Write-Host "Installed: ~/.cursor/skills/goal-mode" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path $agentsDst | Out-Null
$agentCount = 0
Get-ChildItem $agentsSrc -Filter "goal-*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $agentsDst $_.Name) -Force
    $agentCount++
}
Write-Host "Installed: $agentCount agents -> ~/.cursor/agents/goal-*.md" -ForegroundColor Green

New-Item -ItemType Directory -Force -Path (Split-Path $cmdDst) | Out-Null
Copy-Item $cmdSrc $cmdDst -Force
Write-Host "Installed: ~/.cursor/commands/goal.md  ->  /goal" -ForegroundColor Green

$boot = Join-Path $skillDst "scripts\goal-bootstrap.js"
if (-not (Test-Path $boot)) {
    Write-Warning "goal-bootstrap.js missing after install"
} else {
    Write-Host "Bootstrap script OK: $boot" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. In any project:" -ForegroundColor Cyan
Write-Host '  1. Open Cursor chat and run /goal <your objective>'
Write-Host '  2. First run bootstraps hooks + config into the project'
Write-Host '  3. Manual: node $env:USERPROFILE\.cursor\skills\goal-mode\scripts\goal-bootstrap.js'
Write-Host ""
Write-Host "Public install via skills.sh:"
Write-Host '  npx skills add shenwell/skills --skill goal-mode -g'
Write-Host ""
Write-Host "Reinstall: .\install-global.ps1 -Force"
