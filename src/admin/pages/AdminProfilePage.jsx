import { AdminSingletonForm } from "../components/AdminSingletonForm";
import { useToast } from "../../contexts/ToastContext";
import { useAdminProfile, useSaveProfileMutation } from "../../hooks/useAdminData";
import { PROFILE_FIELDS } from "../../types/resources";

export function AdminProfilePage() {
  const { data, isLoading } = useAdminProfile();
  const saveMutation = useSaveProfileMutation();
  const { pushToast } = useToast();

  return (
    <AdminSingletonForm
      title="Profil public"
      description="Mettez a jour le hero, les liens sociaux, la bio, l'avatar, le CV et les metadonnees SEO sans exposer le moindre formulaire publiquement."
      note="Les fichiers sont charges vers Supabase Storage uniquement au moment de la sauvegarde."
      fields={PROFILE_FIELDS}
      data={data}
      isLoading={isLoading}
      isSaving={saveMutation.isPending}
      onSave={async ({ draft, files }) => {
        await saveMutation.mutateAsync({ draft, files });
        pushToast({
          tone: "success",
          title: "Profil sauvegarde",
          description: "La section hero et les informations publiques ont ete mises a jour.",
        });
      }}
    />
  );
}
