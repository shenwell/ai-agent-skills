# Goal Mode install - copy pipeline into target project
# Usage: .\install.ps1
#        .\install.ps1 -Target D:\projects\my-app

param(
    [string]$Target = (Get-Location).Path
)

$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "Goal Mode Pipeline installer" -ForegroundColor Cyan
Write-Host "Source: $Source"
Write-Host "Target: $Target"

$items = @(
    @{ Src = ".cursor"; Dst = ".cursor" },
    @{ Src = "templates"; Dst = "templates" }
)

foreach ($item in $items) {
    $srcPath = Join-Path $Source $item.Src
    $dstPath = Join-Path $Target $item.Dst

    if (-not (Test-Path $srcPath)) {
        Write-Warning "Skip missing: $srcPath"
        continue
    }

    if (Test-Path $dstPath) {
        Write-Host "Merge: $($item.Dst) exists - copying goal-mode files only" -ForegroundColor Yellow
        if ($item.Src -eq ".cursor") {
            $gm = Join-Path $srcPath "skills\goal-mode"
            $gmDst = Join-Path $dstPath "skills\goal-mode"
            New-Item -ItemType Directory -Force -Path $gmDst | Out-Null
            Copy-Item -Path (Join-Path $gm "*") -Destination $gmDst -Recurse -Force

            $hooksJson = Join-Path $srcPath "hooks.json"
            if (Test-Path $hooksJson) {
                Copy-Item $hooksJson (Join-Path $dstPath "hooks.json") -Force
            }

            foreach ($subName in @("hooks", "commands", "agents")) {
                $sub = Join-Path $srcPath $subName
                $subDst = Join-Path $dstPath $subName
                if (Test-Path $sub) {
                    New-Item -ItemType Directory -Force -Path $subDst | Out-Null
                    Copy-Item -Path (Join-Path $sub "*") -Destination $subDst -Recurse -Force
                }
            }
        }
    } else {
        Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force
        Write-Host "Copied: $($item.Dst)" -ForegroundColor Green
    }
}

$goalsDir = Join-Path $Target "goals"
if (-not (Test-Path $goalsDir)) {
    New-Item -ItemType Directory -Path $goalsDir | Out-Null
    "# Active goals - one folder per goal with GOAL.md" | Out-File (Join-Path $goalsDir ".gitkeep") -Encoding utf8
    Write-Host "Created: goals/" -ForegroundColor Green
}

$readme = Join-Path $Target "GOAL-MODE.md"
if (-not (Test-Path $readme)) {
    Copy-Item (Join-Path $Source "README.md") $readme
    Write-Host "Created: GOAL-MODE.md (quick reference)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host '  1. Edit .cursor/goal.config.yml - verify commands + execution.mode'
Write-Host '  2. In Cursor: /goal new <your objective>'
Write-Host '  3. /goal plan <id> then /goal run <id>'
Write-Host '  4. Long runs: see .cursor/skills/goal-mode/references/cloud-agent-setup.md'

$cfgPath = Join-Path $Target ".cursor\goal.config.yml"
if (Test-Path $cfgPath) {
    $cfg = Get-Content $cfgPath -Raw
    $changed = $false

    if ($cfg -notmatch 'execution:\s*\r?\n') {
        $execLines = "`nexecution:`n  mode: run_until_complete`n  max_steps_per_session: 10`n  stop_on: [COMPLETE, BLOCKED, FAILED, PAUSED]"
        if ($cfg -match '(?m)^hooks:') {
            $cfg = $cfg -replace '(?m)^hooks:', ($execLines + "`n`nhooks:")
        } else {
            $cfg = $cfg.TrimEnd() + $execLines + "`n"
        }
        $changed = $true
        Write-Host 'Merged execution block into goal.config.yml' -ForegroundColor Green
    }

    if ($cfg -notmatch 'max_continue_loops:') {
        if ($cfg -match '(?m)^hooks:\s*\r?\n') {
            $nl = [Environment]::NewLine
            $cfg = [regex]::Replace($cfg, '(?m)^(hooks:\s*\r?\n(?:  .+\r?\n)*)', '${1}  max_continue_loops: 50' + $nl)
            $changed = $true
            Write-Host 'Added hooks.max_continue_loops to goal.config.yml' -ForegroundColor Green
        }
    }

    if ($cfg -notmatch 'memory:\s*\r?\n') {
        $memBlock = @"

memory:
  skill: memo-session-skill
  checkpoints:
    enabled: true
    on_phase_complete: full
    on_blocked: full
    on_complete: full
    on_session_limit: light
    every_n_iterations: 10
  wiki:
    per_goal_page: true
"@
        if ($cfg -match '(?m)^cloud_agent:') {
            $cfg = $cfg -replace '(?m)^cloud_agent:', ($memBlock + "`n`ncloud_agent:")
        } else {
            $cfg = $cfg.TrimEnd() + $memBlock + "`n"
        }
        $changed = $true
        Write-Host 'Merged memory block into goal.config.yml' -ForegroundColor Green
    }

    if ($changed) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($cfgPath, $cfg, $utf8NoBom)
    }

    $hooksPath = Join-Path $Target ".cursor\hooks.json"
    if (Test-Path $hooksPath) {
        $hooks = Get-Content $hooksPath -Raw | ConvertFrom-Json
        $loopLimit = $hooks.hooks.stop[0].loop_limit
        $maxIter = 50
        $maxHours = 8
        if ($cfg -match 'max_iterations:\s*(\d+)') {
            $maxIter = [int]$Matches[1]
        }
        if ($cfg -match 'max_hours:\s*(\d+)') {
            $maxHours = [int]$Matches[1]
        }
        $recommended = [Math]::Max($maxIter, [Math]::Ceiling($maxHours * 4), 72)
        if ($loopLimit -lt $recommended) {
            $msg = 'hooks.json loop_limit ({0}) < recommended ({1}) for {2}h budget. Raising loop_limit.' -f $loopLimit, $recommended, $maxHours
            Write-Warning $msg
            $hooks.hooks.stop[0].loop_limit = $recommended
            $hooks | ConvertTo-Json -Depth 10 | Set-Content $hooksPath -Encoding utf8
            Write-Host "Updated hooks.json loop_limit to $recommended" -ForegroundColor Green
        }
    }
}
