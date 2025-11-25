'use client';

import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { toast } from 'react-toastify';

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemTitle: string;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  initialRating?: number;
  initialComment?: string;
}

export function RatingDialog({
  isOpen,
  onClose,
  title = 'Rate',
  itemTitle,
  onSubmit,
  initialRating = 0,
  initialComment = '',
}: RatingDialogProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when dialog opens with new initial values
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating);
      setComment(initialComment);
    }
  }, [isOpen, initialRating, initialComment]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      onClose();
      toast.success('Rating saved successfully!');
    } catch {
      toast.error('Failed to save rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className="flex-1"
          >
            {isSubmitting ? 'Saving...' : 'Save Rating'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Movie Title */}
        <div>
          <p className="text-foreground font-medium text-center mb-4">
            {itemTitle}
          </p>
        </div>

        {/* Star Rating */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <FiStar
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="text-2xl font-bold text-primary">
            {rating > 0 ? `${rating}/5` : 'Select rating'}
          </p>
        </div>

        {/* Comment Textarea */}
        <div>
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-foreground mb-2"
          >
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {comment.length}/1000 characters
          </p>
        </div>
      </div>
    </Dialog>
  );
}
