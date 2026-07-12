# EcoSphere Backend Smoke Test Script
# Runs on Windows PowerShell with Official Schema mappings

Write-Host "1. Seeding MongoDB database with official schema..." -ForegroundColor Cyan
node seed.js

Write-Host "2. Starting BE1 (Environmental + Social) on Port 3001..." -ForegroundColor Cyan
$be1 = Start-Process node -ArgumentList "be1/index.js" -NoNewWindow -PassThru -WorkingDirectory "."

Write-Host "3. Starting BE2 (Governance + Gamification + Reports) on Port 3002..." -ForegroundColor Cyan
$be2 = Start-Process node -ArgumentList "be2/index.js" -NoNewWindow -PassThru -WorkingDirectory "."

Write-Host "Waiting 3 seconds for servers to spin up..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    Write-Host "`n========================================================" -ForegroundColor Magenta
    Write-Host "RUNNING OFFICIAL SCHEMA SMOKE TESTS" -ForegroundColor Magenta
    Write-Host "========================================================`n" -ForegroundColor Magenta

    # --- BE1 Tests ---

    Write-Host "[BE1] GET /api/environmental/transactions (Initial list)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/transactions" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/environmental/transactions (Logging Fleet Travel)" -ForegroundColor Green
    $body = @{
        quantity = 120
        activity_type = 'Fleet'
        emission_factor_id = 'ef-fleet'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/transactions" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/environmental/auto-calculate (Manufacturing auto factor)" -ForegroundColor Green
    $body = @{
        quantity = 400
        source_type = 'Manufacturing'
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/auto-calculate" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] GET /api/environmental/goals" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/environmental/goals" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/social/activities (Category validation)" -ForegroundColor Green
    $body = @{
        title = "E-Waste recycling drive"
        description = "Collect old hardware"
        category_id = "cat-env"
        points = 30
        evidence_required = $true
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/activities" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE1] POST /api/social/activities/:id/participate (Join Tree Plantation)" -ForegroundColor Green
    $body = @{
        proof_url = "http://example.com/tree_planting_proof.png"
    } | ConvertTo-Json
    $part = Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/activities/csr-tree/participate" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } -ContentType "application/json" -Body $body
    $part | ConvertTo-Json -Depth 5
    $participationId = $part.data._id

    Write-Host "`n[BE1] POST /api/social/participations/:id/approve (Transact points + badge check)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3001/api/social/participations/$participationId/approve" -Method Post | ConvertTo-Json -Depth 5

    # --- BE2 Tests ---

    Write-Host "`n[BE2] POST /api/governance/issues (Validation of overdue)" -ForegroundColor Green
    $body = @{
        title = "Fix warehouse insulation"
        owner_user_id = "u-riyer"
        due_date = "2026-06-01T00:00:00.000Z" # past date
        department_id = "dept-log"
        severity = "High"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/governance/issues" -Method Post -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] GET /api/governance/issues (Dynamic overdue check)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/governance/issues" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] PATCH /api/gamification/challenges/:id/status (Transition ACTIVE -> UNDER_REVIEW)" -ForegroundColor Green
    $body = @{
        status = "UNDER_REVIEW"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/ch-sprint/status" -Method Patch -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    # Revert to active for participation/completion testing
    $body = @{
        status = "active"
    } | ConvertTo-Json
    # For testing participation, it must be ACTIVE. Wait, VALID_TRANSITIONS maps ch-sprint to UNDER_REVIEW, then complete can be run.
    # Let's use challenge "ch-recycle" which is already active for participation & completion!
    
    Write-Host "`n[BE2] POST /api/gamification/challenges/ch-recycle/participate" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/ch-recycle/participate" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/gamification/challenges/ch-recycle/complete (1x multiplier for easy)" -ForegroundColor Green
    $body = @{
        proof_url = "http://example.com/recycle.jpg"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/challenges/ch-recycle/complete" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] GET /api/gamification/leaderboard?scope=org" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/leaderboard?scope=org" -Method Get | ConvertTo-Json -Depth 5

    Write-Host "`n[BE2] POST /api/gamification/rewards/:id/redeem (Atomic points verification)" -ForegroundColor Green
    Invoke-RestMethod -Uri "http://127.0.0.1:3002/api/gamification/rewards/rw-kit/redeem" -Method Post -Headers @{ "x-employee-id" = "u-aditi" } | ConvertTo-Json -Depth 5

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
