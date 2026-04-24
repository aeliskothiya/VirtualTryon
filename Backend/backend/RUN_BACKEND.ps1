$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$backendRoot = $PSScriptRoot
$pythonExe = "D:\Anaconda3\envs\vton\python.exe"

if (-not (Test-Path $pythonExe)) {
    throw "Python executable not found at $pythonExe"
}

Set-Location $backendRoot
$env:PYTHONPATH = $repoRoot

Write-Host "Starting backend from $backendRoot using Python at $pythonExe..."
Write-Host "Docs: http://127.0.0.1:8000/docs"
Write-Host "PYTHONPATH: $env:PYTHONPATH"

& $pythonExe -m uvicorn app.main:app --reload
