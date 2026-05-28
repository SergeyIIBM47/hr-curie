import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "./avatar";
import { Pill, type PillVariant } from "./pill";
import { prisma } from "@/lib/prisma";

export interface NoticeView {
  id: string;
  author: string;
  tag: "POLICY" | "TEAM" | "HR" | "EVENT";
  createdAt: Date;
  body: string;
  title: string;
}

interface NoticeBoardCardProps {
  notices?: NoticeView[];
  now?: Date;
  className?: string;
}

const TAG_TO_PILL: Record<
  NoticeView["tag"],
  { variant: PillVariant; label: string }
> = {
  POLICY: { variant: "tag", label: "Policy" },
  TEAM: { variant: "status-info", label: "Team" },
  HR: { variant: "tag", label: "HR" },
  EVENT: { variant: "status-info", label: "Event" },
};

function relativeTime(from: Date, now: Date): string {
  const ms = now.getTime() - from.getTime();
  const minutes = Math.floor(ms / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[from.getUTCMonth()]} ${from.getUTCDate()}`;
}

function renderBody(body: string): React.ReactNode {
  const segments = body.split(/(\*\*[^*]+\*\*)/g);
  return segments.map((seg, i) => {
    if (seg.startsWith("**") && seg.endsWith("**")) {
      return (
        <strong
          key={i}
          className="font-semibold text-[var(--color-curie-fg)]"
        >
          {seg.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={i}>{seg}</React.Fragment>;
  });
}

async function fetchNotices(): Promise<NoticeView[]> {
  const rows = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      author: {
        select: {
          employee: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });
  return rows.map((r) => {
    const e = r.author.employee;
    const author = e ? `${e.firstName} ${e.lastName}` : "Anonymous";
    return {
      id: r.id,
      author,
      tag: r.tag,
      createdAt: r.createdAt,
      body: r.body,
      title: r.title,
    };
  });
}

export async function NoticeBoardCard({
  notices,
  now,
  className,
}: NoticeBoardCardProps) {
  const data = notices ?? (await fetchNotices());
  const referenceNow = now ?? new Date();

  return (
    <div
      data-curie="notice-board"
      className={cn(
        "bg-[var(--color-curie-surface)] rounded-[var(--radius-curie-lg)] p-6",
        className,
      )}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div
            className={cn(
              "font-[family-name:var(--font-curie-display)]",
              "text-[20px] font-medium leading-tight tracking-[-0.015em]",
              "text-[var(--color-curie-fg)]",
            )}
          >
            Notice board
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            Announcements &amp; team updates
          </div>
        </div>
      </div>

      <ul>
        {data.length === 0 ? (
          <li className="py-4 text-[13px] text-[var(--color-curie-fg-muted)]">
            No announcements yet.
          </li>
        ) : (
          data.map((n, i) => {
            const tag = TAG_TO_PILL[n.tag];
            const isUnread = i === 0;
            return (
              <li
                key={n.id}
                className={cn(
                  "flex gap-3.5 py-4",
                  i < data.length - 1
                    ? "border-b border-[var(--color-curie-border)]"
                    : "",
                  i === 0 && "pt-0",
                  i === data.length - 1 && "pb-0",
                )}
              >
                {isUnread ? (
                  <span
                    aria-label="Unread"
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      "bg-[var(--color-curie-brand)]",
                    )}
                  />
                ) : (
                  <span aria-hidden="true" className="w-2 shrink-0" />
                )}
                <Avatar name={n.author} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--color-curie-fg)]">
                      {n.author}
                    </span>
                    <Pill variant={tag.variant}>{tag.label}</Pill>
                    <span
                      className={cn(
                        "font-[family-name:var(--font-curie-mono)]",
                        "text-[11px] text-[var(--color-curie-fg-muted)]",
                      )}
                    >
                      {relativeTime(n.createdAt, referenceNow)}
                    </span>
                  </div>
                  <p className="text-[13px] leading-relaxed text-[var(--color-curie-fg-secondary)]">
                    {renderBody(n.body)}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
