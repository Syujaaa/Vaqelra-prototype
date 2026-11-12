import { Link } from "react-router-dom";

export function PageContainer({
  as: Element = "div",
  size = "wide",
  className = "",
  children,
  ...props
}) {
  const widths = {
    wide: "max-w-6xl",
    content: "max-w-5xl",
    narrow: "max-w-2xl",
  };

  return (
    <Element
      className={`mx-auto w-full ${widths[size] ?? widths.wide} px-5 sm:px-8 ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}

export function PageTitle({
  as: Element = "h1",
  size = "page",
  className = "",
  children,
  ...props
}) {
  const sizes = {
    page: "text-4xl sm:text-5xl",
    hero: "text-4xl sm:text-6xl",
    compact: "text-3xl",
  };

  return (
    <Element
      className={`font-display ${sizes[size] ?? sizes.page} leading-tight tracking-tight ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}

export function SectionTitle({
  as: Element = "h2",
  size = "section",
  className = "",
  children,
  ...props
}) {
  const sizes = {
    section: "text-3xl",
    small: "text-xl",
  };

  return (
    <Element
      className={`font-display ${sizes[size] ?? sizes.section} leading-tight tracking-tight ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}

export function ActionLink({
  to,
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const styles = {
    primary:
      "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-amber px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-soft active:translate-y-px",
    text: "inline-flex min-h-11 items-center gap-1.5 text-sm text-teal underline underline-offset-4 transition-colors hover:text-ink",
  };

  return (
    <Link
      to={to}
      className={`${styles[variant] ?? styles.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </Link>
  );
}

export function Surface({
  as: Element = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Element
      className={`border border-ink-700 bg-ink-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </Element>
  );
}
