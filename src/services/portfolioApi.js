import {
  COLLECTION_SECTIONS,
  PROFILE_DEFAULTS,
  SETTINGS_DEFAULTS,
  createEmptyPortfolioData,
  normalizeCollectionList,
  normalizeSingleton,
} from "../types/resources";
import { SITE_KEY, getSupabaseClient, requireSupabaseClient } from "./supabase/client";

async function fetchPublicSingleton(table, defaults) {
  const client = getSupabaseClient();

  if (!client) {
    return normalizeSingleton(defaults, null);
  }

  const { data, error } = await client.from(table).select("*").eq("site_key", SITE_KEY).maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeSingleton(defaults, data);
}

async function fetchPublicCollection(resourceKey) {
  const client = getSupabaseClient();
  const config = COLLECTION_SECTIONS[resourceKey];

  if (!client) {
    return [];
  }

  let query = client.from(config.table).select("*").eq("site_key", SITE_KEY).eq("is_visible", true);

  config.orderBy.forEach((order) => {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return normalizeCollectionList(resourceKey, data);
}

export async function fetchPublicPortfolioData() {
  const empty = createEmptyPortfolioData();

  const [profile, settings, skills, projects, experiences, certifications, services] = await Promise.all([
    fetchPublicSingleton("profile", PROFILE_DEFAULTS),
    fetchPublicSingleton("settings", SETTINGS_DEFAULTS),
    fetchPublicCollection("skills"),
    fetchPublicCollection("projects"),
    fetchPublicCollection("experiences"),
    fetchPublicCollection("certifications"),
    fetchPublicCollection("services"),
  ]);

  return {
    ...empty,
    profile,
    settings,
    skills,
    projects,
    experiences,
    certifications,
    services,
  };
}

export async function submitPublicMessage(payload) {
  const client = requireSupabaseClient();
  const { error } = await client.from("messages").insert({
    site_key: SITE_KEY,
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    company: payload.company || "",
    metadata: {
      source: "portfolio",
    },
  });

  if (error) {
    throw error;
  }
}
