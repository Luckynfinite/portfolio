import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({ value = [], onChange, placeholder = "Ajouter un tag" }) {
  const [draft, setDraft] = useState("");

  const commitValue = () => {
    const next = draft
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!next.length) {
      return;
    }

    onChange(Array.from(new Set([...(value || []), ...next])));
    setDraft("");
  };

  return (
    <div className="rounded-3xl border border-[var(--line-soft)] bg-white/5 p-3">
      <div className="mb-3 flex flex-wrap gap-2">
        {(value || []).map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-medium text-white"
          >
            {tag}
            <button
              type="button"
              className="rounded-full p-0.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              onClick={() => onChange((value || []).filter((item) => item !== tag))}
              aria-label={`Supprimer ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitValue();
          }
        }}
        placeholder={placeholder}
        className="input-shell w-full rounded-2xl px-3 py-2 text-sm"
      />
    </div>
  );
}
