import Header from '@/components/layout/header';
import Hero from '@/components/landing/hero';
import About from '@/components/landing/about';
import Features from '@/components/landing/features';
import APIServices from '@/components/landing/apis-services';
import Testimonials from '@/components/landing/testimonials';
import Footer from '@/components/layout/footer';
import CTA from '@/components/landing/cta';
import { StructuredData } from '@/components/shared/structured-data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Track Verse - Your Ultimate Entertainment Tracking Platform',
  description:
    'Track and organize your favorite movies, TV shows, books, and video games all in one place. Join Track Verse to discover new content, share reviews, connect with friends, and build your personalized entertainment library.',
  keywords: [
    'entertainment tracker',
    'movie tracker',
    'tv show tracker',
    'book tracker',
    'video game tracker',
    'media tracking',
    'watchlist',
    'reading list',
    'gaming library',
    'content discovery',
    'entertainment platform',
    'track verse',
  ],
  authors: [{ name: 'Track Verse Team' }],
  openGraph: {
    title: 'Track Verse - Your Ultimate Entertainment Tracking Platform',
    description:
      'Track movies, TV shows, books, and games. Discover new content and share reviews with friends.',
    url: 'https://track-verse.vercel.app',
    siteName: 'Track Verse',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://track-verse.vercel.app/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Track Verse - Entertainment Tracking Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Track Verse - Your Ultimate Entertainment Tracking Platform',
    description: 'Track movies, TV shows, books, and games all in one place',
    images: ['https://track-verse.vercel.app/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://track-verse.vercel.app',
  },
};

export default function Home() {
  return (
    <>
      <StructuredData />
      <Header />
      <Hero />
      <About />
      <Features />
      <APIServices />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
