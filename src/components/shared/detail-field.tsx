interface DetailFieldProps {
  label: string;
  value: string | null | undefined;
  href?: string;
}

export function DetailField({ label, value, href }: DetailFieldProps) {
  return (
    <div>
      <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#8E8E93]">
        {label}
      </p>
      {value != null && value !== "" ? (
        href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[17px] text-[#007AFF] hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-[17px] text-[#1D1D1F]">{value}</p>
        )
      ) : (
        <p className="text-[17px] text-[#AEAEB2]">&mdash;</p>
      )}
    </div>
  );
}
