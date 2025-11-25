'use client';

import { Dialog } from '@/components/ui/dialog';

interface MediaPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string;
  title: string;
}

export function MediaPlayer({
  isOpen,
  onClose,
  videoKey,
  title,
}: MediaPlayerProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`${title} - Trailer`}
      className="max-w-7xl w-full h-[80vh]"
      showCloseButton={true}
      fullScreen={true}
    >
      <iframe
        src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&modestbranding=1&rel=0`}
        title={`${title} Trailer`}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </Dialog>
  );
}
