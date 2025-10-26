# 🚀 Quick Start - Authentication System

## Setup in 5 Minutes

1. **Create `.env.local` file** (copy from `.env.example`):

```bash
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/trackverse
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=run-openssl-rand-base64-32
```

2. **Install dependencies**:

```bash
npm install
```

3. **Setup database**:

```bash
# Create database in PostgreSQL
createdb trackverse

# Push schema to database
npm run db:push
```

4. **Run the app**:

```bash
npm run dev
```

5. **Test it out**:
   - Register: http://localhost:3000/register
   - Login: http://localhost:3000/login
   - Dashboard: http://localhost:3000/dashboard (after login)

## Features Implemented ✅

### Backend

- ✅ PostgreSQL database with Drizzle ORM
- ✅ User schema (fullname, email, username, password, date_of_birth, google_id)
- ✅ NextAuth.js v5 configuration
- ✅ Google OAuth integration
- ✅ Credentials authentication (email/username + password)
- ✅ Password hashing with bcrypt
- ✅ Input validation
- ✅ Registration API endpoint
- ✅ Protected routes with middleware

### Frontend

- ✅ Login form with Google Sign-in
- ✅ Registration form (2-step) with Google Sign-up
- ✅ Password validation
- ✅ Error handling
- ✅ Toast notifications
- ✅ Session management
- ✅ Protected dashboard

### Security

- ✅ Password hashing (bcrypt)
- ✅ JWT sessions
- ✅ Route protection
- ✅ Input validation
- ✅ Unique email/username checks

## Database Commands

```bash
# Generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (dev)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

## What's Next?

See [AUTH_SETUP.md](./AUTH_SETUP.md) for detailed setup instructions, troubleshooting, and Google OAuth configuration.
