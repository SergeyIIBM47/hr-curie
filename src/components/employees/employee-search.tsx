"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { ISearch } from "@/components/curie";

export function EmployeeSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    const next = params.toString();
    // Bail out when the URL wouldn't change: router.replace() triggers a
    // server round-trip that yields a new searchParams identity, so an
    // unconditional replace re-runs this effect forever.
    if (next === searchParams.toString()) return;
    router.replace(next ? `/employees?${next}` : "/employees");
  }, [debouncedQuery, router, searchParams]);

  return (
    <div role="search" className="relative">
      <ISearch
        className="pointer-events-none absolute left-3 top-1/2 size-[18px] -translate-y-1/2 text-[var(--color-curie-fg-muted)]"
        aria-hidden="true"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search employees..."
        aria-label="Search employees"
        className="h-10 w-full rounded-[var(--radius-curie-sm)] border border-[var(--color-curie-border)] bg-[var(--color-curie-surface)] pl-10 pr-3 text-[14px] text-[var(--color-curie-fg)] outline-none placeholder:text-[var(--color-curie-fg-muted)] focus:border-[var(--color-curie-brand)] focus:ring-2 focus:ring-[var(--color-curie-brand-soft)]"
      />
    </div>
  );
}
