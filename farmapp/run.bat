@echo off
echo Starting FarmApp...

REM Check if .env exists, if not copy from .env.example
if not exist .env (
    echo Copying .env.example to .env...
    copy /Y .env.example .env
    echo Please edit the .env file with your database credentials.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Starting the application...
node app.js

pause
