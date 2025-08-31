@echo off
echo Starting FarmApp...

REM Check if .env file exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy /Y .env.example .env >nul
    echo Please edit the .env file with your database credentials and other settings.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

REM Check if database is set up
echo Checking database setup...
node -e "const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    await connection.query('SELECT 1');
    console.log('Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed. Running setup...');
    process.exit(1);
  }
})();" || (
    echo Running database setup...
    call node config/setup-database.js
)

echo Starting the application...
node start.js
