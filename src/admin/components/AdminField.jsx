import { FileDropzone } from "./FileDropzone";
import { TagInput } from "./TagInput";
import { renderMarkdown } from "../../utils/markdown";

function FieldLabel({ field }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <label className="text-sm font-medium text-[var(--content-strong)]">
        {field.label}
        {field.required ? <span className="ml-1 text-rose-300">*</span> : null}
      </label>
      {field.helperText ? <span className="text-xs text-[var(--content-muted)]">{field.helperText}</span> : null}
    </div>
  );
}

export function AdminField({ field, value, file, onChange, onFileChange }) {
  const commonProps = {
    value: value ?? (field.type === "checkbox" ? false : ""),
    onChange: (event) => onChange(field.name, event.target.value),
    placeholder: field.placeholder || "",
    required: field.required,
    className: "input-shell w-full rounded-2xl px-3 py-2.5 text-sm",
  };

  if (field.type === "image" || field.type === "file") {
    return (
      <div className={field.type === "image" ? "sm:col-span-2" : ""}>
        <FileDropzone field={field} file={file} value={value} onChange={(nextFile) => onFileChange(field.name, nextFile)} />
      </div>
    );
  }

  if (field.type === "markdown") {
    return (
      <div className="sm:col-span-2">
        <FieldLabel field={field} />
        <div className="grid gap-4 lg:grid-cols-2">
          <textarea {...commonProps} rows={field.rows || 10} onChange={(event) => onChange(field.name, event.target.value)} />
          <div
            className="markdown-content rounded-[28px] border border-[var(--line-soft)] bg-white/4 p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value || "Apercu markdown en direct.") }}
          />
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={field.rows >= 4 ? "sm:col-span-2" : ""}>
        <FieldLabel field={field} />
        <textarea {...commonProps} rows={field.rows || 4} onChange={(event) => onChange(field.name, event.target.value)} />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <FieldLabel field={field} />
        <select
          value={value ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
          className="input-shell w-full rounded-2xl px-3 py-2.5 text-sm"
        >
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white/4 px-4 py-3 text-sm text-[var(--content-soft)]">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
          className="h-4 w-4 rounded border-white/10 bg-transparent"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === "tags") {
    return (
      <div className="sm:col-span-2">
        <FieldLabel field={field} />
        <TagInput value={value || []} onChange={(nextValue) => onChange(field.name, nextValue)} placeholder={field.placeholder} />
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--line-soft)] bg-white/4 px-3 py-2.5">
          <input
            type="color"
            value={value || "#2563eb"}
            onChange={(event) => onChange(field.name, event.target.value)}
            className="h-10 w-12 rounded-xl border-0 bg-transparent p-0"
          />
          <input
            value={value || ""}
            onChange={(event) => onChange(field.name, event.target.value)}
            placeholder="#2563eb"
            className="input-shell w-full rounded-2xl px-3 py-2.5 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <FieldLabel field={field} />
      <input
        {...commonProps}
        type={
          field.type === "number"
            ? "number"
            : field.type === "date"
              ? "date"
              : field.type === "email"
                ? "email"
                : field.type === "url"
                  ? "url"
                  : "text"
        }
        min={field.min}
        max={field.max}
        step={field.type === "number" ? "any" : undefined}
        onChange={(event) =>
          onChange(
            field.name,
            field.type === "number" ? (event.target.value === "" ? "" : Number(event.target.value)) : event.target.value,
          )
        }
      />
    </div>
  );
}
