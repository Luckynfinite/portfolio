import { AdminSingletonForm } from "../components/AdminSingletonForm";
import { useToast } from "../../contexts/ToastContext";
import { useAdminSettings, useSaveSettingsMutation } from "../../hooks/useAdminData";
import { SETTINGS_FIELDS } from "../../types/resources";

export function AdminSettingsPage() {
  const { data, isLoading } = useAdminSettings();
  const saveMutation = useSaveSettingsMutation();
  const { pushToast } = useToast();

  return (
    <AdminSingletonForm
      title="Parametres globaux"
      description="Pilotez le branding, les CTA, le footer, l'intro publique, l'accent color et les metadonnees globales du portfolio."
      fields={SETTINGS_FIELDS}
      data={data}
      isLoading={isLoading}
      isSaving={saveMutation.isPending}
      onSave={async ({ draft }) => {
        await saveMutation.mutateAsync(draft);
        pushToast({
          tone: "success",
          title: "Parametres sauvegardes",
          description: "Les reglages globaux du portfolio ont ete synchronises.",
        });
      }}
    />
  );
}
