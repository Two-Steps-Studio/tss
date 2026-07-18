import type { Metadata } from "next";
import { HomeClient } from "@/components/home-client";

export const metadata: Metadata = {
  title: 'Two Steps Studio — Beatmapy, Gry i Społeczność',
  description: 'Strona internetowa Two Steps Studio — platforma z beatmapami, grami, podcastami, turniejami e-sportowymi i warsztatami programistycznymi. Dołącz do tysięcy użytkowników i odkryj świat!',
  keywords: ['beatmapy', 'gracz', 'discord', 'muzyka', 'podcasty', 'esport', 'turnieje', 'rhythm games'],
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: 'https://tss.net',
    siteName: 'Two Steps Studio',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Two Steps Studio' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@two_stepstudio',
    creator: '@two_stepstudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function Home() {
  return <HomeClient />;
}