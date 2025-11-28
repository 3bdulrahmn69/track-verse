import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SessionProvider from '@/components/providers/session-provider';
import { GoToTopButton } from '@/components/shared/go-to-top-button';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://track-verse.vercel.app'),
  title: {
    default: 'Track Verse - Your Ultimate Entertainment Tracking Platform',
    template: '%s | Track Verse',
  },
  description:
    'Track and organize your favorite movies, TV shows, books, and video games all in one place. Discover new content, share reviews, and connect with friends.',
  keywords: [
    'entertainment tracker',
    'movie tracker',
    'tv show tracker',
    'book tracker',
    'video game tracker',
    'watchlist',
    'media tracking',
    'content discovery',
  ],
  authors: [{ name: 'Track Verse Team' }],
  creator: 'Track Verse',
  publisher: 'Track Verse',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://track-verse.vercel.app',
    images: [
      {
        url: 'https://raw.githubusercontent.com/3bdulrahmn69/track-verse/refs/heads/main/public/landing.png',
        width: 1200,
        height: 630,
        alt: 'Track Verse',
      },
    ],
    siteName: 'Track Verse',
    title: 'Track Verse - Your Ultimate Entertainment Tracking Platform',
    description:
      'Track movies, TV shows, books, and games. Discover new content and share reviews.',
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://raw.githubusercontent.com/3bdulrahmn69/track-verse/refs/heads/main/public/landing.png',
        width: 1200,
        height: 630,
        alt: 'Track Verse',
      },
    ],
    title: 'Track Verse',
    description: 'Track your entertainment journey',
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
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${roboto.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            themes={['light', 'dark', 'system']}
            enableSystem={true}
            defaultTheme="system"
            storageKey="track-verse-theme"
          >
            {children}
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
            <GoToTopButton />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
