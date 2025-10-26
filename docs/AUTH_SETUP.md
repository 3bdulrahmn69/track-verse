# Track Verse - Authentication Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running locally
- Google OAuth credentials (optional, for Google Sign-in)

## Step 1: Database Setup

### Install PostgreSQL (if not already installed)

**Windows:**
Download from https://www.postgresql.org/download/windows/

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux:**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE trackverse;

# Exit
\q
```

## Step 2: Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update `.env.local` with your database credentials:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/trackverse

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth (Optional - for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Generate NEXTAUTH_SECRET

Run one of these commands:

```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

## Step 3: Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy Client ID and Client Secret to `.env.local`

## Step 4: Database Migration

Run the database migrations to create tables:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Testing the Authentication

### Test Local Registration & Login

1. Go to http://localhost:3000/register
2. Fill in the registration form:
   - Full Name
   - Email
   - Password (min 8 chars, uppercase, lowercase, number, special char)
   - Date of Birth
   - Username (min 3 chars, alphanumeric + underscore)
3. Accept terms and conditions
4. Click "Create Account"
5. You'll be redirected to login page
6. Login with email/username and password
7. You'll be redirected to dashboard

### Test Google Sign-in

1. Go to http://localhost:3000/login
2. Click "Sign in with Google"
3. Authorize with Google account
4. You'll be redirected to dashboard

## Database Management

### View Database with Drizzle Studio

```bash
npm run db:studio
```

This opens a visual database browser at http://localhost:4983

### Manual Database Access

```bash
# Connect to database
psql -U postgres -d trackverse

# View users table
SELECT * FROM users;

# Exit
\q
```

## Troubleshooting

### Database Connection Error

- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `.env.local`
- Check database exists: `psql -U postgres -l`

### NextAuth Error

- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your app URL
- Clear browser cookies and try again

### Google OAuth Error

- Check redirect URI in Google Console
- Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Ensure Google+ API is enabled

### Migration Issues

```bash
# Reset and regenerate migrations
rm -rf drizzle
npm run db:generate
npm run db:push
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - NextAuth sign in (credentials)
- `GET /api/auth/signin` - NextAuth sign in page
- `POST /api/auth/callback/google` - Google OAuth callback
- `POST /api/auth/signout` - Sign out

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords (enforced by validation)
- NEXTAUTH_SECRET should be unique and random
- In production, use HTTPS for NEXTAUTH_URL
- Rotate secrets regularly

## Next Steps

- Customize user profile fields
- Add email verification
- Implement password reset flow
- Add 2FA authentication
- Create protected dashboard routes
