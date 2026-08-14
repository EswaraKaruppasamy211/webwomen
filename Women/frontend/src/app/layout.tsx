import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { EmergencyProvider } from '../contexts/EmergencyContext';
import { DemoProvider } from '../contexts/DemoContext';

export const metadata: Metadata = {
  title: 'SafeHer AI – Women Safety Navigation & Emergency Response System',
  description:
    'Mobile-first AI-assisted safety navigation, verified emergency dispatch, and real-time live location response system.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0B132B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-safeNavy-950 text-slate-100 min-h-screen flex flex-col">
        <AuthProvider>
          <EmergencyProvider>
            <DemoProvider>{children}</DemoProvider>
          </EmergencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
