import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteCollectionItem,
  deleteMessage,
  fetchCollection,
  fetchDashboardSnapshot,
  fetchMessages,
  fetchProfile,
  fetchSettings,
  saveCollectionItem,
  saveProfile,
  saveSettings,
  updateMessageStatus,
} from "../services/adminApi";

export const adminKeys = {
  dashboard: ["admin", "dashboard"],
  profile: ["admin", "profile"],
  settings: ["admin", "settings"],
  collection: (resourceKey) => ["admin", resourceKey],
  messages: ["admin", "messages"],
};

export function useDashboardSnapshot() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: fetchDashboardSnapshot,
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: adminKeys.profile,
    queryFn: fetchProfile,
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: adminKeys.settings,
    queryFn: fetchSettings,
  });
}

export function useAdminCollection(resourceKey) {
  return useQuery({
    queryKey: adminKeys.collection(resourceKey),
    queryFn: () => fetchCollection(resourceKey),
  });
}

export function useAdminMessages() {
  return useQuery({
    queryKey: adminKeys.messages,
    queryFn: fetchMessages,
  });
}

function useInvalidatingMutation({ mutationFn, invalidateKeys }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all(invalidateKeys.map((key) => queryClient.invalidateQueries({ queryKey: key })));
    },
  });
}

export function useSaveProfileMutation() {
  return useInvalidatingMutation({
    mutationFn: ({ draft, files }) => saveProfile(draft, files),
    invalidateKeys: [adminKeys.profile, adminKeys.dashboard, ["portfolio", "public"]],
  });
}

export function useSaveSettingsMutation() {
  return useInvalidatingMutation({
    mutationFn: saveSettings,
    invalidateKeys: [adminKeys.settings, adminKeys.dashboard, ["portfolio", "public"]],
  });
}

export function useSaveCollectionMutation(resourceKey) {
  return useInvalidatingMutation({
    mutationFn: ({ draft, files }) => saveCollectionItem(resourceKey, draft, files),
    invalidateKeys: [adminKeys.collection(resourceKey), adminKeys.dashboard, ["portfolio", "public"]],
  });
}

export function useDeleteCollectionMutation(resourceKey) {
  return useInvalidatingMutation({
    mutationFn: (id) => deleteCollectionItem(resourceKey, id),
    invalidateKeys: [adminKeys.collection(resourceKey), adminKeys.dashboard, ["portfolio", "public"]],
  });
}

export function useUpdateMessageStatusMutation() {
  return useInvalidatingMutation({
    mutationFn: ({ id, status }) => updateMessageStatus(id, status),
    invalidateKeys: [adminKeys.messages, adminKeys.dashboard],
  });
}

export function useDeleteMessageMutation() {
  return useInvalidatingMutation({
    mutationFn: deleteMessage,
    invalidateKeys: [adminKeys.messages, adminKeys.dashboard],
  });
}
