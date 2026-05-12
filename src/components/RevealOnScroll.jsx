import { useInView } from "../hooks/useInView";

export function RevealOnScroll({
  as: Tag = "div",
  className = "",
  children,
  delay = 0,
  threshold = 0.16,
  rootMargin = "0px 0px -8% 0px",
  once = true,
  ...props
}) {
  const [ref, isVisible] = useInView({
    threshold,
    rootMargin,
    once,
  });

  return (
    <Tag
      ref={ref}
      data-visible={isVisible ? "true" : "false"}
      className={`reveal-block ${className}`.trim()}
      style={{
        "--reveal-delay": `${delay}ms`,
        ...(props.style || {}),
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
