import { createClient } from "@supabase/supabase-js";

export const SITE_KEY = import.meta.env.VITE_SUPABASE_SITE_KEY || "main";
export const ASSETS_BUCKET = import.meta.env.VITE_SUPABASE_ASSETS_BUCKET || "portfolio-assets";
export const DOCUMENTS_BUCKET = import.meta.env.VITE_SUPABASE_DOCUMENTS_BUCKET || "portfolio-documents";

let supabaseClient;

export function getSupabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
    siteKey: SITE_KEY,
    assetsBucket: ASSETS_BUCKET,
    documentsBucket: DOCUMENTS_BUCKET,
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseClient) {
    const config = getSupabaseConfig();
    supabaseClient = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseClient;
}

export function requireSupabaseClient() {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase n'est pas configuré dans ce projet.");
  }

  return client;
}

export async function getCurrentSession() {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function listenToAuthChanges(callback) {
  const client = getSupabaseClient();

  if (!client) {
    return () => {};
  }

  const { data } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(credentials) {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword(credentials);

  if (error) {
    throw error;
  }

  return data.session;
}

export async function signOutCurrentSession() {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function fetchCurrentAdminRole(userId) {
  if (!userId) {
    return null;
  }

  const client = requireSupabaseClient();
  const { data, error } = await client.from("admin_roles").select("role").eq("user_id", userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role || null;
}
