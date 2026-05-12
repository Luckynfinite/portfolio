import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminField } from "./AdminField";

function FormSkeleton() {
  return (
    <div className="glass-panel rounded-[32px] p-6">
      <div className="skeleton h-7 w-48 rounded-2xl" />
      <div className="mt-3 skeleton h-4 w-72 rounded-xl" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={`skeleton rounded-[28px] ${index % 3 === 0 ? "sm:col-span-2 h-44" : "h-28"}`} />
        ))}
      </div>
    </div>
  );
}

export function AdminSingletonForm({
  title,
  description,
  note,
  fields,
  data,
  isLoading,
  onSave,
  isSaving,
}) {
  const [draft, setDraft] = useState({});
  const [files, setFiles] = useState({});

  useEffect(() => {
    if (data) {
      setDraft(data);
      setFiles({});
    }
  }, [data]);

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <section className="glass-panel rounded-[32px] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--content-muted)]">Edition</p>
          <h2 className="mt-2 font-[var(--font-display)] text-3xl text-white">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--content-muted)]">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => onSave({ draft, files })}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Sauvegarde..." : "Enregistrer"}
        </button>
      </div>

      {note ? <div className="mt-6 rounded-[28px] border border-sky-400/18 bg-sky-400/8 px-4 py-3 text-sm text-sky-100">{note}</div> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <AdminField
            key={field.name}
            field={field}
            value={draft[field.name]}
            file={files[field.name]}
            onChange={(name, value) => setDraft((current) => ({ ...current, [name]: value }))}
            onFileChange={(name, nextFile) =>
              setFiles((current) => ({
                ...current,
                [name]: nextFile,
              }))
            }
          />
        ))}
      </div>
    </section>
  );
}
