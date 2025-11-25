'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiStar, FiCalendar, FiClock, FiTrash2, FiEdit3 } from 'react-icons/fi';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import { toast } from 'react-toastify';

interface EpisodeReview {
  id: string;
  userId: string;
  userName: string;
  username: string | null;
  userImage: string | null;
  userRating: number | null;
  userComment: string | null;
  createdAt: string;
}

interface EpisodeDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  episode: {
    name: string;
    overview: string;
    still_path: string | null;
    episode_number: number;
    season_number: number;
    air_date?: string;
    runtime?: number;
  };
  tvShowId: number;
  onSubmitReview: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
}

export function EpisodeDetailsDialog({
  isOpen,
  onClose,
  episode,
  tvShowId,
  onSubmitReview,
  initialRating = 0,
  initialComment = '',
}: EpisodeDetailsDialogProps) {
  const { data: session } = useSession();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [reviews, setReviews] = useState<EpisodeReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(
    initialRating > 0 || initialComment.length > 0
  );
  const [showReviews, setShowReviews] = useState(true);

  const loadReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const episodeId = `${tvShowId}-S${episode.season_number}E${episode.episode_number}`;
      const response = await fetch(
        `/api/reviews?itemId=${episodeId}&itemType=tv_episode`
      );
      if (response.ok) {
        const data = await response.json();
        const allReviews = data.comments || [];
        setReviews(allReviews);

        // Check if user has a review
        const userReview = allReviews.find(
          (review: EpisodeReview) => review.userId === session?.user?.id
        );
        setHasUserReviewed(!!userReview);

        if (userReview) {
          setRating(userReview.userRating || 0);
          setComment(userReview.userComment || '');
        }
      } else {
        console.error('Failed to fetch reviews:', response.statusText);
        setReviews([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  }, [
    tvShowId,
    episode.season_number,
    episode.episode_number,
    session?.user?.id,
  ]);

  // Load reviews when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadReviews();
    }
  }, [isOpen, episode.episode_number, episode.season_number, loadReviews]);

  // Update local state when initial values change
  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment);
    setHasUserReviewed(initialRating > 0 || initialComment.length > 0);
  }, [initialRating, initialComment]);

  const handleSubmit = async () => {
    if (rating === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitReview(rating, comment);
      setHasUserReviewed(true);
      setShowReviews(true);
      // Reload reviews after submitting
      await loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      // Find user's review to get the reviewId
      const userReview = reviews.find(
        (review) => review.userId === session?.user?.id
      );

      if (!userReview) {
        toast.error('Review not found');
        return;
      }

      const response = await fetch('/api/reviews', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: userReview.id }),
      });

      if (response.ok) {
        setHasUserReviewed(false);
        setRating(0);
        setComment('');
        await loadReviews();
        toast.success('Review deleted successfully');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  const dialogContent = (
    <div className="max-h-[60vh] overflow-y-auto enhanced-scrollbar px-4">
      {/* Episode Image */}
      {episode.still_path && (
        <div className="relative w-full aspect-video mb-4">
          <Image
            src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
            alt={episode.name}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      )}

      {/* Episode Info */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">
          {episode.episode_number}. {episode.name}
        </h3>

        {/* Episode Meta */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
          {episode.air_date && (
            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              <span>
                {new Date(episode.air_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
          {episode.runtime && (
            <div className="flex items-center gap-2">
              <FiClock className="w-4 h-4" />
              <span>{episode.runtime} min</span>
            </div>
          )}
        </div>

        {/* Overview */}
        {episode.overview && (
          <p className="text-foreground leading-relaxed">{episode.overview}</p>
        )}
      </div>

      {/* Review Form - Only show if user hasn't reviewed or is editing */}
      {(!hasUserReviewed || !showReviews) && (
        <div className="border-t border-border pt-6 mb-6">
          <h4 className="text-lg font-semibold text-foreground mb-4">
            {hasUserReviewed ? 'Edit Your Review' : 'Add Your Review'}
          </h4>

          {/* Star Rating */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <FiStar
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-warning text-warning'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Comment (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this episode..."
              className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground resize-none"
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting
                ? 'Submitting...'
                : hasUserReviewed
                ? 'Update Review'
                : 'Submit Review'}
            </Button>
            {hasUserReviewed && (
              <Button onClick={() => setShowReviews(true)} variant="outline">
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      {/* All Reviews Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">
            Reviews ({reviews.length})
          </h4>
        </div>

        {loadingReviews ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No reviews yet. Be the first to review this episode!
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => {
              const isCurrentUser = review.userId === session?.user?.id;
              return (
                <div
                  key={review.id}
                  className={`rounded-lg p-4 border ${
                    isCurrentUser
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="shrink-0">
                      <Avatar
                        src={review.userImage}
                        alt={review.userName || 'User'}
                        size="sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {review.username ? (
                          <Link
                            href={`/users/${review.username}`}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {review.userName || 'Anonymous'}
                            {isCurrentUser && (
                              <span className="text-xs text-primary ml-2">
                                (You)
                              </span>
                            )}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">
                            {review.userName || 'Anonymous'}
                            {isCurrentUser && (
                              <span className="text-xs text-primary ml-2">
                                (You)
                              </span>
                            )}
                          </span>
                        )}
                        {isCurrentUser && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setShowReviews(false)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                              title="Edit review"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleDeleteReview}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                              title="Delete review"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      {review.userRating && (
                        <div className="mb-2">
                          {renderStars(review.userRating)}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {review.userComment && (
                    <p className="text-foreground leading-relaxed">
                      {review.userComment}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const dialogFooter = (
    <Button variant="outline" onClick={onClose} className="w-full">
      Close
    </Button>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      footer={dialogFooter}
      className="max-w-4xl"
      showCloseButton={true}
    >
      {dialogContent}
    </Dialog>
  );
}
