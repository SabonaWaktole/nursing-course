import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import ApprovalBanner from "@/components/ApprovalBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Excel Community Living Inc - Nursing Assistant Training",
  description: "Start your career in healthcare with Certified Nursing Assistant courses. Get certified, gain practical skills, and secure a job in healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Great+Vibes&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        {/* Inline script to apply dark mode before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
          (function() {
            try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.className} bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased`}>
        <ApprovalBanner />
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
