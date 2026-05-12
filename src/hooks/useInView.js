import { useEffect, useRef, useState } from "react";

export function useInView(options = {}) {
  const {
    threshold = 0.18,
    root = null,
    rootMargin = "0px 0px -8% 0px",
    once = true,
  } = options;
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        root,
        rootMargin,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once, root, rootMargin, threshold]);

  return [ref, isInView];
}
