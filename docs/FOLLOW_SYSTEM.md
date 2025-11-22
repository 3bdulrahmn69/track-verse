# Follow System Documentation

## Overview

The Follow System enables users to connect with each other and view their friends' movie and TV show activities. The system includes follow requests with accept/reject functionality, real-time notifications, and activity feeds.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [User Interface Components](#user-interface-components)
5. [Usage Guide](#usage-guide)
6. [Technical Implementation](#technical-implementation)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                    Follow System                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Database   │  │  API Routes  │  │  UI Components│  │
│  │              │  │              │  │               │  │
│  │ • Follows    │──│ • Follow API │──│ • Feed Tabs   │  │
│  │ • Notifs     │  │ • Notif API  │  │ • Notif Page  │  │
│  │              │  │ • Feed API   │  │ • Follow Btn  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Follow Request Flow**

   ```
   User A → Click Follow → API creates pending follow → Notification sent to User B
   User B → Accept/Reject → API updates follow status → Notification sent to User A
   ```

2. **Activity Feed Flow**
   ```
   User watches movie/show → Database updated → Feed API fetches activities
   Followers see activity → Feed Tab displays content
   ```

---

## Database Schema

### User Follows Table (`user_follows`)

Stores follow relationships between users.

```typescript
{
  id: uuid (primary key)
  followerId: uuid (foreign key → users.id)  // User who is following
  followingId: uuid (foreign key → users.id) // User being followed
  status: enum ['pending', 'accepted', 'rejected']
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Status Types:**

- `pending`: Follow request sent, awaiting response
- `accepted`: Follow request accepted, users are connected
- `rejected`: Follow request rejected

### Notifications Table (`notifications`)

Stores notification events for users.

```typescript
{
  id: uuid (primary key)
  userId: uuid (foreign key → users.id)        // Recipient
  fromUserId: uuid (foreign key → users.id)    // Sender
  type: enum ['follow_request', 'follow_accepted']
  followId: uuid (foreign key → user_follows.id, nullable)
  read: boolean (default: false)
  createdAt: timestamp
}
```

**Notification Types:**

- `follow_request`: Someone wants to follow you
- `follow_accepted`: Your follow request was accepted

---

## API Endpoints

### Follow Management

#### `POST /api/follow`

Send a follow request to another user.

**Request Body:**

```json
{
  "userId": "uuid-of-target-user"
}
```

**Response:**

```json
{
  "message": "Follow request sent",
  "follow": {
    "id": "uuid",
    "followerId": "uuid",
    "followingId": "uuid",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Error Cases:**

- `401`: Unauthorized (not logged in)
- `400`: Can't follow yourself, Already following, Request already sent
- `404`: User not found

---

#### `GET /api/follow?userId={userId}`

Get follow status with a specific user.

**Query Parameters:**

- `userId` (optional): Check status with specific user

**Response (with userId):**

```json
{
  "isFollowing": true,        // You follow them (accepted)
  "followRequestSent": false, // You sent pending request
  "isFollower": true,         // They follow you (accepted)
  "hasFollowRequest": false   // They sent you pending request
}
```

**Response (without userId):**

```json
{
  "following": [
    {
      "id": "follow-id",
      "userId": "user-id",
      "username": "johndoe",
      "fullname": "John Doe",
      "image": "url",
      "status": "accepted",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "followers": [...]
}
```

---

#### `DELETE /api/follow?userId={userId}`

Unfollow a user.

**Query Parameters:**

- `userId`: User to unfollow

**Response:**

```json
{
  "message": "Unfollowed successfully"
}
```

---

#### `PATCH /api/follow/{userId}`

Accept or reject a follow request.

**URL Parameters:**

- `userId`: User who sent the follow request

**Request Body:**

```json
{
  "action": "accept" // or "reject"
}
```

**Response:**

```json
{
  "message": "Follow request accepted",
  "follow": {
    "id": "uuid",
    "status": "accepted",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Notifications

#### `GET /api/notifications?unreadOnly={boolean}`

Get user notifications.

**Query Parameters:**

- `unreadOnly` (optional): If true, returns only unread notifications

**Response:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "follow_request",
      "read": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "followId": "uuid",
      "followStatus": "pending",
      "fromUser": {
        "id": "uuid",
        "username": "johndoe",
        "fullname": "John Doe",
        "image": "url"
      }
    }
  ],
  "unreadCount": 5
}
```

---

#### `PATCH /api/notifications`

Mark notifications as read.

**Request Body:**

```json
{
  "notificationIds": ["uuid1", "uuid2"]
}
```

**Response:**

```json
{
  "message": "Notifications marked as read"
}
```

---

#### `DELETE /api/notifications?id={notificationId}`

Delete a notification.

**Query Parameters:**

- `id`: Notification ID to delete

**Response:**

```json
{
  "message": "Notification deleted"
}
```

---

### Activity Feeds

#### `GET /api/feed/movies`

Get movie activities from followed users.

**Response:**

```json
{
  "activities": [
    {
      "id": "uuid",
      "movieId": 12345,
      "movieTitle": "Movie Title",
      "moviePosterPath": "/path.jpg",
      "status": "watched",
      "watchCount": 2,
      "userRating": 5,
      "userComment": "Great movie!",
      "updatedAt": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "username": "johndoe",
        "fullname": "John Doe",
        "image": "url"
      }
    }
  ]
}
```

---

#### `GET /api/feed/tv-shows`

Get TV show activities from followed users.

**Response:**

```json
{
  "activities": [
    {
      "id": "uuid",
      "tvShowId": 12345,
      "tvShowName": "Show Name",
      "tvShowPosterPath": "/path.jpg",
      "status": "watching",
      "totalEpisodes": 100,
      "watchedEpisodes": 45,
      "updatedAt": "2024-01-01T00:00:00Z",
      "userId": "uuid",
      "username": "johndoe",
      "fullname": "John Doe",
      "userImage": "url"
    }
  ]
}
```

---

## User Interface Components

### Notification Bell (User Menu)

**Location:** `components/shared/user-menu.tsx`

**Features:**

- Bell icon with badge showing unread count
- Auto-refreshes every 30 seconds
- Links to `/notifications` page
- Badge displays "9+" when count exceeds 9

**Usage:**

```tsx
<UserMenu />
```

---

### Notifications Page

**Location:** `app/notifications/page.tsx`

**Features:**

- Display all notifications (follow requests & acceptances)
- Filter: All / Unread
- Mark all as read button
- Accept/Reject actions for follow requests
- Real-time status updates
- Relative timestamps ("2 hours ago")

**Route:** `/notifications`

---

### Follow Request Card

**Location:** `components/notifications/follow-request-card.tsx`

**Features:**

- User avatar and name
- Accept/Reject buttons
- Different states:
  - Active request (pending)
  - Already accepted/rejected
  - Follow accepted notification
- Loading states during actions

**Props:**

```typescript
{
  notification: Notification
  onUpdate: () => void  // Callback after action
}
```

---

### Feed Tabs

#### Movie Feed Tab

**Location:** `components/tabs/movies/feed-tab.tsx`

**Features:**

- Shows movie activities from followed users
- Displays: watched, rewatched, added to watch list
- Shows ratings and comments
- Links to movie details and user profiles
- Empty state when no followers

#### TV Show Feed Tab

**Location:** `components/tabs/tv-shows/feed-tab.tsx`

**Features:**

- Shows TV show activities from followed users
- Displays: watching, completed, stopped watching
- Shows episode progress bars
- Season/episode counts
- Links to show details and user profiles

---

## Usage Guide

### For Users

#### Following Someone

1. Navigate to a user's profile (future feature) or see them in activity
2. Click the "Follow" button
3. A follow request is sent
4. The user receives a notification
5. Wait for them to accept

#### Managing Follow Requests

1. Click the notification bell icon (top right)
2. See pending follow requests
3. Click "Accept" to approve or "Reject" to decline
4. The other user is notified of your decision

#### Viewing Activity Feed

1. Go to Portal
2. Navigate to Movies or TV Shows section
3. Click the "Feed" tab (first tab)
4. See activities from people you follow:
   - Movies they watched
   - TV shows they're watching
   - Ratings and comments
   - Episode progress

#### Unfollowing Someone

1. Navigate to their profile
2. Click "Unfollow" button
3. Confirmation dialog appears
4. Confirm to remove the connection

---

### For Developers

#### Creating a Follow Request

```typescript
const response = await fetch('/api/follow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: targetUserId })
});

const data = await response.json();
```

#### Checking Follow Status

```typescript
const response = await fetch(`/api/follow?userId=${userId}`);
const status = await response.json();

if (status.isFollowing) {
  // Show "Unfollow" button
} else if (status.followRequestSent) {
  // Show "Request Sent" button
} else {
  // Show "Follow" button
}
```

#### Accepting a Follow Request

```typescript
const response = await fetch(`/api/follow/${followerId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'accept' })
});
```

#### Fetching Activity Feed

```typescript
// Movies
const moviesResponse = await fetch('/api/feed/movies');
const { activities } = await moviesResponse.json();

// TV Shows
const showsResponse = await fetch('/api/feed/tv-shows');
const { activities } = await showsResponse.json();
```

---

## Technical Implementation

### Security Considerations

1. **Authorization Checks**

   - All endpoints require authentication
   - Users can only manage their own follows/notifications
   - Follow requests validated for self-following prevention

2. **Data Validation**

   - User IDs validated before database operations
   - Follow status transitions validated
   - Notification types restricted to enum values

3. **Privacy**
   - Users only see activities from accepted follows
   - Pending requests don't grant access to activity feed
   - Rejected requests are hidden from UI

### Performance Optimizations

1. **Database Queries**

   - Indexed foreign keys for fast lookups
   - Batch operations for multiple notifications
   - Limited feed results (50 items max)

2. **Client-Side**

   - Polling interval (30s) for notification updates
   - Tab caching to prevent re-fetching
   - Optimistic UI updates

3. **Caching Strategy**
   - Feed results cached client-side
   - Notification count cached with periodic refresh
   - User profile data reused across components

### Database Migrations

To create the new tables, run:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

**Required Tables:**

- `user_follows`
- `notifications`

**Required Enums:**

- `follow_status` (pending, accepted, rejected)
- `notification_type` (follow_request, follow_accepted)

---

## Future Enhancements

### Planned Features

1. **User Profiles with Follow Button**

   - Public user profile pages at `/users/{username}`
   - Follow/Unfollow button on profiles
   - Follower/Following counts

2. **Enhanced Notifications**

   - New movie/show added by followed users
   - Milestone celebrations (100th movie watched)
   - Weekly summary notifications

3. **Privacy Settings**

   - Private accounts requiring approval
   - Hide activity from specific users
   - Custom notification preferences

4. **Social Features**

   - Comments on activities
   - Like/React to friend activities
   - Shared watch lists
   - Watch parties/group watching

5. **Feed Improvements**
   - Infinite scroll
   - Filter by content type
   - Sort by date/popularity
   - Search within feed

---

## Troubleshooting

### Common Issues

**Issue:** Notifications not appearing

- **Solution:** Check browser console for errors, verify API endpoint is accessible, ensure WebSocket connection (if implemented)

**Issue:** Follow request stuck in pending

- **Solution:** Check database for follow record, verify notification was created, ensure both users exist

**Issue:** Feed empty despite following users

- **Solution:** Verify follows are accepted status, check if followed users have activity, ensure feed API returns data

**Issue:** Can't unfollow user

- **Solution:** Check for database constraints, verify user IDs are correct, ensure no orphaned notifications

---

## API Response Codes

| Code | Meaning      | Common Causes                          |
| ---- | ------------ | -------------------------------------- |
| 200  | Success      | Request completed successfully         |
| 401  | Unauthorized | Not logged in, session expired         |
| 400  | Bad Request  | Invalid data, business logic violation |
| 404  | Not Found    | User doesn't exist, resource missing   |
| 500  | Server Error | Database error, unexpected exception   |

---

## Contact & Support

For issues, questions, or feature requests related to the follow system, please:

1. Check this documentation
2. Review the code in relevant files
3. Check the database schema
4. Test API endpoints directly

---

## Version History

### v1.0.0 (Current)

- Initial follow system implementation
- Follow requests with accept/reject
- Notifications system
- Activity feeds for movies and TV shows
- User menu notification bell
- Feed tabs in portal

---

**Last Updated:** November 22, 2025
