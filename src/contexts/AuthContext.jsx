import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  fetchCurrentAdminRole,
  getCurrentSession,
  getSupabaseConfig,
  isSupabaseConfigured,
  listenToAuthChanges,
  signInWithPassword,
  signOutCurrentSession,
} from "../services/supabase/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setIsLoading(false);
      return;
    }

    let active = true;

    const resolveRole = async (nextSession) => {
      if (!active) {
        return;
      }

      if (!nextSession?.user?.id) {
        setRole(null);
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);

      try {
        const nextRole = await fetchCurrentAdminRole(nextSession.user.id);
        if (active) {
          setRole(nextRole);
        }
      } catch (error) {
        if (active) {
          setRole(null);
          setAuthError(error.message || "Impossible de vérifier le rôle admin.");
        }
      } finally {
        if (active) {
          setIsRoleLoading(false);
        }
      }
    };

    const init = async () => {
      try {
        const nextSession = await getCurrentSession();
        if (!active) {
          return;
        }

        setSession(nextSession);
        await resolveRole(nextSession);
      } catch (error) {
        if (active) {
          setAuthError(error.message || "Impossible de récupérer la session.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    init();

    const unsubscribe = listenToAuthChanges(async (nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setAuthError("");
      await resolveRole(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [configured]);

  const value = useMemo(
    () => ({
      configured,
      config: getSupabaseConfig(),
      session,
      role,
      isAdmin: role === "admin",
      isLoading,
      isRoleLoading,
      authError,
      async signIn(credentials) {
        setAuthError("");
        setIsRoleLoading(true);
        const nextSession = await signInWithPassword(credentials);
        setSession(nextSession);

        try {
          const nextRole = await fetchCurrentAdminRole(nextSession?.user?.id);
          setRole(nextRole);
        } catch (error) {
          setRole(null);
          setAuthError(error.message || "Impossible de verifier le role admin.");
          throw error;
        } finally {
          setIsRoleLoading(false);
        }

        return nextSession;
      },
      async signOut() {
        await signOutCurrentSession();
        setSession(null);
        setRole(null);
        setAuthError("");
      },
    }),
    [authError, configured, isLoading, isRoleLoading, role, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
