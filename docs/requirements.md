# Track Verse - Requirements Document

## Overview

### App Name

Track Verse

### App Goal

Track Verse is a comprehensive tracking application that allows users to monitor and manage their consumption of various media and activities, including movies, series, games, books, and more. The app aims to provide an immersive, gamified experience where users navigate a virtual world to access different tracking categories. The core slogan is "Everything, Everywhere, All at once," emphasizing scalability and the ability to track any aspect of life.

### Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Three.js (@react-three/fiber for React integration), TypeScript
- **State Management & Data Fetching**: TanStack Query (React Query)
- **Backend/Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with google auth, email/password, username/password
- **Deployment**: (To be determined - e.g., Vercel, Netlify)

## Database Schema

### User Table

- id: UUID primary key
- fullname: VARCHAR(255)
- email: VARCHAR(255) UNIQUE
- username: VARCHAR(255) UNIQUE
- password: VARCHAR(255) (hashed)
- date_of_birth: DATE
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- google_id: VARCHAR(255) (for Google OAuth)
- provider: VARCHAR(50) DEFAULT 'local' (e.g., 'local', 'google')

## Features

### Public Pages (No Three.js)

These pages are standard web pages without 3D elements, focusing on user onboarding and authentication.

1. **Landing Page**

   - Header with navigation to sections and theme toggle (system/dark/light)
   - Hero section with app name, slogan, and call-to-action (CTA) to sign up/login
   - About section explaining the app and why it's unique
   - Brief overview of app features and benefits
   - Testimonials or demo screenshots (placeholder for now)
   - Footer with links to privacy policy, terms of service, etc.
   - Responsive design using Tailwind CSS

2. **Register Page**

   - Form fields: Email, password, confirm password, optional username
   - Validation: Email format, password strength (min 8 chars, special chars), password match
   - Terms and conditions checkbox
   - Link to login page
   - Error handling for duplicate emails, weak passwords
   - Success redirect to login or email verification

3. **Login Page**

   - Form fields: Email, password
   - "Remember me" checkbox
   - Link to forgot password
   - Link to register
   - Error handling for invalid credentials
   - Success redirect to main app

4. **Forgot Password Page**

   - Form field: Email
   - Send reset link to email
   - Confirmation message
   - Link back to login

5. **Reset Password Page**
   - Accessed via email link (token-based)
   - Form fields: New password, confirm password
   - Validation: Password strength
   - Success message and redirect to login

### Main App (Three.js Immersive Experience)

After authentication, users enter the main app, which is a 3D virtual world built with Three.js. The world represents a "real-world" environment with four main areas. A main character (avatar) navigates the world and "joins" areas to access tracking features.

#### Core Concept

- **Virtual World**: A 3D scene with buildings/areas for Cinema, Home, Library, and Cybercafe.
- **Character Movement**: User controls an avatar to move around and interact with areas.
- **Interaction**: Clicking/entering an area transitions to that category's tracking interface (overlay or new scene).
- **Scalability**: Designed to add more areas (e.g., Bookstore, Gym) in the future.

#### Main Areas

1. **Cinema**

   - Tracks movies and series
   - Features: Add watched films, rate/review, watchlist, recommendations
   - 3D Element: Movie theater building with posters/screens

2. **Home**

   - Tracks personal/home-related activities (e.g., chores, habits, daily logs)
   - Features: Task lists, habit trackers, journal entries
   - 3D Element: House/apartment model

3. **Library**

   - Tracks books and reading progress
   - Features: Reading lists, progress tracking, notes, quotes
   - 3D Element: Library building with bookshelves

4. **Cybercafe**
   - Tracks video games
   - Features: Game library, playtime tracking, achievements, reviews
   - 3D Element: Cafe with arcade machines/consoles

#### General Main App Features

- **Navigation**: 3D movement controls (WASD or click-to-move)
- **UI Overlays**: When in an area, show category-specific UI (e.g., lists, forms) overlaid on the 3D scene
- **Data Persistence**: All tracking data stored in PostgreSQL via Drizzle ORM
- **Real-time Sync**: TanStack Query for fetching/updating data
- **Responsive**: 3D scene adapts to screen size; UI remains usable on mobile (though 3D may be simplified)
- **Accessibility**: Keyboard navigation, screen reader support for UI elements

## Scalability and Future Features

- **Modular Areas**: Easy to add new tracking categories (e.g., Music, Travel, Fitness) by creating new 3D models and UI modules
- **API Design**: RESTful or GraphQL API for data operations
- **User Profiles**: Avatars, stats, achievements across categories
- **Social Features**: Share progress, leaderboards (future)
- **Offline Support**: PWA capabilities for offline tracking
- **Integrations**: Import from external services (e.g., Goodreads for books, Steam for games)

## Non-Functional Requirements

- **Performance**: 3D scenes load quickly; data fetches cached via TanStack Query
- **Security**: Secure auth with NextAuth; data encryption in DB
- **Usability**: Intuitive 3D navigation; clear UI for tracking actions
- **Testing**: Unit tests for components/utilities; E2E tests for auth and tracking flows
- **Documentation**: API docs, component library, deployment guides

## Development Phases

1. **Phase 1**: Public pages and auth setup
2. **Phase 2**: Basic 3D world and one area (e.g., Cinema)
3. **Phase 3**: Add remaining areas and full tracking features
4. **Phase 4**: Scalability enhancements and optimizations

## Assumptions and Constraints

- Users have modern browsers with WebGL support for Three.js
- Initial focus on desktop; mobile optimization later
- Data models designed for extensibility (e.g., generic "item" types for different categories)
