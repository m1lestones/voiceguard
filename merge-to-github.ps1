# Run this in PowerShell from c:\VoiceGuard (outside Cursor) to merge and push to GitHub.
# Requires: Git installed, GitHub auth (HTTPS token or SSH key)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# If no .git, init and set remote
if (-not (Test-Path .git)) {
  git init
  git branch -M main
  git remote add origin https://github.com/m1lestones/voiceguard.git
} else {
  Remove-Item .git\index.lock -ErrorAction SilentlyContinue
  Remove-Item .git\config.lock -ErrorAction SilentlyContinue
  git remote remove origin 2>$null
  git remote add origin https://github.com/m1lestones/voiceguard.git
}

# Stage and commit
git add .
git commit -m "Add VoiceGuard app: enrollment, voice analysis, security challenge"

# Fetch and merge with GitHub (allow unrelated histories if repo had initial commit)
# Merge is skipped if remote is empty; push will create main on GitHub.
git fetch origin 2>$null
git merge origin/main --allow-unrelated-histories -m "Merge with GitHub voiceguard repo" 2>$null

# Push to GitHub
git branch -M main
git push -u origin main

Write-Host "Done. View at: https://github.com/m1lestones/voiceguard"
