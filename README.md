# 🎬 TrackVerse

**TrackVerse** is a comprehensive full-stack social media platform for tracking and discovering Movies, TV Shows, Books, and Video Games. Built with modern web technologies, it features real-time notifications, social following, and seamless integration with industry-leading content APIs.

---

## 🌟 Features

### 📊 Media Tracking

- **Movies**: Track movies you want to watch or have watched, with watch count
- **TV Shows**: Monitor series with episode-level tracking (Want to Watch, Watching, Completed, Stopped)
- **Books**: Manage reading lists with progress tracking (Want to Read, Read)
- **Games**: Organize your gaming library (Want to Play, Playing, Completed)

### 👥 Social Features

- **User Profiles**: Public/private account settings with customizable avatars
- **Follow System**: Follow friends and discover content through their activity
- **Activity Feeds**: Real-time updates on what friends are watching/reading/playing
- **Reviews & Ratings**: Rate and review any media item (1-10 scale with comments)

### 🔔 Real-time Notifications

- **Server-Sent Events (SSE)**: Instant notifications without polling
- **Follow Requests**: Manage follow requests for private accounts
- **Activity Updates**: Get notified when friends accept your follow requests

### 🔐 Authentication & Security

- **Multiple Auth Methods**: Email/username + password or Google OAuth
- **NextAuth.js v5**: Secure session management with HTTP-only cookies
- **Privacy Controls**: Granular control over profile visibility and data sharing

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.0](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **UI Components**: Custom components with [React Icons](https://react-icons.github.io/react-icons/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode

### Backend

- **Runtime**: Node.js with Next.js API Routes
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js v5](https://next-auth.js.org/)
- **Cache & Real-time**: [Upstash Redis](https://upstash.com/)
- **File Storage**: [Cloudinary](https://cloudinary.com/) for images

### External APIs

- **[TMDB (The Movie Database)](https://www.themoviedb.org/documentation/api)**: Movies and TV shows data
- **[RAWG Video Games Database](https://rawg.io/apidocs)**: Comprehensive video game information
- **[Open Library API](https://openlibrary.org/developers/api)**: Books and publications data

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database
- Redis instance (Upstash recommended)
- API keys for TMDB, RAWG, and Cloudinary

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/3bdulrahmn69/track-verse.git
cd track-verse
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External APIs
NEXT_PUBLIC_TMDB_API_KEY=your-tmdb-api-key
NEXT_PUBLIC_RAWG_API_KEY=your-rawg-api-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

4. **Run database migrations**

```bash
npm run db:migrate
```

5. **Start the development server**

```bash
npm run dev
```

6. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
track-verse/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages (login, register)
│   ├── (pages)/             # Protected pages (movies, books, etc.)
│   ├── (public)/            # Public pages (privacy, terms)
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth.js handlers
│   │   ├── movies/         # Movie tracking endpoints
│   │   ├── tv-shows/       # TV show tracking endpoints
│   │   ├── books/          # Book tracking endpoints
│   │   ├── games/          # Game tracking endpoints
│   │   ├── follow/         # Follow system endpoints
│   │   ├── notifications/  # Notification endpoints
│   │   ├── reviews/        # Review endpoints
│   │   └── stream/         # SSE endpoint for real-time notifications
│   ├── notifications/       # Notifications page
│   └── portal/             # Main dashboard
├── components/              # React components
│   ├── auth/               # Authentication forms
│   ├── landing/            # Landing page sections
│   ├── layout/             # Layout components (header, footer)
│   ├── notifications/      # Notification components
│   ├── portal/             # Portal/dashboard components
│   ├── settings/           # Settings page components
│   ├── shared/             # Shared/common components
│   ├── tabs/               # Media tab components
│   └── ui/                 # UI primitives (buttons, inputs, etc.)
├── lib/                     # Utilities and configurations
│   ├── db/                 # Database schema and client
│   ├── auth-config.ts      # NextAuth configuration
│   ├── books.ts            # Open Library API helpers
│   ├── cloudinary.ts       # Cloudinary configuration
│   ├── rawg.ts             # RAWG API helpers
│   ├── tmdb.ts             # TMDB API helpers
│   ├── notification-helper.ts # SSE notification helper
│   └── validation.ts       # Form validation schemas
├── hooks/                   # Custom React hooks
├── store/                   # Zustand stores for caching
├── types/                   # TypeScript type definitions
├── docs/                    # Project documentation
└── public/                  # Static assets
```

---

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **userMovies**: Movie tracking data
- **userTvShows**: TV show tracking data
- **userEpisodes**: Individual episode tracking
- **userBooks**: Book tracking data
- **userGames**: Game tracking data
- **reviews**: User reviews and ratings
- **userFollows**: Follow relationships
- **notifications**: User notifications

For detailed schema information, see [docs/OUR_APP.md](docs/OUR_APP.md)

---

## 📡 API Integration Details

### TMDB (The Movie Database)

**Purpose**: Provides comprehensive movie and TV show data  
**Usage**:

- Movie search, details, cast, crew, and ratings
- TV series information with season and episode details
- High-quality posters, backdrops, and profile images
- Trending content and recommendations

**Endpoints Used**:

- `/movie/{id}` - Movie details
- `/tv/{id}` - TV show details
- `/tv/{id}/season/{season_number}` - Season details
- `/search/movie` - Movie search
- `/search/tv` - TV show search

### RAWG Video Games Database

**Purpose**: Comprehensive video game information and metadata  
**Usage**:

- Game search and discovery
- Detailed game information (genres, platforms, ratings)
- Metacritic scores and community ratings
- Game screenshots and artwork
- Platform availability

**Endpoints Used**:

- `/games` - Game search and list
- `/games/{id}` - Game details
- `/genres` - Game genres
- `/platforms` - Gaming platforms

### Open Library API

**Purpose**: Open-source book database with extensive catalog  
**Usage**:

- Book search by title, author, or ISBN
- Author information and bibliography
- Book covers and metadata
- Publication details and editions

**Endpoints Used**:

- `/search.json` - Book search
- `/works/{id}.json` - Book details
- `/authors/{id}.json` - Author information
- Covers API for book cover images

### Cloudinary

**Purpose**: Image management and CDN delivery  
**Usage**:

- User avatar uploads and storage
- Automatic image optimization and transformation
- Fast CDN delivery worldwide
- Secure image URLs

---

## 🎯 Key Features Implementation

### Real-time Notifications (SSE)

TrackVerse uses **Server-Sent Events** instead of polling for real-time updates:

- **Event Stream**: `/api/stream` endpoint maintains persistent connection
- **Redis Queue**: Notification events stored in Redis with 1-hour TTL
- **Zero Polling**: No GET requests for checking notifications
- **Instant Updates**: Notifications appear immediately on all connected devices
- **Production-Ready**: Optimized for serverless environments (Vercel)

### Social Following System

- **Follow Requests**: Private accounts require approval
- **Auto-Accept**: Public accounts automatically accept follows
- **Activity Feeds**: See what friends are tracking in real-time
- **Privacy Controls**: Users control who can see their activity

### Episode-Level TV Tracking

- **Season/Episode Management**: Track individual episodes watched
- **Progress Tracking**: Monitor series completion percentage
- **Bulk Actions**: Mark entire seasons as watched (planned)

---

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically on push

### Environment Setup

Ensure all environment variables are configured in your deployment platform.

---

## 📚 Documentation

For comprehensive documentation, see:

- [Complete App Documentation](docs/OUR_APP.md)
- [Authentication Setup](docs/AUTH_SETUP.md)
- [Follow System Guide](docs/FOLLOW_SYSTEM.md)
- [Quick Start Guide](docs/QUICK_START.md)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- [TMDB](https://www.themoviedb.org/) for movie and TV show data
- [RAWG](https://rawg.io/) for video game information
- [Open Library](https://openlibrary.org/) for book data
- [Vercel](https://vercel.com/) for hosting
- [Upstash](https://upstash.com/) for Redis infrastructure

---

## 📧 Contact

**Developer**: Abdelrahman  
**GitHub**: [@3bdulrahmn69](https://github.com/3bdulrahmn69)  
**Project Link**: [https://github.com/3bdulrahmn69/track-verse](https://github.com/3bdulrahmn69/track-verse)

---

Built with ❤️ using Next.js 16, TypeScript, and PostgreSQL
