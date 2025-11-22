'use client';

import { useEffect, useState } from 'react';
import { FiStar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { RatingDialog } from '@/components/ui/rating-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useMovieStatus } from '@/hooks/use-movie-status';
import { Avatar } from '@/components/ui/avatar';

interface MovieComment {
  id: string;
  userId: string;
  userName: string;
  username: string;
  userImage: string | null;
  userRating: number;
  userComment: string;
  createdAt: string;
}

interface MovieCommentsProps {
  movieId: number;
  movieTitle: string;
}

export function MovieComments({ movieId, movieTitle }: MovieCommentsProps) {
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [showAddReview, setShowAddReview] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const { status: movieStatus } = useMovieStatus(movieId);

  // Check if current user has already reviewed
  const userReview = comments.find((c) => c.userId === session?.user?.id);
  const hasUserReviewed = !!userReview;

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/movies/${movieId}/comments`);

      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: MovieComment) => {
    setEditingCommentId(comment.id);
    setEditRating(comment.userRating);
    setEditComment(comment.userComment);
  };

  const handleUpdateReview = async (rating: number, comment: string) => {
    try {
      const response = await fetch(`/api/movies/${movieId}/comments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: editingCommentId,
          userRating: rating,
          userComment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      toast.success('Review updated successfully!');
      setEditingCommentId(null);
      fetchComments();
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Failed to update review');
    }
  };

  const handleAddReview = async (rating: number, comment: string) => {
    try {
      // Backend will handle marking as watched automatically
      const response = await fetch(`/api/movies/${movieId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRating: rating,
          userComment: comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add review');
      }

      toast.success('Review added successfully!');
      setShowAddReview(false);
      fetchComments();

      // Trigger a re-fetch of movie status to update UI
      window.dispatchEvent(new Event('movieStatusChanged'));
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Failed to add review');
    }
  };

  const handleDelete = async (commentId: string) => {
    setDeletingCommentId(commentId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingCommentId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/movies/${movieId}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId: deletingCommentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      toast.success('Review deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingCommentId(null);
      fetchComments();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId]);

  // Refetch comments when movie status changes (in case a review was added)
  useEffect(() => {
    if (movieStatus === 'watched') {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <RatingDialog
        isOpen={!!editingCommentId}
        onClose={() => setEditingCommentId(null)}
        movieTitle="Update Your Review"
        onSubmit={handleUpdateReview}
        initialRating={editRating}
        initialComment={editComment}
      />
      <RatingDialog
        isOpen={showAddReview}
        onClose={() => setShowAddReview(false)}
        movieTitle={movieTitle}
        onSubmit={handleAddReview}
      />
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingCommentId(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmText="Delete"
        isLoading={isDeleting}
        confirmVariant="destructive"
      />
      <div className="space-y-6 py-6">
        {/* Add Review Button - Only show if user hasn't reviewed */}
        {session && !hasUserReviewed && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddReview(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              <FiStar className="w-5 h-5" />
              <span>Add Review</span>
            </button>
          </div>
        )}

        {comments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiStar className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Reviews Yet
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Be the first to share your thoughts about this movie!
            </p>
            {session && !hasUserReviewed && (
              <button
                onClick={() => setShowAddReview(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                <FiStar className="w-5 h-5" />
                <span>Write the First Review</span>
              </button>
            )}
          </div>
        )}

        {comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment) => {
              const isOwnReview = session?.user?.id === comment.userId;

              return (
                <div
                  key={comment.id}
                  className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* User Info */}
                  <div className="flex items-start gap-4 mb-4">
                    <Link
                      href={`/users/${comment.username}`}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <Avatar
                        src={comment.userImage}
                        alt={comment.userName}
                        size="md"
                      />
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/users/${comment.username}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {comment.userName}
                          </Link>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, index) => (
                              <FiStar
                                key={index}
                                className={`w-4 h-4 ${
                                  index < comment.userRating
                                    ? 'text-warning fill-warning'
                                    : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        {isOwnReview && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(comment)}
                              className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                              title="Edit review"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(comment.id)}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                              title="Delete review"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {new Date(comment.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>

                      {comment.userComment && (
                        <p className="text-foreground leading-relaxed">
                          {comment.userComment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
