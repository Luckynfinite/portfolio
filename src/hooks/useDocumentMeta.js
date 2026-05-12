import { useEffect } from "react";

export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    if (title) {
      document.title = title;
    }

    if (!description) {
      return;
    }

    let tag = document.querySelector('meta[name="description"]');

    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.append(tag);
    }

    tag.setAttribute("content", description);
  }, [description, title]);
}
