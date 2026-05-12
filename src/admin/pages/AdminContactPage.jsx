import { AdminSingletonForm } from "../components/AdminSingletonForm";
import { useToast } from "../../contexts/ToastContext";
import {
  useAdminProfile,
  useAdminSettings,
  useSaveProfileMutation,
  useSaveSettingsMutation,
} from "../../hooks/useAdminData";
import { PROFILE_FIELDS, SETTINGS_FIELDS } from "../../types/resources";

const contactProfileFieldNames = new Set(["email", "phone", "location", "availability", "linkedin_url", "github_url"]);
const contactSettingsFieldNames = new Set(["contact_title", "contact_message", "contact_email_subject", "secondary_cta_label", "secondary_cta_url"]);

export function AdminContactPage() {
  const profileQuery = useAdminProfile();
  const settingsQuery = useAdminSettings();
  const saveProfileMutation = useSaveProfileMutation();
  const saveSettingsMutation = useSaveSettingsMutation();
  const { pushToast } = useToast();

  return (
    <div className="space-y-4">
      <AdminSingletonForm
        title="Coordonnees publiques"
        description="Creez un point de contact clair: email, telephone, localisation, disponibilite et liens externes."
        fields={PROFILE_FIELDS.filter((field) => contactProfileFieldNames.has(field.name))}
        data={profileQuery.data}
        isLoading={profileQuery.isLoading}
        isSaving={saveProfileMutation.isPending}
        onSave={async ({ draft, files }) => {
          await saveProfileMutation.mutateAsync({ draft, files });
          pushToast({
            tone: "success",
            title: "Coordonnees mises a jour",
            description: "Les informations de contact publiques ont ete sauvegardees.",
          });
        }}
      />

      <AdminSingletonForm
        title="Experience de contact"
        description="Ajustez le titre, le message d'accueil et le sujet email par defaut du formulaire public."
        fields={SETTINGS_FIELDS.filter((field) => contactSettingsFieldNames.has(field.name))}
        data={settingsQuery.data}
        isLoading={settingsQuery.isLoading}
        isSaving={saveSettingsMutation.isPending}
        onSave={async ({ draft }) => {
          await saveSettingsMutation.mutateAsync(draft);
          pushToast({
            tone: "success",
            title: "Section contact sauvegardee",
            description: "La copie et les CTA du bloc contact ont ete mis a jour.",
          });
        }}
      />
    </div>
  );
}
