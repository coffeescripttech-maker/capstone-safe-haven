import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { SafeHavenAuthProvider } from '@/context/SafeHavenAuthContext';
import { Toaster } from 'react-hot-toast';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className}`}>
        <SafeHavenAuthProvider>
          <SidebarProvider>
            {children}
            <Toaster position="top-right" />
          </SidebarProvider>
        </SafeHavenAuthProvider>
      </body>
    </html>
  );
}
