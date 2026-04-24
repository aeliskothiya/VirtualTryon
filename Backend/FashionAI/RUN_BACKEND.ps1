$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = $PSScriptRoot
$condaBase = "D:\Anaconda3"
$condaHook = Join-Path $condaBase "shell\condabin\conda-hook.ps1"

if (-not (Test-Path $condaHook)) {
    throw "Conda hook not found at $condaHook"
}

& $condaHook | Out-Null
conda activate vton

Set-Location $backendRoot

Write-Host "Starting FashionAI backend from $backendRoot using Conda env 'vton'..."
Write-Host "Docs: http://127.0.0.1:8000/docs"

uvicorn main:app --reload
