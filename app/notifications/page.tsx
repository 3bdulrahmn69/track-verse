'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { FollowRequestCard } from '@/components/notifications/follow-request-card';
import BackButton from '@/components/shared/back-button';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

interface Notification {
  id: string;
  type: 'follow_request' | 'follow_accepted' | 'follow';
  read: boolean;
  createdAt: string;
  followId: string | null;
  followStatus?: string | null;
  fromUser: {
    id: string;
    username: string;
    fullname: string;
    image: string | null;
  };
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
  }, [status]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/notifications?unreadOnly=${filter === 'unread'}`
      );
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifications();
    }
  }, [session, filter, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      const unreadNotificationIds = notifications
        .filter((n) => !n.read)
        .map((n) => n.id);

      if (unreadNotificationIds.length === 0) return;

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadNotificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            unreadNotificationIds.includes(n.id) ? { ...n, read: true } : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayedNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <BackButton />
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  You have {unreadCount} unread notification
                  {unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <FiCheck className="w-4 h-4" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-6 p-1 bg-muted rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notifications List */}
        {displayedNotifications.length > 0 ? (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <FollowRequestCard
                key={notification.id}
                notification={notification}
                onUpdate={fetchNotifications}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FiBell className="text-6xl mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No notifications
            </h3>
            <p className="text-muted-foreground max-w-md">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet. When someone follows you, you'll see it here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
