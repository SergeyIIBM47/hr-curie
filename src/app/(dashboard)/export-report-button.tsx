"use client";

import { Btn, IDoc } from "@/components/curie";

interface ExportReportButtonProps {
  csv: string;
  filename: string;
}

export function ExportReportButton({ csv, filename }: ExportReportButtonProps) {
  function handleExport() {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Btn variant="secondary" icon={IDoc} onClick={handleExport}>
      Export report
    </Btn>
  );
}
