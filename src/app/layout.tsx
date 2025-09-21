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
          d="M5.5 21V19.5C5.5 18.3954 6.39543 17.5 7.5 17.5H8.5V15.5C8.5 14.3954 9.39543 13.5 10.5 13.5H11.5V11.5C11.5 10.3954 12.3954 9.5 13.5 9.5H14.5V7.5C14.5 6.39543 15.3954 5.5 16.5 5.5H18V3"
          stroke="#6973FF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="16" y="3" width="5" height="5" rx="1" fill="#6973FF" />
      </svg>
    );
  }