import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: 'Toman Mariners FC | Official Site',
  description: 'Official website of Toman Mariners FC soccer club.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} font-body antialiased bg-background text-foreground selection:bg-accent selection:text-accent-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
