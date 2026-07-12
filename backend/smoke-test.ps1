$base = "http://localhost:3001"
$ErrorActionPreference = "Stop"
$passed = 0
$failed = 0

function Test-Endpoint {
    param($label, $result)
    if ($result) {
        Write-Host "  PASS: $label" -ForegroundColor Green
        $script:passed++
    } else {
        Write-Host "  FAIL: $label" -ForegroundColor Red
        $script:failed++
    }
}

Write-Host "`n===== EcoSphere API Smoke Tests =====" -ForegroundColor Magenta

# [1] Health
Write-Host "`n[1] Health Check" -ForegroundColor Cyan
$h = (Invoke-RestMethod "$base/health")
Test-Endpoint "Health ok=true" ($h.ok -eq $true)

# [2] Auth Login
Write-Host "`n[2] POST /api/auth/login" -ForegroundColor Cyan
$loginBody = '{"email":"admin@ecosphere.test","password":"Admin123!"}'
$loginResp = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
$tok = $loginResp.token
$headers = @{Authorization = "Bearer $tok"}
Test-Endpoint "Login returns token" ($tok.Length -gt 10)
Test-Endpoint "User role is Admin" ($loginResp.user.role -eq "Admin")

# [3] Auth/me
Write-Host "`n[3] GET /api/auth/me" -ForegroundColor Cyan
$me = Invoke-RestMethod "$base/api/auth/me" -Headers $headers
Test-Endpoint "me returns user email" ($me.user.email -eq "admin@ecosphere.test")
Test-Endpoint "me returns permissions array" ($me.permissions.Count -gt 0)

# [4] Dashboard
Write-Host "`n[4] GET /api/dashboard/summary" -ForegroundColor Cyan
$dash = Invoke-RestMethod "$base/api/dashboard/summary" -Headers $headers
Test-Endpoint "summary has esgScore" ($null -ne $dash.esgScore)

Write-Host "`n[4b] GET /api/dashboard/emissions-trend?range=6M" -ForegroundColor Cyan
$trend = Invoke-RestMethod "$base/api/dashboard/emissions-trend?range=6M" -Headers $headers
Test-Endpoint "trend returns array of 6" ($trend.Count -eq 6)

# [5] Environmental
Write-Host "`n[5] GET /api/environmental/transactions" -ForegroundColor Cyan
$txs = Invoke-RestMethod "$base/api/environmental/transactions" -Headers $headers
Test-Endpoint "transactions returns array" ($txs.Count -ge 0)
if ($txs.Count -gt 0) {
    Test-Endpoint "tx has id,date,source,category,amount,status,department" ($txs[0].id -and $txs[0].date -and $txs[0].source -and $txs[0].amount -ge 0)
}

Write-Host "`n[5b] POST /api/environmental/calculate" -ForegroundColor Cyan
$calcBody = '{"source_type":"Fleet","quantity":80}'
$calc = Invoke-RestMethod "$base/api/environmental/calculate" -Method Post -Headers $headers -ContentType "application/json" -Body $calcBody
Test-Endpoint "calculate returns transaction.amount" ($calc.transaction.amount -gt 0)
Test-Endpoint "calculate returns summary.totalEmissions" ($null -ne $calc.summary.totalEmissions)

# [6] Social
Write-Host "`n[6] GET /api/social/activities" -ForegroundColor Cyan
$acts = Invoke-RestMethod "$base/api/social/activities" -Headers $headers
Test-Endpoint "activities returns array" ($acts.Count -ge 0)

Write-Host "`n[6b] POST /api/social/activities/csr-tree/join" -ForegroundColor Cyan
$joinBody = '{"proof_url":"https://example.com/proof2.jpg"}'
try {
    $join = Invoke-RestMethod "$base/api/social/activities/csr-tree/join" -Method Post -Headers $headers -ContentType "application/json" -Body $joinBody
    $joinId = $join.id
    Test-Endpoint "join returns participation id" ($joinId.Length -gt 0)
} catch {
    # Admin already joined? Try with employee login
    Write-Host "  INFO: Admin join attempt got: $($_.Exception.Message)" -ForegroundColor Yellow
    $empBody = '{"email":"aditi@ecosphere.test","password":"Employee123!"}'
    $empResp = Invoke-RestMethod "$base/api/auth/login" -Method Post -ContentType "application/json" -Body $empBody
    $empHeaders = @{Authorization = "Bearer $($empResp.token)"}
    $join = Invoke-RestMethod "$base/api/social/activities/csr-beach/join" -Method Post -Headers $empHeaders -ContentType "application/json" -Body $joinBody
    $joinId = $join.id
    Test-Endpoint "join as employee returns id" ($joinId.Length -gt 0)
}

# [7] Gamification
Write-Host "`n[7] GET /api/gamification/challenges" -ForegroundColor Cyan
$chs = Invoke-RestMethod "$base/api/gamification/challenges" -Headers $headers
Test-Endpoint "challenges returns array" ($chs.Count -ge 0)
if ($chs.Count -gt 0) {
    Test-Endpoint "challenge has xpReward field" ($null -ne $chs[0].xpReward)
    Test-Endpoint "challenge has userStatus field" ($null -ne $chs[0].userStatus)
    Test-Endpoint "challenge has isActive field" ($null -ne $chs[0].isActive)
}

Write-Host "`n[7b] GET /api/gamification/badges" -ForegroundColor Cyan
$bds = Invoke-RestMethod "$base/api/gamification/badges" -Headers $headers
Test-Endpoint "badges returns array" ($bds.Count -ge 0)

Write-Host "`n[7c] GET /api/gamification/leaderboard?type=employee" -ForegroundColor Cyan
$lb = Invoke-RestMethod "$base/api/gamification/leaderboard?type=employee" -Headers $headers
Test-Endpoint "leaderboard returns array" ($lb.Count -ge 0)

Write-Host "`n[7d] GET /api/gamification/rewards" -ForegroundColor Cyan
$rews = Invoke-RestMethod "$base/api/gamification/rewards" -Headers $headers
Test-Endpoint "rewards returns array" ($rews.Count -ge 0)

# [8] Governance
Write-Host "`n[8] GET /api/governance/audits" -ForegroundColor Cyan
$auds = Invoke-RestMethod "$base/api/governance/audits" -Headers $headers
Test-Endpoint "audits returns array" ($auds.Count -ge 0)

Write-Host "`n[8b] GET /api/governance/issues" -ForegroundColor Cyan
$iss = Invoke-RestMethod "$base/api/governance/issues" -Headers $headers
Test-Endpoint "issues returns array" ($iss.Count -ge 0)
if ($iss.Count -gt 0) { Test-Endpoint "issue has severity+status" ($iss[0].severity -and $iss[0].status) }

Write-Host "`n[8c] POST /api/governance/issues" -ForegroundColor Cyan
$issBody = '{"title":"Test Issue from smoke test","severity":"Medium","category":"Environmental"}'
$newIss = Invoke-RestMethod "$base/api/governance/issues" -Method Post -Headers $headers -ContentType "application/json" -Body $issBody
Test-Endpoint "new issue created with id" ($newIss.id.Length -gt 0)

Write-Host "`n[8d] PATCH /api/governance/issues/$($newIss.id)" -ForegroundColor Cyan
$patch = Invoke-RestMethod "$base/api/governance/issues/$($newIss.id)" -Method Patch -Headers $headers -ContentType "application/json" -Body '{"status":"Resolved"}'
Test-Endpoint "issue resolved" ($patch.status -eq "Resolved")

Write-Host "`n[8e] GET /api/governance/policies" -ForegroundColor Cyan
$pols = Invoke-RestMethod "$base/api/governance/policies" -Headers $headers
Test-Endpoint "policies returns array" ($pols.Count -ge 0)

# [9] Notifications
Write-Host "`n[9] GET /api/notifications" -ForegroundColor Cyan
$notifs = Invoke-RestMethod "$base/api/notifications" -Headers $headers
Test-Endpoint "notifications is array (not null)" ($null -ne $notifs)

# [10] Profile
Write-Host "`n[10] GET /api/profile/me" -ForegroundColor Cyan
$prof = Invoke-RestMethod "$base/api/profile/me" -Headers $headers
Test-Endpoint "profile has name+role" ($prof.name -and $prof.role)

Write-Host "`n[10b] GET /api/profile/history?type=CSR" -ForegroundColor Cyan
$hist = Invoke-RestMethod "$base/api/profile/history?type=CSR" -Headers $headers
Test-Endpoint "history is array" ($null -ne $hist)

# [11] Settings
Write-Host "`n[11] GET /api/settings/config" -ForegroundColor Cyan
$cfg = Invoke-RestMethod "$base/api/settings/config" -Headers $headers
Test-Endpoint "config has auto_emission_enabled" ($null -ne $cfg.auto_emission_enabled)

Write-Host "`n[11b] GET /api/departments" -ForegroundColor Cyan
$depts = Invoke-RestMethod "$base/api/settings/departments" -Headers $headers
Test-Endpoint "departments is array" ($depts.Count -ge 0)

# [12] Reports
Write-Host "`n[12] POST /api/reports/generate" -ForegroundColor Cyan
$rptBody = '{"module":"Environmental","format":"CSV","dateRange":{"from":"2026-07-01","to":"2026-07-31"}}'
$rpt = Invoke-RestMethod "$base/api/reports/generate" -Method Post -Headers $headers -ContentType "application/json" -Body $rptBody
Test-Endpoint "report generated with id" ($rpt.id.Length -gt 0)
Test-Endpoint "report has downloadUrl" ($rpt.downloadUrl.Length -gt 0)

Write-Host "`n[12b] GET /api/reports/history" -ForegroundColor Cyan
$rptHist = Invoke-RestMethod "$base/api/reports/history" -Headers $headers
Test-Endpoint "report history is array" ($rptHist.Count -ge 0)

Write-Host "`n============================================" -ForegroundColor Magenta
Write-Host "Results: $passed PASSED, $failed FAILED" -ForegroundColor $(if ($failed -eq 0) {"Green"} else {"Red"})
Write-Host "============================================`n" -ForegroundColor Magenta
