'use client';

import { useState, useEffect } from 'react';
import { FiChevronUp } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const currentScrollY = window.pageYOffset;
      const scrollingDown = currentScrollY > lastScrollY;
      const scrolledPastThreshold = currentScrollY > 300;

      if (scrollingDown && scrolledPastThreshold) {
        setIsVisible(true);
      } else if (!scrollingDown) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className={`group fixed z-50 rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 bg-primary hover:bg-primary/90 hover:scale-110 active:scale-95 ${
        isVisible
          ? 'bottom-8 right-8 md:bottom-8 md:right-8 opacity-100 translate-y-0'
          : 'bottom-4 right-4 md:bottom-8 md:right-8 opacity-0 translate-y-4 pointer-events-none'
      }`}
      size="sm"
      aria-label="Go to top"
    >
      <FiChevronUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </Button>
  );
}
