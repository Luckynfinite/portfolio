function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdown(value) {
  return value
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function renderMarkdown(markdown = "") {
  const safe = escapeHtml(markdown);
  const blocks = safe.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return blocks
    .map((block) => {
      if (block.startsWith("- ")) {
        const items = block
          .split("\n")
          .map((line) => line.replace(/^- /, "").trim())
          .filter(Boolean)
          .map((line) => `<li>${inlineMarkdown(line)}</li>`)
          .join("");

        return `<ul>${items}</ul>`;
      }

      if (block.startsWith("## ")) {
        return `<h3>${inlineMarkdown(block.replace(/^## /, ""))}</h3>`;
      }

      if (block.startsWith("# ")) {
        return `<h2>${inlineMarkdown(block.replace(/^# /, ""))}</h2>`;
      }

      return `<p>${inlineMarkdown(block.replaceAll("\n", "<br />"))}</p>`;
    })
    .join("");
}
