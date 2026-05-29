"use client";

import { useState } from "react";
import { Avatar, Pill, IClock, IDoc } from "@/components/curie";
import { cn } from "@/lib/utils";

interface Participant {
  user: {
    id: string;
    email: string;
    employee: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    } | null;
  };
}

export interface Meeting {
  id: string;
  title: string;
  type: string;
  scheduledAt: string;
  durationMinutes: number;
  notes: string | null;
  createdBy: string;
  participants: Participant[];
}

const TYPE_LABEL: Record<string, string> = {
  ONE_ON_ONE: "One-on-One",
  PERFORMANCE_REVIEW: "Review",
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTime(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function participantName(p: Participant): string {
  const emp = p.user.employee;
  return emp ? `${emp.firstName} ${emp.lastName}` : p.user.email;
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(false);

  const start = new Date(meeting.scheduledAt);
  const end = new Date(start.getTime() + meeting.durationMinutes * 60_000);
  const now = new Date();
  const isNow = now.getTime() >= start.getTime() && now.getTime() < end.getTime();

  const timeStr = formatTime(start);
  const endStr = formatTime(end);

  const label = TYPE_LABEL[meeting.type] ?? meeting.type;

  const collapsible = Boolean(
    meeting.notes || meeting.participants.length > 0,
  );

  return (
    <article
      data-curie="sched-card"
      data-curie-now={isNow || undefined}
      className={cn(
        "relative",
        "bg-[var(--color-curie-surface)]",
        "rounded-[var(--radius-curie-md)]",
        "py-3.5 pl-4 pr-4",
        isNow && "shadow-[var(--shadow-curie-soft)]",
      )}
    >
      {isNow ? (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-3.5 bottom-3.5",
            "w-[3px] rounded-r-sm",
            "bg-[var(--color-curie-fg)]",
          )}
        />
      ) : null}

      <button
        type="button"
        onClick={() => collapsible && setExpanded((prev) => !prev)}
        aria-expanded={collapsible ? expanded : undefined}
        aria-label={`${meeting.title} — ${timeStr} to ${endStr}`}
        className={cn(
          "flex w-full flex-col items-start text-left",
          !collapsible && "cursor-default",
        )}
      >
        <div
          className={cn(
            "mb-1.5 flex items-center gap-1.5",
            "font-[family-name:var(--font-curie-mono)]",
            "text-[11px] text-[var(--color-curie-fg-muted)]",
          )}
        >
          <IClock width={14} height={14} />
          <span>
            {timeStr} — {endStr}
            {isNow ? " · Now" : ""}
          </span>
        </div>

        <div
          className={cn(
            "mb-2 font-[family-name:var(--font-curie-display)]",
            "text-[15px] font-medium leading-tight tracking-[-0.01em]",
            "text-[var(--color-curie-fg)]",
          )}
        >
          {meeting.title}
        </div>

        <div className="flex w-full items-center justify-between gap-2.5">
          <div className="flex items-center">
            {meeting.participants.slice(0, 3).map((p, i) => {
              const emp = p.user.employee;
              return (
                <span
                  key={p.user.id}
                  style={{ marginLeft: i === 0 ? 0 : -8 }}
                  className="inline-flex"
                >
                  <Avatar
                    name={participantName(p)}
                    size="sm"
                    bordered
                    imageSrc={emp?.avatarUrl ?? undefined}
                  />
                </span>
              );
            })}
            {meeting.participants.length > 3 ? (
              <span
                aria-label={`${meeting.participants.length - 3} more`}
                className={cn(
                  "ml-[-8px] inline-grid place-items-center",
                  "size-7 rounded-[var(--radius-curie-pill)]",
                  "border-2 border-[var(--color-curie-surface)]",
                  "bg-[var(--color-curie-surface-sunken)]",
                  "text-[10px] font-semibold",
                  "text-[var(--color-curie-fg-secondary)]",
                )}
              >
                +{meeting.participants.length - 3}
              </span>
            ) : null}
          </div>

          <Pill variant="tag">{label}</Pill>
        </div>
      </button>

      {collapsible && expanded ? (
        <div
          className={cn(
            "mt-3 border-t pt-3",
            "border-[var(--color-curie-border)]",
          )}
        >
          {meeting.notes ? (
            <div className="mb-3 flex items-start gap-2">
              <IDoc
                width={14}
                height={14}
                className="mt-0.5 shrink-0 text-[var(--color-curie-fg-muted)]"
              />
              <p className="text-[13px] leading-relaxed text-[var(--color-curie-fg-secondary)]">
                {meeting.notes}
              </p>
            </div>
          ) : null}

          {meeting.participants.length > 0 ? (
            <div>
              <p
                className={cn(
                  "mb-2 font-[family-name:var(--font-curie-mono)]",
                  "text-[10px] font-medium uppercase tracking-[0.08em]",
                  "text-[var(--color-curie-fg-muted)]",
                )}
              >
                Participants
              </p>
              <div className="flex flex-col gap-1.5">
                {meeting.participants.map((p) => {
                  const emp = p.user.employee;
                  const name = participantName(p);
                  return (
                    <div
                      key={p.user.id}
                      className={cn(
                        "flex items-center gap-2",
                        "text-[13px] text-[var(--color-curie-fg)]",
                      )}
                    >
                      <Avatar
                        name={name}
                        size="xs"
                        imageSrc={emp?.avatarUrl ?? undefined}
                      />
                      {name}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
