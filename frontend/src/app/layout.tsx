import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import ApprovalBanner from "@/components/ApprovalBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://cnaceus.excelcommunityliving.website"),
  title: "CNACEUS | Official Healthcare Education Platform",
  description: "CNACEUS offers top-tier healthcare education and online certifications. Advance your career with our state-approved healthcare courses.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "CNACEUS | Official Healthcare Education Platform",
    description: "CNACEUS offers top-tier healthcare education and online certifications. Advance your career with our state-approved healthcare courses.",
    url: "https://cnaceus.excelcommunityliving.website",
    siteName: "CNACEUS",
  },
  twitter: {
    card: "summary_large_image",
    title: "CNACEUS | Official Healthcare Education Platform",
    description: "CNACEUS offers top-tier healthcare education and online certifications. Advance your career with our state-approved healthcare courses.",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://cnaceus.excelcommunityliving.website/#organization",
                  "name": "CNACEUS",
                  "url": "https://cnaceus.excelcommunityliving.website"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://cnaceus.excelcommunityliving.website/#website",
                  "url": "https://cnaceus.excelcommunityliving.website",
                  "name": "CNACEUS",
                  "publisher": {
                    "@id": "https://cnaceus.excelcommunityliving.website/#organization"
                  }
                }
              ]
            })
          }}
        />
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
