'use client';

import { useState } from 'react';
import { FiPlay } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { MediaPlayer } from '@/components/ui/media-player';

interface TrailerPlayerProps {
  videoKey: string;
  title: string;
}

export function TrailerPlayer({ videoKey, title }: TrailerPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
      >
        <FiPlay className="w-5 h-5" />
        <span className="font-medium">Watch Trailer</span>
      </Button>
      <MediaPlayer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        videoKey={videoKey}
        title={title}
      />
    </>
  );
}
