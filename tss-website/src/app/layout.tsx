import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "../components/ErrorReporter";
import Script from "next/script";
import { Providers } from "../components/Providers";
import AdminConsole from "../components/AdminConsole";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import { PageTransition } from "../components/PageTransition";
import { NoiseOverlay } from "../components/ui/noise-overlay";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import InstallPrompt from "../components/InstallPrompt";
import { PresencePing } from "../components/presence-ping";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Two Steps Studio",
  description: "Witaj w Two Steps Studio",
  manifest: "/manifest.json",
    icons: {
      icon: "/assets/Logo/Glowne/Two Steps Studio Bez Tła.png",
      shortcut: "/assets/Logo/Glowne/Two Steps Studio Bez Tła.png",
      apple: "/assets/Logo/Glowne/Two Steps Studio Bez Tła.png",
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning className={`${spaceGrotesk.variable} ${outfit.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/assets/Logo/Glowne/Two Steps Studio Bez Tła.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/Logo/Glowne/Two Steps Studio Bez Tła.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.electron) {
                document.documentElement.classList.add('electron');
              }
            `,
          }}
        />
      </head>
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <NoiseOverlay />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] bg-[var(--color-general)]/15 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[60%] bg-[var(--color-records)]/15 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: "3s" }} />
        </div>
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="aa14c20f-df41-43d4-909e-60a5384ae872"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "TwoStepsStudio", "version": "1.0.0"}'
        />
        <Providers>
          <PresencePing />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 lg:ml-[240px] flex flex-col pt-[60px] transition-[margin] duration-300">
              <TopBar />
              <main className="p-4 md:p-8 pt-8 md:pt-12 max-w-[1400px] mx-auto w-full">
                <PageTransition>
                  {children}
                </PageTransition>
              </main>
            </div>
          </div>
          <AdminConsole />
        </Providers>
        <ServiceWorkerRegister />
        <InstallPrompt />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
