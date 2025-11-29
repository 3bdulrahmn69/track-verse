'use client';

import { useState } from 'react';
import { FiCheck, FiX, FiUserPlus } from 'react-icons/fi';
import { Avatar } from '@/components/ui/avatar';
import { Popover } from '@/components/ui/popover';
import Link from 'next/link';

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

interface FollowRequestCardProps {
  notification: Notification;
}

export function FollowRequestCard({ notification }: FollowRequestCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/follow/${notification.fromUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        console.log(`You are now following ${notification.fromUser.fullname}`);
      } else {
        const data = await response.json();
        console.error(data.error || 'Failed to accept follow request');
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (notification.read) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notification.id] }),
      });

      if (response.ok) {
        console.log('Notification marked as read');
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/follow/${notification.fromUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        console.log('Follow request rejected');
      } else {
        const data = await response.json();
        console.error(data.error || 'Failed to reject follow request');
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  if (notification.type === 'follow') {
    return (
      <div
        className={`p-4 border border-border rounded-lg ${
          notification.read ? 'bg-card' : 'bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <Link href={`/users/${notification.fromUser.username}`}>
            <Avatar
              src={notification.fromUser.image}
              alt={notification.fromUser.fullname}
              size="md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiUserPlus className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-sm text-foreground">
                <Link
                  href={`/users/${notification.fromUser.username}`}
                  className="font-semibold hover:underline"
                >
                  {notification.fromUser.fullname}
                </Link>{' '}
                started following you
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDate(notification.createdAt)}
              </p>
              {!notification.read && (
                <Popover content="Mark as read" position="left">
                  <button
                    onClick={handleMarkAsRead}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-8 h-8 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notification.type === 'follow_accepted') {
    return (
      <div
        className={`p-4 border border-border rounded-lg ${
          notification.read ? 'bg-card' : 'bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <Link href={`/users/${notification.fromUser.username}`}>
            <Avatar
              src={notification.fromUser.image}
              alt={notification.fromUser.fullname}
              size="md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiCheck className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-sm text-foreground">
                <Link
                  href={`/users/${notification.fromUser.username}`}
                  className="font-semibold hover:underline"
                >
                  {notification.fromUser.fullname}
                </Link>{' '}
                accepted your follow request
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {formatDate(notification.createdAt)}
              </p>
              {!notification.read && (
                <Popover content="Mark as read" position="left">
                  <button
                    onClick={handleMarkAsRead}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-8 h-8 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If already handled (accepted/rejected), show status
  if (
    notification.followStatus === 'accepted' ||
    notification.followStatus === 'rejected'
  ) {
    return (
      <div
        className={`p-4 border border-border rounded-lg ${
          notification.read ? 'bg-card' : 'bg-muted/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <Link href={`/users/${notification.fromUser.username}`}>
            <Avatar
              src={notification.fromUser.image}
              alt={notification.fromUser.fullname}
              size="md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FiUserPlus className="w-5 h-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-foreground">
                <Link
                  href={`/users/${notification.fromUser.username}`}
                  className="font-semibold hover:underline"
                >
                  {notification.fromUser.fullname}
                </Link>{' '}
                wants to follow you
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {formatDate(notification.createdAt)}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {notification.followStatus === 'accepted'
                    ? 'Request accepted'
                    : 'Request rejected'}
                </p>
              </div>
              {!notification.read && (
                <Popover content="Mark as read" position="left">
                  <button
                    onClick={handleMarkAsRead}
                    disabled={isProcessing}
                    className="flex items-center justify-center w-8 h-8 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                  </button>
                </Popover>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active follow request
  return (
    <div
      className={`p-4 border border-border rounded-lg ${
        notification.read ? 'bg-card' : 'bg-muted/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <Link href={`/users/${notification.fromUser.username}`}>
          <Avatar
            src={notification.fromUser.image}
            alt={notification.fromUser.fullname}
            size="md"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FiUserPlus className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  <Link
                    href={`/users/${notification.fromUser.username}`}
                    className="font-semibold hover:underline"
                  >
                    {notification.fromUser.fullname}
                  </Link>{' '}
                  wants to follow you
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {formatDate(notification.createdAt)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  Accept
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>

            {!notification.read && (
              <Popover content="Mark as read" position="left">
                <button
                  onClick={handleMarkAsRead}
                  disabled={isProcessing}
                  className="flex items-center justify-center w-8 h-8 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-50 ml-4"
                >
                  <FiCheck className="w-4 h-4" />
                </button>
              </Popover>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
