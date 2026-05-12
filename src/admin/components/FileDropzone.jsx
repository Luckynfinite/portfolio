import { useEffect, useId, useMemo, useRef, useState } from "react";
import { FileImage, FileUp, FileText, UploadCloud, X } from "lucide-react";

function formatBytes(value) {
  if (!value) {
    return "";
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({ field, file, value, onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = useMemo(() => {
    if (file && field.type === "image") {
      return URL.createObjectURL(file);
    }

    return value || "";
  }, [file, field.type, value]);

  useEffect(() => {
    if (!file || field.type !== "image" || !previewUrl.startsWith("blob:")) {
      return undefined;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [field.type, file, previewUrl]);

  const handleFiles = (fileList) => {
    const [nextFile] = fileList || [];
    if (!nextFile) {
      return;
    }

    onChange(nextFile);
  };

  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-medium text-[var(--content-strong)]">
        {field.label}
      </label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={[
          "group w-full rounded-[28px] border border-dashed px-4 py-5 text-left transition",
          isDragging ? "border-sky-400/60 bg-sky-400/10" : "border-[var(--line-soft)] bg-white/4 hover:bg-white/7",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={field.accept || (field.type === "image" ? "image/*" : undefined)}
          onChange={(event) => handleFiles(event.target.files)}
          className="hidden"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
            {field.type === "image" ? <FileImage className="h-5 w-5 text-sky-300" /> : <FileText className="h-5 w-5 text-amber-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              {file ? "Fichier pret a etre envoye" : "Glissez-deposez ou cliquez pour importer"}
            </p>
            <p className="mt-1 text-sm text-[var(--content-muted)]">
              {field.helperText || "Upload vers Supabase Storage au moment de la sauvegarde."}
            </p>
            {file ? (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                {file.name} {file.size ? `- ${formatBytes(file.size)}` : ""}
              </p>
            ) : null}
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            <UploadCloud className="h-4 w-4" />
            Import
          </div>
        </div>
      </button>

      {field.type === "image" && previewUrl ? (
        <div className="overflow-hidden rounded-[28px] border border-[var(--line-soft)] bg-black/20">
          <img src={previewUrl} alt={field.label} className="h-56 w-full object-cover" />
        </div>
      ) : null}

      {field.type !== "image" && value ? (
        <div className="flex items-center justify-between rounded-2xl border border-[var(--line-soft)] bg-white/5 px-3 py-2 text-sm text-[var(--content-soft)]">
          <span className="truncate">{value}</span>
          <FileUp className="h-4 w-4 text-[var(--content-muted)]" />
        </div>
      ) : null}

      {(file || value) ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="inline-flex items-center gap-2 text-sm text-[var(--content-muted)] transition hover:text-white"
        >
          <X className="h-4 w-4" />
          Retirer le fichier selectionne
        </button>
      ) : null}
    </div>
  );
}
