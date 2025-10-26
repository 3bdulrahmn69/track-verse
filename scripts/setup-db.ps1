# Track Verse - Database Setup Script
# Run this script to set up your local PostgreSQL database

Write-Host "🚀 Track Verse - Database Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow
$pgInstalled = Get-Command psql -ErrorAction SilentlyContinue

if (-not $pgInstalled) {
    Write-Host "❌ PostgreSQL is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL found" -ForegroundColor Green
Write-Host ""

# Get database credentials
Write-Host "Enter your PostgreSQL credentials:" -ForegroundColor Cyan
$dbUser = Read-Host "Username (default: postgres)"
if ([string]::IsNullOrWhiteSpace($dbUser)) {
    $dbUser = "postgres"
}

$dbPassword = Read-Host "Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

$dbName = Read-Host "Database name (default: trackverse)"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "trackverse"
}

# Test connection
Write-Host ""
Write-Host "Testing database connection..." -ForegroundColor Yellow
$env:PGPASSWORD = $dbPasswordPlain
$testConnection = & psql -U $dbUser -h localhost -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to connect to PostgreSQL" -ForegroundColor Red
    Write-Host "Error: $testConnection" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Connection successful" -ForegroundColor Green
Write-Host ""

# Check if database exists
Write-Host "Checking if database '$dbName' exists..." -ForegroundColor Yellow
$dbExists = & psql -U $dbUser -h localhost -lqt | Select-String -Pattern "^\s*$dbName\s"

if ($dbExists) {
    Write-Host "⚠️  Database '$dbName' already exists" -ForegroundColor Yellow
    $recreate = Read-Host "Do you want to recreate it? (y/N)"
    
    if ($recreate -eq "y" -or $recreate -eq "Y") {
        Write-Host "Dropping existing database..." -ForegroundColor Yellow
        & psql -U $dbUser -h localhost -c "DROP DATABASE IF EXISTS $dbName;"
        Write-Host "✅ Database dropped" -ForegroundColor Green
    } else {
        Write-Host "Using existing database" -ForegroundColor Cyan
        $createDb = $false
    }
}

# Create database
if ($createDb -ne $false) {
    Write-Host "Creating database '$dbName'..." -ForegroundColor Yellow
    & psql -U $dbUser -h localhost -c "CREATE DATABASE $dbName;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database created successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Create .env.local file
Write-Host "Creating .env.local file..." -ForegroundColor Yellow

# Generate NEXTAUTH_SECRET
$bytes = New-Object Byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$nextAuthSecret = [Convert]::ToBase64String($bytes)

$databaseUrl = "postgresql://${dbUser}:${dbPasswordPlain}@localhost:5432/$dbName"

$envContent = @"
# Database
DATABASE_URL=$databaseUrl

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$nextAuthSecret

# Google OAuth (Optional - Add your credentials)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ .env.local file created" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Push database schema
Write-Host "Pushing database schema..." -ForegroundColor Yellow
npm run db:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push database schema" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database schema created" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. (Optional) Add Google OAuth credentials to .env.local" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Visit: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "- Quick Start: docs/QUICK_START.md" -ForegroundColor White
Write-Host "- Setup Guide: docs/AUTH_SETUP.md" -ForegroundColor White
Write-Host "- Implementation: docs/IMPLEMENTATION_SUMMARY.md" -ForegroundColor White
Write-Host ""
Write-Host "Database Management:" -ForegroundColor Cyan
Write-Host "- View tables: npm run db:studio" -ForegroundColor White
Write-Host "- Generate migrations: npm run db:generate" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Green
