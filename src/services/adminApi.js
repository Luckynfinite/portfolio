import { buildStorageFilePath, compressImageFile } from "../lib/files";
import {
  COLLECTION_SECTIONS,
  PROFILE_DEFAULTS,
  PROFILE_FIELDS,
  SETTINGS_DEFAULTS,
  SETTINGS_FIELDS,
  createCollectionDraft,
  normalizeCollectionList,
  normalizeSingleton,
} from "../types/resources";
import { ASSETS_BUCKET, DOCUMENTS_BUCKET, SITE_KEY, requireSupabaseClient } from "./supabase/client";

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : value ?? "";
}

function sanitizeByField(field, value) {
  if (field.type === "checkbox") {
    return Boolean(value);
  }

  if (field.type === "number") {
    return value === "" || value == null ? 0 : Number(value);
  }

  if (field.type === "tags") {
    return Array.isArray(value) ? value.map((item) => String(item).trim()).filter(Boolean) : [];
  }

  if (field.type === "date") {
    return value || null;
  }

  return sanitizeText(value);
}

async function uploadManagedFile(file, field) {
  if (!file) {
    return "";
  }

  const optimizedFile = field.type === "image" ? await compressImageFile(file, 1600, 0.9) : file;
  const bucketName = field.storage?.bucket === "documents" ? DOCUMENTS_BUCKET : ASSETS_BUCKET;
  const folder = field.storage?.folder || "uploads";
  const filePath = buildStorageFilePath(`${SITE_KEY}/${folder}`, optimizedFile.name);
  const client = requireSupabaseClient();

  const { error } = await client.storage.from(bucketName).upload(filePath, optimizedFile, {
    upsert: true,
    contentType: optimizedFile.type || undefined,
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from(bucketName).getPublicUrl(filePath);
  return data.publicUrl;
}

function buildRecordFromFields(fields, draft, files = {}) {
  return fields.reduce(async (promise, field) => {
    const previous = await promise;
    const file = files[field.name];

    if ((field.type === "image" || field.type === "file") && file) {
      return {
        ...previous,
        [field.name]: await uploadManagedFile(file, field),
      };
    }

    return {
      ...previous,
      [field.name]: sanitizeByField(field, draft[field.name]),
    };
  }, Promise.resolve({}));
}

async function fetchSingleton(table, defaults) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from(table).select("*").eq("site_key", SITE_KEY).maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeSingleton(defaults, data);
}

async function saveSingleton(table, fields, defaults, draft, files = {}) {
  const client = requireSupabaseClient();
  const payload = await buildRecordFromFields(fields, {
    ...defaults,
    ...draft,
  }, files);

  const { data, error } = await client
    .from(table)
    .upsert(
      {
        site_key: SITE_KEY,
        ...payload,
      },
      {
        onConflict: "site_key",
      },
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return normalizeSingleton(defaults, data);
}

export async function fetchProfile() {
  return fetchSingleton("profile", PROFILE_DEFAULTS);
}

export async function saveProfile(draft, files = {}) {
  return saveSingleton("profile", PROFILE_FIELDS, PROFILE_DEFAULTS, draft, files);
}

export async function fetchSettings() {
  return fetchSingleton("settings", SETTINGS_DEFAULTS);
}

export async function saveSettings(draft) {
  return saveSingleton("settings", SETTINGS_FIELDS, SETTINGS_DEFAULTS, draft);
}

export async function fetchCollection(resourceKey) {
  const client = requireSupabaseClient();
  const config = COLLECTION_SECTIONS[resourceKey];

  let query = client.from(config.table).select("*").eq("site_key", SITE_KEY);
  config.orderBy.forEach((order) => {
    query = query.order(order.column, { ascending: order.ascending ?? true });
  });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return normalizeCollectionList(resourceKey, data);
}

export async function saveCollectionItem(resourceKey, draft, files = {}) {
  const client = requireSupabaseClient();
  const config = COLLECTION_SECTIONS[resourceKey];
  const cleanDraft = {
    ...createCollectionDraft(resourceKey),
    ...draft,
  };

  const payload = await buildRecordFromFields(config.fields, cleanDraft, files);
  const basePayload = {
    site_key: SITE_KEY,
    ...payload,
  };

  const operation = cleanDraft.id
    ? client.from(config.table).update(basePayload).eq("id", cleanDraft.id).select("*").single()
    : client.from(config.table).insert(basePayload).select("*").single();

  const { data, error } = await operation;

  if (error) {
    throw error;
  }

  return {
    ...config.defaults,
    ...data,
  };
}

export async function deleteCollectionItem(resourceKey, id) {
  const client = requireSupabaseClient();
  const config = COLLECTION_SECTIONS[resourceKey];
  const { error } = await client.from(config.table).delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function fetchMessages() {
  const client = requireSupabaseClient();
  const { data, error } = await client.from("messages").select("*").eq("site_key", SITE_KEY).order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return Array.isArray(data) ? data : [];
}

export async function updateMessageStatus(id, status) {
  const client = requireSupabaseClient();
  const { data, error } = await client.from("messages").update({ status }).eq("id", id).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteMessage(id) {
  const client = requireSupabaseClient();
  const { error } = await client.from("messages").delete().eq("id", id);

  if (error) {
    throw error;
  }
}

export async function fetchDashboardSnapshot() {
  const [profile, settings, projects, skills, experiences, certifications, services, messages] = await Promise.all([
    fetchProfile(),
    fetchSettings(),
    fetchCollection("projects"),
    fetchCollection("skills"),
    fetchCollection("experiences"),
    fetchCollection("certifications"),
    fetchCollection("services"),
    fetchMessages(),
  ]);

  return {
    profile,
    settings,
    projects,
    skills,
    experiences,
    certifications,
    services,
    messages,
    stats: {
      projects: projects.length,
      skills: skills.length,
      experiences: experiences.length,
      certifications: certifications.length,
      services: services.length,
      unreadMessages: messages.filter((message) => message.status === "new").length,
    },
  };
}
