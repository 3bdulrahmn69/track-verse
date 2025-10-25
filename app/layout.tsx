import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
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
        <ThemeProvider
          attribute="class"
          themes={['light', 'dark', 'system']}
          enableSystem={true}
          defaultTheme="system"
          storageKey="track-verse-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
