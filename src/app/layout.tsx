import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from 'next-themes';
import { Logo } from '@/components/Logo';

export const metadata: Metadata = {
  title: 'NextStep',
  description: 'Your personalized AI career co-pilot.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=DM+Serif+Text:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export function Favicon() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 20V16H8V12H12V8H16V4H20"
          stroke="#6973FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="16" y="2" width="5" height="5" rx="1" fill="#6973FF" />
      </svg>
    );
  }