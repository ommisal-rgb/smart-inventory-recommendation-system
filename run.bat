@echo off
title AURA Inventory AI - Autonomous Reorder & Prediction System
echo =====================================================================
echo        AURA INVENTORY AI: SMART INVENTORY RECOMMENDATION SYSTEM
echo       Veteran Agentic AI ^& Operations Research Decision Engine
echo =====================================================================
echo.
echo [*] Checking Python environment and dependencies...
python -c "import flask, sklearn, pandas, scipy, openpyxl, requests" 2>nul
if %errorlevel% neq 0 (
    echo [!] Missing dependencies detected. Installing via pip...
    pip install -r requirements.txt
)
echo.
echo [*] Launching AURA Inventory AI Dashboard...
echo [*] Server URL: http://localhost:5000
start "" http://localhost:5000
python app.py
pause
