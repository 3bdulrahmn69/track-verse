'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiGrid } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { MovieCard } from '@/components/tabs/movies/movie-card';
import { TVShowCard } from '@/components/tabs/tv-shows/tv-show-card';
import { BookCard } from '@/components/tabs/books/book-card';
import { GameCard } from '@/components/tabs/games/game-card';
import type { Movie } from '@/lib/tmdb';
import type { TVShow } from '@/lib/tmdb';
import type { Book } from '@/lib/books';
import type { Game } from '@/lib/rawg';

type MediaItem = Movie | TVShow | Book | Game;
type MediaType = 'movies' | 'tvshows' | 'books' | 'games';

interface MediaCarouselProps {
  items: MediaItem[];
  type: MediaType;
  title: string;
  emptyState: React.ReactNode;
}

export function MediaCarousel({
  items,
  type,
  title,
  emptyState,
}: MediaCarouselProps) {
  const [showAllDialog, setShowAllDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeftState] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const totalItems = items.length;

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const handleResize = () => checkScrollButtons();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  const handleScroll = () => {
    checkScrollButtons();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeftState(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll speed multiplier
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const scrollLeftFn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -224, behavior: 'smooth' });
    }
  };

  const scrollRightFn = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 224, behavior: 'smooth' });
    }
  };

  if (totalItems === 0) {
    return (
      <section className="bg-card rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        {emptyState}
      </section>
    );
  }

  return (
    <>
      <div className="relative bg-card rounded-lg shadow-lg p-4 sm:p-6 lg:p-8">
        {totalItems > 10 && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAllDialog(true)}
            className="absolute top-4 right-4 z-10 flex items-center gap-2"
          >
            <FiGrid className="w-4 h-4" />
            Show All
          </Button>
        )}

        <div className="relative">
          {/* Navigation Arrows */}
          {canScrollLeft && (
            <button
              onClick={scrollLeftFn}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-lg transition-colors"
              aria-label="Scroll left"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={scrollRightFn}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border border-border rounded-full p-2 shadow-lg transition-colors"
              aria-label="Scroll right"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Cards Container */}
          <div
            ref={scrollRef}
            className={`overflow-x-auto custom-scrollbar select-none px-12 max-w-[2320px] ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex gap-4 min-w-max">
              {items.slice(0, 10).map((item) => (
                <div key={getItemKey(item, type)} className="w-52 shrink-0">
                  {renderItemCard(item, type)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Show All Dialog */}
      <Dialog
        isOpen={showAllDialog}
        onClose={() => setShowAllDialog(false)}
        title={`All ${title} (${totalItems})`}
        className="max-w-7xl w-full"
      >
        <div className="max-h-[70vh] overflow-y-auto enhanced-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-1">
            {items.map((item) => (
              <div key={getItemKey(item, type)}>
                {renderItemCard(item, type)}
              </div>
            ))}
          </div>
        </div>
      </Dialog>
    </>
  );
}

function getItemKey(item: MediaItem, type: MediaType): string {
  switch (type) {
    case 'movies':
      return (item as Movie).id.toString();
    case 'tvshows':
      return (item as TVShow).id.toString();
    case 'books':
      return (item as Book).key;
    case 'games':
      return (item as Game).id.toString();
    default:
      return 'unknown';
  }
}

function renderItemCard(item: MediaItem, type: MediaType): React.ReactNode {
  switch (type) {
    case 'movies':
      return <MovieCard movie={item as Movie} />;
    case 'tvshows':
      return <TVShowCard tvShow={item as TVShow} />;
    case 'books':
      return <BookCard book={item as Book} />;
    case 'games':
      return <GameCard game={item as Game} />;
    default:
      return null;
  }
}
