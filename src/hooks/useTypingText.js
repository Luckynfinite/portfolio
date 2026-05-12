import { useEffect, useMemo, useState } from "react";

export function useTypingText(items = [], { typingSpeed = 72, deletingSpeed = 42, holdDelay = 1450, reducedMotion = false } = {}) {
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!safeItems.length) {
      setText("");
      return undefined;
    }

    if (reducedMotion) {
      setText(safeItems[0]);
      return undefined;
    }

    const current = safeItems[activeIndex % safeItems.length];

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting) {
          const nextValue = current.slice(0, text.length + 1);
          setText(nextValue);

          if (nextValue === current) {
            setIsDeleting(true);
          }
          return;
        }

        const nextValue = current.slice(0, Math.max(0, text.length - 1));
        setText(nextValue);

        if (!nextValue) {
          setIsDeleting(false);
          setActiveIndex((currentIndex) => (currentIndex + 1) % safeItems.length);
        }
      },
      !isDeleting && text === current ? holdDelay : isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => window.clearTimeout(timeout);
  }, [activeIndex, deletingSpeed, holdDelay, isDeleting, reducedMotion, safeItems, text, typingSpeed]);

  return text;
}
