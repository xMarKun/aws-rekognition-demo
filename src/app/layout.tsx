import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { ThemeProvider } from '@/providers/theme';
import { NavbarProvider } from '@/providers/navbar';
import Navbar from '@/components/navbar';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AWS Rekognition Demo',
  description: '',
  robots: {
    index: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NavbarProvider>
            <Header />
            <Navbar />
            <main className="pt-14 lg:pl-64">
              <div className="w-full max-w-[800px] mx-auto px-3 py-5 lg:px-5">{children}</div>
            </main>
            <Toaster closeButton richColors />
          </NavbarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
