import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Bounce, ToastContainer } from 'react-toastify';
import SessionProvider from '@/components/providers/session-provider';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Track Verse',
  description:
    'Immerse yourself in a virtual world to track movies, series, games, books, and more.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll="smooth" suppressHydrationWarning>
      <body className={`${roboto.variable} antialiased`}>
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
              autoClose={500}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
