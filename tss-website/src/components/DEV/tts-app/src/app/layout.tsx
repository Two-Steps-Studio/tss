/// app layout with Dev context provider

export default function RootLayout({children}: {{}}) {
 return (
<SupabaseClientProvider>
 <DevContext.Provider value={dev_context_state}>
  { children }
 </DeV Context Provider>

 );
} // TODO: Add actual implementation of providers in main-layout.tsx