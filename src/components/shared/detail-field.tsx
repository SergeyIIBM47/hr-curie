import { cn } from "@/lib/utils";

interface DetailFieldProps {
  label: string;
  value: string | null | undefined;
  href?: string;
}

const LABEL_CLASS = cn(
  "mb-1 text-[11px] font-medium uppercase tracking-[0.06em]",
  "font-[family-name:var(--font-curie-mono)]",
  "text-[var(--color-curie-fg-muted)]",
);

const VALUE_CLASS = "text-[15px] text-[var(--color-curie-fg)]";

export function DetailField({ label, value, href }: DetailFieldProps) {
  const hasValue = value != null && value !== "";

  return (
    <div>
      <p className={LABEL_CLASS}>{label}</p>
      {hasValue ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(VALUE_CLASS, "text-[var(--color-curie-brand)] hover:underline")}
          >
            {value}
          </a>
        ) : (
          <p className={VALUE_CLASS}>{value}</p>
        )
      ) : (
        <p className={cn(VALUE_CLASS, "text-[var(--color-curie-fg-muted)]")}>
          &mdash;
        </p>
      )}
    </div>
  );
}
