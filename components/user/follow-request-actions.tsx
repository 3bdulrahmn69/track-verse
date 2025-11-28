'use client';

import { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

interface FollowRequestActionsProps {
  userId: string;
}

export function FollowRequestActions({ userId }: FollowRequestActionsProps) {
  const [hasFollowRequest, setHasFollowRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const checkFollowRequest = async () => {
      try {
        const response = await fetch(`/api/follow?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setHasFollowRequest(data.hasFollowRequest);
        }
      } catch (error) {
        console.error('Error checking follow request:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFollowRequest();
  }, [userId]);

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      if (response.ok) {
        setHasFollowRequest(false);
        window.location.reload();
      } else {
        console.error('Failed to accept follow request');
      }
    } catch (error) {
      console.error('Error accepting follow request:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/follow/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });

      if (response.ok) {
        setHasFollowRequest(false);
        window.location.reload();
      } else {
        console.error('Failed to reject follow request');
      }
    } catch (error) {
      console.error('Error rejecting follow request:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !hasFollowRequest) {
    return null;
  }

  return (
    <div className="flex gap-2 justify-center">
      <button
        onClick={handleAccept}
        disabled={processing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success text-success-foreground hover:bg-success/90 transition-colors disabled:opacity-50 font-medium"
      >
        <FiCheck className="w-4 h-4" />
        Accept
      </button>
      <button
        onClick={handleReject}
        disabled={processing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 font-medium"
      >
        <FiX className="w-4 h-4" />
        Reject
      </button>
    </div>
  );
}
