import './globals.css'
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Geist, Geist_Mono, Ubuntu_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const ubuntuMono = Ubuntu_Mono({
  variable: '--font-ubuntu-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
});

export const metadata = {
  title: 'ReCreat0rz',
  description: 'A personal blog about cybersecurity and tech.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // ensure interactive widgets like keyboards do not break layout
  interactiveWidget: 'resizes-content'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${ubuntuMono.variable}`}>
        <Header />
        <main style={{ minHeight: '100vh', paddingTop: '1rem' }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
