@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion

:: ============================================================
::  Myot - Web / Vite Project Dev Tools
:: ============================================================

set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

:MENU
cls
echo ============================================================
echo   Myot Web Dev Tools (Vite / Next.js)
echo ============================================================
echo.
echo   1. 패키지 설치 (npm install)
echo   2. 개발 서버 실행 (npm run dev / vercel dev)
echo   3. 프로덕션 빌드 (npm run build)
echo   4. 클린 설치 (node_modules 삭제 후 재설치)
echo   5. 작업 내용 Commit (git)
echo   6. 버전 업 / 태그 생성 / 배포 (package.json 기준)
echo   7. 모든 로컬 변경사항 되돌리기 (위험: git reset and clean)
echo   8. 테스트 실행 (vercel dev)
echo   0. 종료
echo.
echo ============================================================
set /p "CHOICE=선택: "

if "%CHOICE%"=="1" goto NPM_INSTALL
if "%CHOICE%"=="2" goto RUN_DEV
if "%CHOICE%"=="3" goto RUN_BUILD
if "%CHOICE%"=="4" goto CLEAN_INSTALL
if "%CHOICE%"=="5" goto GIT_COMMIT
if "%CHOICE%"=="6" goto GIT_RELEASE
if "%CHOICE%"=="7" goto GIT_REVERT
if "%CHOICE%"=="8" goto RUN_TEST
if "%CHOICE%"=="0" goto END
echo [!] 잘못된 입력입니다.
timeout /t 2 >nul
goto MENU

:: ----------------------------------------------------------
:NPM_INSTALL
:: ----------------------------------------------------------
echo.
echo [패키지 설치] npm install 실행 중...
call npm install
echo [OK] 설치 완료.
pause
goto MENU

:: ----------------------------------------------------------
:RUN_DEV
:: ----------------------------------------------------------
echo.
echo [개발 서버 실행] Ctrl+C를 눌러 종료하세요.
call npm run dev
pause
goto MENU

:: ----------------------------------------------------------
:RUN_BUILD
:: ----------------------------------------------------------
echo.
echo [프로덕션 빌드] npm run build 실행 중...
call npm run build
echo [OK] 빌드 완료.
pause
goto MENU

:: ----------------------------------------------------------
:CLEAN_INSTALL
:: ----------------------------------------------------------
echo.
echo [클린 설치] node_modules 및 package-lock.json을 삭제하고 재설치합니다.
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del /f /q "package-lock.json"
echo.
echo 종속성 재설치 중...
call npm install
echo [OK] 클린 설치 완료.
pause
goto MENU

:: ----------------------------------------------------------
:GIT_COMMIT
:: ----------------------------------------------------------
echo.
echo [작업 내용 Commit]
echo 변경된 모든 파일을 스테이징합니다 (git add .).
git add .
echo.

set "DEFAULT_MSG="
if exist "SuggestedCommit.txt" (
    for /f "usebackq delims=" %%i in ("SuggestedCommit.txt") do set "DEFAULT_MSG=%%i"
)

if defined DEFAULT_MSG (
    echo [AI 제안 메시지]: !DEFAULT_MSG!
    echo 커밋 메시지를 직접 입력하거나, Enter를 눌러 제안된 메시지를 사용하세요. (q 입력 시 취소)
) else (
    echo 커밋 메시지를 직접 입력하세요. (q 입력 시 취소)
)

set "USER_INPUT="
set /p "USER_INPUT=입력: "

if /i "!USER_INPUT!"=="q" (
    echo [!] 커밋이 취소되었습니다.
    pause
    goto MENU
)

set "COMMIT_MSG="
if not defined USER_INPUT (
    if defined DEFAULT_MSG (
        set "COMMIT_MSG=!DEFAULT_MSG!"
    ) else (
        echo [!] 입력이 취소되었습니다. 커밋 메시지가 필요합니다.
        pause
        goto MENU
    )
) else (
    set "COMMIT_MSG=!USER_INPUT!"
)

set "CLEAN_MSG=!COMMIT_MSG:[Suggested Commit] =!"
set "CLEAN_MSG=!CLEAN_MSG:git commit -m =!"
set "CLEAN_MSG=!CLEAN_MSG:"=!" 

git commit -m "!CLEAN_MSG!"
if errorlevel 1 (
    echo [ERROR] 커밋 실패!
) else (
    echo [OK] 커밋 완료!
    if exist "SuggestedCommit.txt" (
        break > "SuggestedCommit.txt"
        echo [INFO] 다음 커밋을 위해 SuggestedCommit.txt 내용을 지웠습니다.
    )
)
pause
goto MENU

:: ----------------------------------------------------------
:GIT_RELEASE
:: ----------------------------------------------------------
echo.
echo [버전 업 / 태그 생성 / 자동 배포]

:: PowerShell 절대 경로 찾기 (환경변수 누락 대비)
set "PS_EXE=powershell"
if exist "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" (
    set "PS_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
)

:: 기존 버전 정보 추출
set "CUR_VERSION="
for /f "tokens=2 delims=:, " %%A in ('findstr /i /c:"\"version\"" "package.json"') do (
    set "CUR_VERSION=%%A"
)
if defined CUR_VERSION (
    set "CUR_VERSION=!CUR_VERSION: =!"
    set "CUR_VERSION=!CUR_VERSION:"=!"
)

if not defined CUR_VERSION (
    echo [ERROR] package.json에서 버전을 찾을 수 없습니다.
    pause
    goto MENU
)

:: Patch 버전 자동 1 증가 로직
for /F "tokens=1,2,3 delims=." %%a in ("!CUR_VERSION!") do (
    set "V1=%%a"
    set "V2=%%b"
    set "V3=%%c"
)
set /a V3_NEW=V3 + 1
set "AUTO_VERSION=!V1!.!V2!.!V3_NEW!"

echo.
echo ============================================================
echo   현재 버전: !CUR_VERSION!
echo ============================================================
echo.
set "USER_VERSION="
set /p "USER_VERSION=새 앱 버전 입력 [엔터 시 기본값: !AUTO_VERSION! / 3.0.0 등 직접입력]: "
if "!USER_VERSION!"=="" set "USER_VERSION=!AUTO_VERSION!"

:: 태그용 타임스탬프 생성 (YYMMDDHHMMSS - 연도 포함)
set "YY=%date:~2,2%"
set "MM=%date:~5,2%"
set "DD=%date:~8,2%"
set "HH=%time:~0,2%"
if "%HH:~0,1%"==" " set "HH=0%HH:~1,1%"
set "MIN=%time:~3,2%"
set "SEC=%time:~6,2%"
set "TAG_TS=!YY!!MM!!DD!!HH!!MIN!!SEC!"

set "DEFAULT_TAG=v!USER_VERSION!_!TAG_TS!"

echo.
set "TAG_NAME="
set /p "TAG_NAME=생성할 태그명 입력 [엔터 시 기본값: !DEFAULT_TAG! / 취소: q]: "
if /i "!TAG_NAME!"=="q" (
    echo [!] 취소되었습니다.
    pause
    goto MENU
)
if "!TAG_NAME!"=="" set "TAG_NAME=!DEFAULT_TAG!"

git rev-parse -q --verify refs/tags/!TAG_NAME! >nul 2>&1
if not errorlevel 1 (
    echo [ERROR] 태그 [!TAG_NAME!] 가 이미 로컬에 존재합니다. 다른 태그명을 지정해주세요.
    pause
    goto MENU
)

echo.
echo ============================================================
echo [1/4] package.json 파일 자동 업데이트 중...
echo       [!CUR_VERSION! -^> !USER_VERSION!]
echo ============================================================

call npm version !USER_VERSION! --no-git-tag-version

echo.
echo ============================================================
echo [2/4] 변경된 package.json 커밋 중...
echo ============================================================
git add "package.json"
if exist "package-lock.json" git add "package-lock.json"
git commit -m "chore: bump version to !USER_VERSION! [!TAG_NAME!]"
if errorlevel 1 (
    echo [!] 커밋할 내용이 없거나 실패했습니다. - 이미 최신 상태일 수 있습니다.
)

echo.
echo ============================================================
echo [3/4] 원격 저장소에 Push 중... [git push origin main]
echo ============================================================
git push origin main
if errorlevel 1 (
    echo.
    echo [ERROR] 원격 저장소 Push에 실패했습니다! 위 에러 로그를 확인하세요.
    pause
    goto MENU
)

echo.
echo ============================================================
echo [4/4] 로컬 태그 생성 및 원격 Push 중... 
echo ============================================================
git tag !TAG_NAME!
if errorlevel 1 (
    echo.
    echo [ERROR] 로컬 태그 [!TAG_NAME!] 생성에 실패했습니다! - 이미 존재하는 태그일 수 있습니다.
    pause
    goto MENU
)

git push origin !TAG_NAME!
if errorlevel 1 (
    echo.
    echo [ERROR] 태그 Push에 실패했습니다!
    pause
    goto MENU
)

echo.
echo [OK] 버전[!USER_VERSION!] 업데이트 및 태그[!TAG_NAME!] 배포가 성공적으로 완료되었습니다!
pause
goto MENU

:: ----------------------------------------------------------
:GIT_REVERT
:: ----------------------------------------------------------
echo.
echo [위험: 모든 로컬 변경사항 되돌리기]
echo 아직 커밋하지 않은 모든 코드 수정 사항과 AI가 생성한 임시 파일들이 영구적으로 삭제됩니다.
echo 정말로 마지막 커밋 상태로 완전히 되돌리시겠습니까?
echo.
set /p "CONFIRM=진행하려면 'Y'를 입력하세요 (그 외 입력 시 취소): "

if /i "!CONFIRM!"=="Y" (
    echo.
    echo 초기화를 진행합니다...
    git reset --hard HEAD
    git clean -fd
    echo.
    echo [OK] 모든 로컬 변경사항이 깔끔하게 초기화되었습니다.
) else (
    echo.
    echo [!] 취소되었습니다. 코드가 유지됩니다.
)
pause
goto MENU

:: ----------------------------------------------------------
:RUN_TEST
:: ----------------------------------------------------------
echo.
echo [테스트 실행] vercel dev를 실행합니다. 
echo (실행 중 취소하려면 Ctrl+C를 누르세요.)
call vercel dev
echo.
echo [OK] 테스트가 종료되었습니다.
pause
goto MENU

:: ----------------------------------------------------------
:END
:: ----------------------------------------------------------
echo.
echo 종료합니다.
endlocal
exit /b 0