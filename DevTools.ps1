<#
.SYNOPSIS
  Myot Developer Tool
.DESCRIPTION
  A unified workflow script to run, build, test, and manage the Myot project.
#>

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$global:ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Get-PackageVersion {
    $pkgJsonPath = Join-Path $global:ProjectRoot "package.json"
    if (Test-Path $pkgJsonPath) {
        try {
            $json = Get-Content $pkgJsonPath -Raw | ConvertFrom-Json
            return $json.version
        } catch {
            return "unknown"
        }
    }
    return "unknown"
}

function Show-Menu {
    Clear-Host
    $version = Get-PackageVersion
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "  Myot 개발 도구  [v$version]" -ForegroundColor Cyan
    Write-Host "  $global:ProjectRoot" -ForegroundColor Gray
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  [ RUN ]" -ForegroundColor Yellow
    Write-Host "  1. 개발 서버 실행      (npm run dev)"
    Write-Host "  2. 테스트 실행         (vercel dev)"
    Write-Host ""
    Write-Host "  [ BUILD ]" -ForegroundColor Yellow
    Write-Host "  3. 패키지 설치         (npm install)"
    Write-Host "  4. 프로덕션 빌드       (npm run build)"
    Write-Host "  5. 클린 설치           (node_modules 삭제 후 재설치)"
    Write-Host ""
    Write-Host "  [ GIT ]" -ForegroundColor Yellow
    Write-Host "  6. 작업 내용 Commit"
    Write-Host "  7. 버전 업              (package.json + commit)"
    Write-Host "  8. 태그 생성            (git tag)"
    Write-Host "  9. Push                 (origin push + tag push)"
    Write-Host "  10. 모든 로컬 변경사항 되돌리기"
    Write-Host ""
    Write-Host "  0. 종료"
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Run-Dev {
    Write-Host "`n[개발 서버 실행] npm run dev" -ForegroundColor Green
    Write-Host "Ctrl+C 로 종료합니다.`n" -ForegroundColor DarkGray
    Push-Location $global:ProjectRoot
    try { npm run dev } finally { Pop-Location }
}

function Run-Test {
    Write-Host "`n[테스트 실행] vercel dev" -ForegroundColor Green
    Write-Host "Ctrl+C 로 종료합니다.`n" -ForegroundColor DarkGray
    Push-Location $global:ProjectRoot
    try { vercel dev } finally { Pop-Location }
}

function Build-Install {
    Write-Host "`n[패키지 설치] npm install`n" -ForegroundColor Green
    Push-Location $global:ProjectRoot
    try {
        npm install
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] 설치 완료!" -ForegroundColor Green }
        else { Write-Host "[ERROR] npm install 실패!" -ForegroundColor Red }
    } finally { Pop-Location }
}

function Build-Prod {
    Write-Host "`n[프로덕션 빌드] npm run build`n" -ForegroundColor Green
    Push-Location $global:ProjectRoot
    try {
        npm run build
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] 빌드 완료!" -ForegroundColor Green }
        else { Write-Host "[ERROR] 빌드 실패!" -ForegroundColor Red }
    } finally { Pop-Location }
}

function Build-CleanInstall {
    Write-Host "`n[클린 설치] node_modules 및 package-lock.json 삭제 후 재설치합니다.`n" -ForegroundColor Green
    Push-Location $global:ProjectRoot
    try {
        $nodeModules = Join-Path $global:ProjectRoot "node_modules"
        $lockFile = Join-Path $global:ProjectRoot "package-lock.json"
        if (Test-Path $nodeModules) {
            Write-Host "node_modules 삭제 중..." -ForegroundColor Gray
            Remove-Item $nodeModules -Recurse -Force
        }
        if (Test-Path $lockFile) {
            Write-Host "package-lock.json 삭제 중..." -ForegroundColor Gray
            Remove-Item $lockFile -Force
        }
        Write-Host "종속성 재설치 중...`n" -ForegroundColor Gray
        npm install
        if ($LASTEXITCODE -eq 0) { Write-Host "[OK] 클린 설치 완료!" -ForegroundColor Green }
        else { Write-Host "[ERROR] npm install 실패!" -ForegroundColor Red }
    } finally { Pop-Location }
}

function Save-HistorySnapshot {
    $historyPath = Join-Path $global:ProjectRoot "history.md"

    if (-not (Test-Path $historyPath)) {
        Write-Host "[INFO] history.md 없음, 아카이브 건너뜀." -ForegroundColor Gray
        return
    }

    $aiHistoryDir = Join-Path $global:ProjectRoot "AIHistory"
    if (-not (Test-Path $aiHistoryDir)) {
        New-Item -ItemType Directory -Path $aiHistoryDir -Force | Out-Null
    }

    # Derive slug from first content line of "## Current Goal" section
    $lines = Get-Content $historyPath
    $slug = "worklog"
    $inGoal = $false
    foreach ($line in $lines) {
        if ($line -match '^##\s*Current Goal') {
            $inGoal = $true
            continue
        }
        if ($inGoal) {
            if ($line -match '^#') { break }
            if ([string]::IsNullOrWhiteSpace($line)) { continue }
            $raw = $line.Trim() -replace '[^\w\s-]', '' -replace '\s+', '-'
            $candidate = ($raw.ToLower() -replace '[^a-z0-9-]', '').Trim('-')
            if ($candidate.Length -gt 30) { $candidate = $candidate.Substring(0, 30).TrimEnd('-') }
            if (-not [string]::IsNullOrEmpty($candidate)) { $slug = $candidate }
            break
        }
    }

    $ts = (Get-Date).ToString("yyyyMMdd_HHmm")
    $archiveName = "${ts}_${slug}.md"
    $archivePath = Join-Path $aiHistoryDir $archiveName

    Copy-Item $historyPath $archivePath
    Write-Host "[INFO] history.md 아카이브 → AIHistory\$archiveName" -ForegroundColor Gray
}

function Git-Commit {
    Write-Host "`n[작업 내용 Commit]" -ForegroundColor Green
    Write-Host "변경된 모든 파일을 스테이징합니다 (git add .)." -ForegroundColor Gray
    & git -C $global:ProjectRoot add .
    Write-Host ""

    $suggestedFile = Join-Path $global:ProjectRoot "SuggestedCommit.txt"
    $defaultMsg = if (Test-Path $suggestedFile) { $raw = Get-Content $suggestedFile -Raw; if ($raw) { $raw.Trim() } else { $null } } else { $null }

    if ($defaultMsg) {
        Write-Host "[AI 제안 메시지]: $defaultMsg" -ForegroundColor Cyan
        Write-Host "커밋 메시지를 직접 입력하거나, Enter 시 제안 메시지를 사용하세요. (q 입력 시 취소)"
    } else {
        Write-Host "커밋 메시지를 입력하세요. (q 입력 시 취소)"
    }

    $userInput = Read-Host "입력"

    if ($userInput -eq 'q') {
        Write-Host "[!] 커밋이 취소되었습니다.`n" -ForegroundColor Yellow
        return
    }

    $commitMsg = if ([string]::IsNullOrWhiteSpace($userInput)) { $defaultMsg } else { $userInput }

    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        Write-Host "[!] 커밋 메시지가 필요합니다.`n" -ForegroundColor Red
        return
    }

    $cleanMsg = $commitMsg -replace '\[Suggested Commit\] ', '' -replace 'git commit -m ', '' -replace '"', ''
    $cleanMsg = $cleanMsg.Trim()

    Save-HistorySnapshot
    & git -C $global:ProjectRoot commit -m $cleanMsg
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 커밋 실패! (변경사항 없거나 git 오류)`n" -ForegroundColor Red
    } else {
        Write-Host "[OK] 커밋 완료!" -ForegroundColor Green
        if (Test-Path $suggestedFile) {
            Clear-Content $suggestedFile
            Write-Host "[INFO] SuggestedCommit.txt 내용을 지웠습니다.`n" -ForegroundColor Gray
        }
    }
}

function Git-BumpVersion {
    Write-Host "`n[버전 업] package.json 버전 업데이트 후 커밋" -ForegroundColor Green

    $pkgVer = Get-PackageVersion
    if ($pkgVer -eq "unknown") {
        Write-Host "[ERROR] package.json 에서 버전을 읽을 수 없습니다.`n" -ForegroundColor Red
        return
    }

    $parts = $pkgVer -split '\.'
    $autoVersion = "$($parts[0]).$($parts[1]).$([int]$parts[2] + 1)"

    Write-Host "`n  현재 버전: $pkgVer" -ForegroundColor Cyan
    $userVerInput = Read-Host "새 버전 입력 [엔터 시 기본값: $autoVersion / q 취소]"
    if ($userVerInput -eq 'q') {
        Write-Host "[!] 취소되었습니다.`n" -ForegroundColor Yellow
        return
    }
    $userVer = if ([string]::IsNullOrWhiteSpace($userVerInput)) { $autoVersion } else { $userVerInput }

    Push-Location $global:ProjectRoot
    try {
        npm version $userVer --no-git-tag-version
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[ERROR] npm version 실패!`n" -ForegroundColor Red
            return
        }
    } finally { Pop-Location }

    $pkgJsonPath = Join-Path $global:ProjectRoot "package.json"
    $lockFilePath = Join-Path $global:ProjectRoot "package-lock.json"
    & git -C $global:ProjectRoot add $pkgJsonPath
    if (Test-Path $lockFilePath) { & git -C $global:ProjectRoot add $lockFilePath }
    Save-HistorySnapshot
    & git -C $global:ProjectRoot commit -m "chore: bump version to $userVer"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[!] 커밋할 내용 없거나 실패." -ForegroundColor Yellow
    } else {
        Write-Host "[OK] 버전 $pkgVer → $userVer 커밋 완료!`n" -ForegroundColor Green
    }
}

function Git-Tag {
    Write-Host "`n[태그 생성] 현재 커밋에 태그를 붙입니다" -ForegroundColor Green

    $pkgVer = Get-PackageVersion
    $tagTs = (Get-Date).ToString("yyMMddHHmmss")
    $defaultTag = "v${pkgVer}_$tagTs"

    Write-Host "`n  현재 버전: $pkgVer" -ForegroundColor Cyan
    $tagNameInput = Read-Host "태그명 입력 [엔터 시 기본값: $defaultTag / q 취소]"
    if ($tagNameInput -eq 'q') {
        Write-Host "[!] 취소되었습니다.`n" -ForegroundColor Yellow
        return
    }
    $tagName = if ([string]::IsNullOrWhiteSpace($tagNameInput)) { $defaultTag } else { $tagNameInput }

    $null = & git -C $global:ProjectRoot rev-parse -q --verify "refs/tags/$tagName" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[ERROR] 태그 [$tagName] 가 이미 존재합니다.`n" -ForegroundColor Red
        return
    }

    & git -C $global:ProjectRoot tag $tagName
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 태그 생성 실패!`n" -ForegroundColor Red
    } else {
        Write-Host "[OK] 태그 [$tagName] 생성 완료! (아직 Push 전)`n" -ForegroundColor Green
    }
}

function Git-Push {
    Write-Host "`n[Push] 현재 브랜치 및 태그를 원격으로 Push합니다" -ForegroundColor Green

    $branch = & git -C $global:ProjectRoot rev-parse --abbrev-ref HEAD 2>$null
    Write-Host "`n  현재 브랜치: $branch" -ForegroundColor Cyan

    $confirm = Read-Host "origin/$branch 로 Push하시겠습니까? [엔터 확인 / q 취소]"
    if ($confirm -eq 'q') {
        Write-Host "[!] 취소되었습니다.`n" -ForegroundColor Yellow
        return
    }

    Write-Host "`n[1/2] 커밋 Push 중..." -ForegroundColor Gray
    & git -C $global:ProjectRoot push origin $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Push 실패!`n" -ForegroundColor Red
        return
    }

    Write-Host "[2/2] 태그 Push 중..." -ForegroundColor Gray
    & git -C $global:ProjectRoot push origin --tags
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] 태그 Push 실패!`n" -ForegroundColor Red
    } else {
        Write-Host "[OK] origin/$branch Push 완료!`n" -ForegroundColor Green
    }
}

function Git-Revert {
    Write-Host "`n[위험: 모든 로컬 변경사항 되돌리기]" -ForegroundColor Red
    Write-Host "커밋하지 않은 모든 변경사항이 영구적으로 삭제됩니다." -ForegroundColor Red
    Write-Host "정말로 마지막 커밋 상태로 되돌리시겠습니까?`n" -ForegroundColor Red

    $confirm = Read-Host "진행하려면 'Y' 입력 (그 외 취소)"

    if ($confirm -eq 'Y') {
        Write-Host ""
        & git -C $global:ProjectRoot reset --hard HEAD
        & git -C $global:ProjectRoot clean -fd
        Write-Host "`n[OK] 모든 로컬 변경사항이 초기화되었습니다.`n" -ForegroundColor Green
    } else {
        Write-Host "`n[!] 취소되었습니다.`n" -ForegroundColor Yellow
    }
}

# Main Loop
while ($true) {
    Show-Menu
    $choice = Read-Host "선택"

    switch ($choice) {
        '1' { Run-Dev }
        '2' { Run-Test }
        '3' { Build-Install }
        '4' { Build-Prod }
        '5' { Build-CleanInstall }
        '6' { Git-Commit }
        '7' { Git-BumpVersion }
        '8' { Git-Tag }
        '9' { Git-Push }
        '10' { Git-Revert }
        '0' { break }
        default {
            Write-Host "[!] 잘못된 입력입니다." -ForegroundColor Red
            Start-Sleep -Seconds 2
            continue
        }
    }

    if ($choice -ne '0') {
        Write-Host "계속하려면 아무 키나 누르세요..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
    }
}

Write-Host "종료합니다." -ForegroundColor Cyan
