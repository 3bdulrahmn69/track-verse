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
  title: 'Track Verse',
  description:
    'Track your favorite movies, series, games, books, and more with our comprehensive tracking dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll="smooth" suppressHydrationWarning>
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
