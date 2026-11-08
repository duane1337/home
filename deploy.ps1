$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$config = Get-Content "tgcloud/lib/config.js" -Raw
if ($config -match "OWNER_TELEGRAM_ID = 0" -or $config -match "REPLACE_WITH_YOUR_WORKER" -or $config -match "CONFIGURE_A_LONG_RANDOM") {
  throw "Configure OWNER_TELEGRAM_ID, RELAY_URL and RELAY_SECRET in tgcloud/lib/config.js before deployment."
}

Write-Host "Installing project dependencies..."
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "Building Mini App..."
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed. Nothing was deployed." }

Write-Host "Checking Telegram Serverless changes..."
npx tgcloud status
if ($LASTEXITCODE -ne 0) { throw "tgcloud status failed" }
npx tgcloud diff
if ($LASTEXITCODE -ne 0) { throw "tgcloud diff failed" }

$confirm = Read-Host "Build passed. Deploy code and Mini App now? (yes/no)"
if ($confirm -ne "yes") { Write-Host "Stopped before deployment."; exit 0 }

npx tgcloud push
if ($LASTEXITCODE -ne 0) { throw "tgcloud push failed" }

Write-Host "Applying reviewed database migrations..."
npx tgcloud migrate
if ($LASTEXITCODE -ne 0) { throw "Database migration failed" }

Write-Host "Deployment commands completed. Configure the printed Mini App URL in @BotFather, then smoke-test from Telegram."
