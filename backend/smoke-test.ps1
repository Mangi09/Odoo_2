# EcoSphere Backend Smoke Test Script
# Runs on Windows PowerShell

Write-Host "1. Seeding MongoDB database..." -ForegroundColor Cyan
node seed.js

Write-Host "2. Starting BE1 (Environmental + Social) on Port 3001..." -ForegroundColor Cyan
$be1 = Start-Process node -ArgumentList "be1/index.js" -NoNewWindow -PassThru -WorkingDirectory "."

Write-Host "3. Starting BE2 (Governance + Gamification + Reports) on Port 3002..." -ForegroundColor Cyan
$be2 = Start-Process node -ArgumentList "be2/index.js" -NoNewWindow -PassThru -WorkingDirectory "."

Write-Host "Waiting 3 seconds for servers to spin up..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    Write-Host "`n========================================================" -ForegroundColor Magenta
    Write-Host "RUNNING SMOKE TESTS" -ForegroundColor Magenta
    Write-Host "========================================================`n" -ForegroundColor Magenta

    # --- BE1 Tests ---

    Write-Host "[BE1] GET /api/environmental/transactions (Initial list)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/transactions" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/environmental/transactions (Logging Flight Travel)" -ForegroundColor Green
    $body = @{
        quantity = 120
        activity_type = 'flight'
        emission_factor_id = '64a7c2000000000000000001'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/transactions" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/environmental/auto-calculate (Electricity auto factor)" -ForegroundColor Green
    $body = @{
        quantity = 10
        activity_type = 'electricity'
        source_module = 'facility'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/auto-calculate" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] GET /api/environmental/goals" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/goals" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/social/activities (Category validation)" -ForegroundColor Green
    $body = @{
        title = "E-Waste recycling drive"
        description = "Bring old laptops and phones"
        category = "CSR_ACTIVITY"
        points = 30
        xp = 50
        difficulty = "easy"
        proof_required = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/activities" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/social/activities/:id/participate (Join Tree Planting)" -ForegroundColor Green
    $body = @{
        proof_url = "http://example.com/tree_planting_proof.png"
    } | ConvertTo-Json
    $part = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/activities/64a7c3000000000000000001/participate" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } -ContentType "application/json" -Body $body
    $part | ConvertTo-Json -Depth 5
    $participationId = $part.data._id

    Write-Host "`n[BE1] POST /api/social/participations/:id/approve (Transact points + badge check)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/participations/$participationId/approve" -Method Post | ConvertTo-Json -Depth 5

    # --- BE2 Tests ---

    Write-Host "`n[BE2] POST /api/governance/issues (Validation of overdue)" -ForegroundColor Green
    $body = @{
        title = "Fix water pipe leakage"
        owner_id = "64a7c1000000000000000001"
        due_date = "2026-06-01T00:00:00.000Z" # past date
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/governance/issues" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] GET /api/governance/issues (Dynamic overdue check)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/governance/issues" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] PATCH /api/gamification/challenges/:id/status (Active transition)" -ForegroundColor Green
    $body = @{
        status = "active"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/64a7c5000000000000000001/status" -Method Patch -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/gamification/challenges/:id/participate" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/64a7c5000000000000000001/participate" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/gamification/challenges/:id/complete (1x multiplier for easy)" -ForegroundColor Green
    $body = @{
        proof_url = "http://example.com/cycling.jpg"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/64a7c5000000000000000001/complete" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] GET /api/gamification/leaderboard?scope=org" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/leaderboard?scope=org" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/gamification/rewards/:id/redeem (Atomic points verification)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/rewards/64a7c6000000000000000001/redeem" -Method Post -Headers @{ "x-employee-id" = "64a7c1000000000000000001" } | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/scores/recompute" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/scores/recompute" -Method Post | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] GET /api/reports/esg-summary" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/reports/esg-summary" -Method Get | ConvertTo-Json -Depth 5

} finally {
    Write-Host "`nCleaning up backend server processes..." -ForegroundColor Yellow
    Stop-Process -Id $be1.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $be2.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Servers terminated. Test finished." -ForegroundColor Yellow
}
