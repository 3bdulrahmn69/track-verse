# Track Verse - Complete Application Documentation

## 📋 Overview

**Track Verse** is a comprehensive media tracking and social platform that allows users to track, review, and share their consumption of movies, TV shows, books, and video games. The application provides a unified dashboard for managing personal media libraries while fostering a social community around shared interests.

### 🎯 Core Mission

To create the ultimate media tracking experience where users can maintain detailed personal collections, discover new content through social connections, and engage with a community of fellow entertainment enthusiasts.

### 🌟 Key Differentiators

- **Unified Platform**: Single application for all media types (movies, TV shows, books, games)
- **Social Integration**: Follow friends, see activity feeds, and discover content socially
- **Rich Metadata**: Integration with industry-leading APIs (TMDB, RAWG, Open Library)
- **Real-time Updates**: Live notifications and activity feeds powered by Redis
- **Privacy Controls**: Granular privacy settings for public/private profiles

---

## 🏗️ Technical Architecture

### Frontend Stack

- **Framework**: Next.js 16.0.0 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Theme**: next-themes with light/dark/system modes
- **Icons**: React Icons (Material Design Icons)

### Backend Stack

- **Runtime**: Node.js with Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (Google OAuth + Credentials)
- **Caching**: Upstash Redis for real-time features
- **File Storage**: Cloudinary for image assets

### External APIs

- **TMDB (The Movie Database)**: Movies and TV shows data
- **RAWG**: Video games database
- **Open Library**: Books and publications data

### Development Tools

- **Package Manager**: npm
- **Database Management**: Drizzle Kit
- **Linting**: ESLint
- **Type Checking**: TypeScript
- **Testing**: (Not implemented yet)

---

## 📊 Database Schema

### Core Tables

#### Users

```sql
- id: UUID (Primary Key)
- fullname: VARCHAR(255)
- email: VARCHAR(255) UNIQUE
- username: VARCHAR(255) UNIQUE
- password: VARCHAR(255) (nullable for OAuth)
- dateOfBirth: DATE
- image: TEXT (Cloudinary URL)
- isPublic: BOOLEAN DEFAULT false
- googleId: VARCHAR(255) UNIQUE
- provider: VARCHAR(50) DEFAULT 'local'
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### Media Tracking Tables

**Movies** (`userMovies`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- movieId: INTEGER (TMDB ID)
- movieTitle: VARCHAR(500)
- moviePosterPath: VARCHAR(500)
- movieReleaseDate: VARCHAR(50)
- status: ENUM ('want_to_watch', 'watched')
- watchCount: INTEGER DEFAULT 0
- runtime: INTEGER
- tmdbRating: DECIMAL(3,1)
- imdbId: VARCHAR(20)
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**TV Shows** (`userTvShows`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- tvShowId: INTEGER (TMDB ID)
- tvShowName: VARCHAR(500)
- tvShowPosterPath: VARCHAR(500)
- tvShowFirstAirDate: VARCHAR(50)
- status: ENUM ('want_to_watch', 'watching', 'completed', 'stopped_watching')
- tmdbRating: DECIMAL(3,1)
- totalSeasons: INTEGER
- totalEpisodes: INTEGER
- watchedEpisodes: INTEGER
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**TV Episodes** (`userEpisodes`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- userTvShowId: UUID (Foreign Key → userTvShows)
- tvShowId: INTEGER (TMDB ID)
- seasonNumber: INTEGER
- episodeNumber: INTEGER
- episodeName: VARCHAR(500)
- runtime: INTEGER
- watched: BOOLEAN DEFAULT false
- watchedAt: TIMESTAMP
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**Books** (`userBooks`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- bookId: VARCHAR(255) (Open Library ID)
- bookTitle: VARCHAR(500)
- bookCoverId: INTEGER
- bookAuthors: TEXT (JSON array)
- bookFirstPublishYear: INTEGER
- status: ENUM ('want_to_read', 'read')
- pagesRead: INTEGER
- totalPages: INTEGER
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**Games** (`userGames`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- gameId: INTEGER (RAWG ID)
- gameName: VARCHAR(500)
- gameSlug: VARCHAR(500)
- gameBackgroundImage: VARCHAR(500)
- gameReleased: VARCHAR(50)
- status: ENUM ('want_to_play', 'playing', 'completed')
- rating: DECIMAL(3,1)
- avgPlaytime: INTEGER
- metacritic: INTEGER
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

#### Social Features

**Reviews** (`reviews`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- itemId: VARCHAR(255)
- itemType: ENUM ('movie', 'tv_episode', 'book', 'game')
- rating: DECIMAL(3,1)
- comment: TEXT
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**User Follows** (`userFollows`):

```sql
- id: UUID (Primary Key)
- followerId: UUID (Foreign Key → users)
- followingId: UUID (Foreign Key → users)
- status: ENUM ('pending', 'accepted', 'rejected')
- createdAt: TIMESTAMP
- updatedAt: TIMESTAMP
```

**Notifications** (`notifications`):

```sql
- id: UUID (Primary Key)
- userId: UUID (Foreign Key → users)
- fromUserId: UUID (Foreign Key → users)
- type: ENUM ('follow_request', 'follow_accepted', 'follow')
- followId: UUID (Foreign Key → userFollows)
- read: BOOLEAN DEFAULT false
- createdAt: TIMESTAMP
```

---

## 🎨 User Interface & Pages

### Public Pages

#### Landing Page (`/`)

- **Hero Section**: App introduction with call-to-action
- **Features Section**: Overview of core functionality
- **APIs/Services Section**: Showcase of integrated services
- **Testimonials**: User reviews and feedback
- **Footer**: Links to legal pages and contact

#### Authentication Pages

- **Login** (`/auth/login`): Email/username + password or Google OAuth
- **Register** (`/auth/register`): Two-step registration process
- **Forgot Password** (`/auth/forget-password`): Password reset flow

### Protected Pages (Main App)

#### Portal Dashboard (`/portal`)

- **Main Dashboard**: Unified interface for all media tracking
- **Media Tabs**: Movies, TV Shows, Books, Games
- **Navigation**: Tab-based navigation between media categories
- **Quick Access**: Direct access to discover, watch lists, and activity feeds

#### Media Tracking Pages

**Movies** (`/portal?tab=movies`)

- **Discover Tab**: Browse trending/popular movies
- **Watch List Tab**: Personal movie collections (Want to Watch, Watched)
- **Feed Tab**: Friends' movie activity and reviews
- **Movie Details**: Cast, crew, ratings, reviews, and tracking actions

**TV Shows** (`/portal?tab=tv-shows`)

- **Discover Tab**: Browse TV series
- **Watch List Tab**: Personal TV collections (Want to Watch, Watching, Completed, Stopped)
- **Feed Tab**: Friends' TV activity and reviews
- **Episode Tracking**: Individual episode management (watched/unwatched)

**Books** (`/portal?tab=books`)

- **Discover Tab**: Browse books by category and popularity
- **Reading List Tab**: Personal book collections (Want to Read, Read)
- **Feed Tab**: Friends' reading activity and reviews
- **Reading Progress**: Track pages read and reading completion

**Games** (`/portal?tab=games`)

- **Discover Tab**: Browse video games
- **Game Library Tab**: Personal game collections (Want to Play, Playing, Completed)
- **Feed Tab**: Friends' gaming activity and reviews
- **Game Details**: Metacritic scores, playtime, and ratings

#### Social Features

**User Profiles** (`/users/[username]`)

- **Public Profile**: Stats, collections, activity (for public users)
- **Private Profile**: Personal dashboard (when viewing own profile)
- **Follow/Unfollow**: Social connection management
- **Activity Timeline**: Recent tracking activity and reviews

**Activity Feeds** (Integrated in Media Tabs)

- **Movies Feed**: See what friends are watching and their reviews
- **TV Shows Feed**: Friends' TV watching activity and episode progress
- **Books Feed**: Friends' reading activity and book reviews
- **Games Feed**: Friends' gaming activity and game reviews

**Notifications** (`/notifications`)

- **Follow Requests**: Manage incoming follow requests
- **Activity Notifications**: Real-time updates from followed users

#### Settings (`/settings`)

- **Personal Info Tab**: Update profile information, avatar, bio
- **Security & Privacy Tab**: Change password, update email, manage privacy settings
  - **Security**: Password changes, email updates
  - **Privacy**: Profile visibility (public/private), data sharing controls

---

## 🔧 Core Features & Functionality

### 1. Media Tracking System

#### Status Management

Each media type supports different tracking statuses:

**Movies**:

- Want to Watch
- Watched (with watch count)

**TV Shows**:

- Want to Watch
- Watching
- Completed
- Stopped Watching

**Books**:

- Want to Read
- Read (with reading progress)

**Games**:

- Want to Play
- Playing
- Completed

#### Rating & Review System

- **Star Ratings**: 1-10 scale with decimal precision
- **Text Reviews**: Optional detailed comments
- **Public Sharing**: Reviews visible on item pages and user profiles

### 2. Social Features

#### Following System

- **Follow Requests**: For private accounts
- **Auto-Accept**: For public accounts
- **Activity Feeds**: See what friends are watching/reading/playing

#### Discovery Through Social

- **Friend Activity**: Recommendations based on social connections
- **Shared Reviews**: Community reviews and ratings
- **Trending Content**: Popular items among network

### 3. Real-time Notifications

#### Notification Types

- **Follow Requests**: When someone wants to follow you
- **Follow Accepted**: When your follow request is approved
- **New Followers**: When someone follows you

#### Real-time Updates

- **Redis Integration**: Instant notification delivery
- **WebSocket Support**: Live activity updates (planned)
- **Email Notifications**: Configurable notification preferences (planned)

### 4. User Profiles & Privacy

#### Profile Types

- **Public Profiles**: Visible to all users
- **Private Profiles**: Require follow approval for access

#### Profile Features

- **Statistics**: Total items tracked, ratings given, followers/following
- **Collections**: Organized lists by status and media type
- **Activity Timeline**: Recent tracking activity
- **Bio & Avatar**: Customizable profile information

### 5. Search & Discovery

#### Content Discovery

- **Trending**: Popular movies, shows, books, games
- **Search**: Full-text search across all media types
- **Categories**: Browse by genre, year, rating
- **Recommendations**: Personalized suggestions

#### Social Discovery

- **Friend Activity**: See what friends are engaging with
- **Popular in Network**: Trending content among connections
- **Review-Based**: Discover through community ratings

---

## 🔐 Authentication & Security

### Authentication Methods

1. **Local Authentication**: Email/username + password
2. **Google OAuth**: Single-click sign-in with Google
3. **Session Management**: Secure HTTP-only cookies

### Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **CSRF Protection**: Built-in NextAuth.js protection
- **Rate Limiting**: API rate limiting (planned)
- **SQL Injection Prevention**: Parameterized queries with Drizzle ORM

### Privacy Controls

- **Profile Visibility**: Public/private account settings
- **Data Sharing**: Granular control over shared information
- **Follow Approval**: Manual approval for follow requests
- **Activity Privacy**: Control what activities are visible

---

## 📡 API Integration

### TMDB (The Movie Database)

- **Movies**: Detailed movie information, cast, crew, ratings
- **TV Shows**: Series data, episode information, season details
- **Images**: Posters, backdrops, profile images
- **Search**: Full-text search across movies and TV content

### RAWG Video Games Database

- **Game Data**: Comprehensive game information, ratings, screenshots
- **Platforms**: Platform availability and requirements
- **Genres**: Game categorization and tagging
- **Metacritic**: Integrated critic scores

### Open Library

- **Book Data**: Author information, publication details, covers
- **ISBN Lookup**: Book identification and metadata
- **Author Details**: Biography and bibliography
- **Reading Stats**: Community reading statistics

### Cloudinary

- **Image Storage**: Secure, optimized image hosting
- **CDN Delivery**: Fast global image delivery
- **Transformations**: Automatic image optimization and resizing
- **User Avatars**: Profile picture management

### Upstash Redis

- **Caching**: API response caching for performance
- **Real-time**: Live notification broadcasting
- **Session Storage**: Temporary data storage
- **Rate Limiting**: API request throttling

---

## 🚀 Deployment & Infrastructure

### Environment Configuration

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# External APIs
TMDB_API_KEY=...
RAWG_API_KEY=...
OPEN_LIBRARY_API_KEY=...

# File Storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Redis
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Build & Deployment

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Development**: `npm run dev`
- **Database Migration**: `npm run db:migrate`

### Performance Optimizations

- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic route-based code splitting
- **Caching**: Redis caching for API responses
- **CDN**: Cloudinary CDN for static assets

---

## 📈 Future Enhancements

### Planned Features

- **Advanced Analytics**: Detailed viewing statistics and trends
- **Custom Lists**: User-created collections beyond default statuses
- **Import/Export**: Data portability features
- **Mobile App**: React Native companion app
- **Advanced Search**: Filters, sorting, and advanced queries
- **Calendar Integration**: Release date tracking and reminders

### Technical Improvements

- **GraphQL API**: More efficient data fetching
- **WebSocket Support**: Real-time collaborative features
- **Progressive Web App**: Offline functionality
- **Advanced Caching**: Service worker implementation
- **Testing Suite**: Comprehensive unit and integration tests

---

## 👥 User Personas

### Media Enthusiast

- **Profile**: Heavy user tracking 50+ items per category
- **Needs**: Advanced filtering, detailed statistics, export features
- **Usage**: Daily tracking, social engagement, discovery

### Casual User

- **Profile**: Light user tracking 5-20 items per category
- **Needs**: Simple interface, basic tracking, social features
- **Usage**: Weekly check-ins, occasional reviews

### Social Connector

- **Profile**: Focus on social features and community
- **Needs**: Activity feeds, friend recommendations, public profile
- **Usage**: Daily social interaction, content discovery

### Private Tracker

- **Profile**: Private account, personal organization focus
- **Needs**: Privacy controls, detailed organization, minimal social
- **Usage**: Personal library management, progress tracking

---

## 📊 Analytics & Metrics

### User Engagement Metrics

- **Daily Active Users**: Track daily app usage
- **Session Duration**: Average time spent per session
- **Feature Usage**: Most used features and pages
- **Conversion Rates**: Registration to active user conversion

### Content Metrics

- **Items Tracked**: Total items in database by type
- **Review Activity**: Number of reviews and average ratings
- **Social Connections**: Follow relationships and network size
- **API Usage**: External API call volumes and success rates

### Performance Metrics

- **Response Times**: API endpoint performance
- **Error Rates**: Application error tracking
- **Cache Hit Rates**: Redis caching effectiveness
- **Image Load Times**: Cloudinary delivery performance

---

## 🐛 Known Issues & Limitations

### Current Limitations

- **Episode Tracking**: TV episode tracking is basic (watched/unwatched only)
- **Bulk Operations**: No bulk add/remove operations
- **Advanced Filtering**: Limited filtering and sorting options
- **Mobile Experience**: Not optimized for mobile devices
- **Offline Support**: No offline functionality

### Technical Debt

- **Testing Coverage**: Limited automated testing
- **Error Handling**: Inconsistent error handling across API routes
- **Type Safety**: Some areas lack full TypeScript coverage
- **Performance**: Some queries could be optimized

---

## 📚 Development Guidelines

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Airbnb configuration with Next.js overrides
- **Prettier**: Consistent code formatting
- **Conventional Commits**: Structured commit messages

### API Design

- **RESTful**: Standard REST API patterns
- **JSON Responses**: Consistent response format
- **Error Handling**: Standardized error responses

### Database Practices

- **Migrations**: Version-controlled schema changes
- **Indexing**: Proper database indexing for performance
- **Constraints**: Foreign key constraints and data integrity
- **Transactions**: Atomic operations where necessary

---

## 🤝 Contributing

### Development Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npm run db:migrate`
5. Start development server: `npm run dev`

### Code Review Process

- **Pull Requests**: All changes require PR review
- **Testing**: Manual testing required for UI changes
- **Documentation**: Update docs for API/feature changes
- **Migration**: Database changes require migration files

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/\***: Feature branches
- **hotfix/\***: Critical bug fixes

---

_This documentation is continuously updated as the application evolves. Last updated: November 27, 2025_</content>
<parameter name="filePath">d:\aProjects\Projects\zMyGitHub\track-verse\docs\OUR_APP.md
