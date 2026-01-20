# Apply User Location Schema
# Adds city, latitude, longitude fields to users table

Write-Host "Applying user location schema..." -ForegroundColor Cyan

# Read SQL file
$sqlContent = Get-Content -Path "add_user_location.sql" -Raw

# Execute SQL
try {
    # Using Node.js to execute SQL (since mysql CLI might not be in PATH)
    $jsScript = @"
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../backend/.env' });

async function applySchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'safehaven_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to database');
    
    const sql = ``$sqlContent``;
    const [results] = await connection.query(sql);
    
    console.log('User location schema applied successfully!');
    console.log('Results:', results);
  } catch (error) {
    console.error('Error applying schema:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

applySchema();
"@

    $jsScript | Out-File -FilePath "temp-apply-schema.js" -Encoding UTF8
    
    Push-Location ../backend
    node ../database/temp-apply-schema.js
    Pop-Location
    
    Remove-Item "temp-apply-schema.js" -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "User location schema applied!" -ForegroundColor Green
    Write-Host "Users table now has: city, latitude, longitude columns" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
