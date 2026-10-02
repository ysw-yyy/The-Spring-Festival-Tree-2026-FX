@echo off
REM ============================================================================
REM  One-click update to GitHub.
REM  Uses the portable git in work\MinGit and your SSH key.
REM
REM  Usage:  double-click this file
REM      or: push.bat "your commit message"
REM
REM  Why SSH instead of HTTPS: this machine's Schannel (native Windows TLS) is
REM  broken, so git over HTTPS dies right after the TLS handshake
REM  (reports "Could not resolve host"). SSH does not use Schannel, works
REM  reliably, and needs no personal access token.
REM
REM  NOTE: keep this file pure ASCII. cmd.exe reads .bat in the OEM codepage,
REM  so non-ASCII comments get mangled into commands and break the script.
REM ============================================================================
setlocal

set "REPO_DIR=%~dp0"
set "PARENT_DIR=%~dp0..\"

REM Look for the portable git in two places:
REM   1) <repo>\work\MinGit   (self-contained)
REM   2) <parent>\work\MinGit (this machine's current layout)
set "GIT_HOME=%REPO_DIR%work\MinGit"
if not exist "%GIT_HOME%\cmd\git.exe" set "GIT_HOME=%PARENT_DIR%work\MinGit"

set "GIT=%GIT_HOME%\cmd\git.exe"
set "SSH=%SystemRoot%\System32\OpenSSH\ssh.exe"

if not exist "%GIT%" (
    echo [ERROR] portable git not found.
    echo         looked in:
    echo           %REPO_DIR%work\MinGit
    echo           %PARENT_DIR%work\MinGit
    echo         download MinGit from https://github.com/git-for-windows/git/releases
    echo         and extract it to one of those paths.
    exit /b 1
)

set "PATH=%GIT_HOME%\cmd;%GIT_HOME%\ucrt64\bin;%GIT_HOME%\usr\bin;%PATH%"
set "GIT_SSH_COMMAND="%SSH%""

cd /d "%REPO_DIR%"

set "MSG=%~1"
if "%MSG%"=="" set "MSG=Update %DATE% %TIME%"

echo.
echo === Changes ===
"%GIT%" status --short
echo.

REM Detect "nothing to do" with a single command.
REM
REM The previous approach piped `git ls-files --others` into `find`, but the
REM quoting through for/f was never accepted by git -- it printed
REM   error: unknown option `exclude-standard | find /c /v "'
REM and the count silently stayed wrong. So instead: dump porcelain status to a
REM temp file and test its SIZE with %%~zA, which needs no quoting gymnastics.
set "STATUS_FILE=%TEMP%\ds-push-status-%RANDOM%.txt"
"%GIT%" status --porcelain > "%STATUS_FILE%" 2>nul
set "HAS_CHANGES="
for %%A in ("%STATUS_FILE%") do if %%~zA GTR 0 set "HAS_CHANGES=1"
del "%STATUS_FILE%" >nul 2>&1
if not defined HAS_CHANGES (
    echo Nothing to commit.
    exit /b 0
)

echo === Staging ===
"%GIT%" add -A
if errorlevel 1 ( echo [ERROR] git add failed & exit /b 1 )

echo === Committing ===
"%GIT%" commit -m "%MSG%"
if errorlevel 1 ( echo [ERROR] git commit failed & exit /b 1 )

echo === Pushing to GitHub ===
"%GIT%" push
if errorlevel 1 ( echo [ERROR] git push failed & exit /b 1 )

echo.
echo === Done ===
"%GIT%" log --oneline -3
echo.
echo repo:  https://github.com/ysw-yyy/The-Spring-Festival-Tree-2026-FX
echo live:  https://ysw-yyy.github.io/The-Spring-Festival-Tree-2026-FX/
endlocal
