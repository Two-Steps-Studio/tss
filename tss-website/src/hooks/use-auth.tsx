"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const cleanupSubscription = async () => {
      try {
        if (!supabase) {
          console.warn("[useAuth] Supabase not configured - using fallback mode");
          // Try to get session from localStorage as fallback
          const { data: { initialSession } } = await supabase?.auth.getSession?.();
          if (initialSession) {
            setSession(initialSession);
            setUser(initialSession.user ?? null);
          }
          setLoading(false);
          return;
        }

        // console.log("[useAuth] Initializing auth session...");

        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[useAuth] Error getting session:", error);
          // Don't set loading to false on error - keep loading while user sees error state
        } else {
          console.log("[useAuth] Session retrieved:", session ? "authenticated" : "not authenticated");
        }

        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (err) {
        console.error("[useAuth] Exception in auth initialization:", err);
        setLoading(false);
      }
    };

    let cleanup: (() => void) | undefined;

    cleanupSubscription();

    if (supabase) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            console.log("[useAuth] Auth state changed:", _event, session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);
            // Don't set loading to false here - it's already false after getSession()
          }
        );

        // Store subscription reference for cleanup
        cleanup = () => {
          subscription?.unsubscribe();
          console.log("[useAuth] Subscription unsubscribed");
        };
      } catch (err) {
        console.error("[useAuth] Error setting up auth state change listener:", err);
      }
    }

    // Cleanup on unmount
    return cleanup;
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
