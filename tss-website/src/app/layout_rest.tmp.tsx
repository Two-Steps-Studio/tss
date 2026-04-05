      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/assets/Logo/Glowne/Two Steps Studio Bez Tła.png" type="image/png" />
        <link rel="apple-touch-icon" href="/assets/Logo/Glowne/Two Steps Studio Bez Tła.png" />
      </head>
      <body className="antialiased overflow-x-hidden" suppressHydrationWarning>
        <NoiseOverlay />
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-5">
          <div className="absolute top-[-15%] left-[-5%] w-[60%] h-[60%] bg-[var(--color-general)]/5 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-15%] right-[-5%] w-[60%] h-[60%] bg-[var(--color-records)]/5 blur-[160px] rounded-full animate-pulse" style={{ animationDelay: "3s" }} />
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
              <main className="p-4 md:p-8 pt-8 md:pt-12 max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
                <PageTransition>
                  {children}
                </PageTransition>
                <Footer />
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
