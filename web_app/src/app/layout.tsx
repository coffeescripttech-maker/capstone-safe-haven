import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { SafeHavenAuthProvider } from '@/context/SafeHavenAuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SafeHaven Admin Dashboard',
  description: 'Disaster Management System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-outfit">
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
