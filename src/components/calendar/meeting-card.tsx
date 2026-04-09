"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Clock, FileText } from "lucide-react";

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

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> =
  {
    ONE_ON_ONE: {
      label: "One-on-One",
      color: "#007AFF",
      bg: "rgba(0,122,255,0.1)",
    },
    PERFORMANCE_REVIEW: {
      label: "Review",
      color: "#5856D6",
      bg: "rgba(88,86,214,0.1)",
    },
  };

function ParticipantAvatar({
  participant,
  index,
}: {
  participant: Participant;
  index: number;
}) {
  const emp = participant.user.employee;
  const initials = emp
    ? `${emp.firstName[0]}${emp.lastName[0]}`
    : participant.user.email[0].toUpperCase();

  return (
    <div
      className="relative flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#E5E5EA] text-[10px] font-semibold text-[#3C3C43]"
      style={{ marginLeft: index > 0 ? -8 : 0, zIndex: 10 - index }}
      title={emp ? `${emp.firstName} ${emp.lastName}` : participant.user.email}
    >
      {emp?.avatarUrl ? (
        <img
          src={emp.avatarUrl}
          alt=""
          className="size-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const [expanded, setExpanded] = useState(false);

  const time = new Date(meeting.scheduledAt);
  const timeStr = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = new Date(
    time.getTime() + meeting.durationMinutes * 60_000,
  );
  const endStr = endTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const typeConfig = TYPE_CONFIG[meeting.type] ?? {
    label: meeting.type,
    color: "#8E8E93",
    bg: "rgba(142,142,147,0.1)",
  };

  const visibleParticipants = meeting.participants.slice(0, 3);
  const overflow = meeting.participants.length - 3;

  return (
    <div className="rounded-[10px] bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-start gap-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-[#8E8E93]" />
            <span className="text-[13px] font-semibold text-[#1D1D1F]">
              {timeStr} - {endStr}
            </span>
          </div>

          <p className="truncate text-[15px] font-medium text-[#1D1D1F]">
            {meeting.title}
          </p>

          <div className="mt-1.5 flex items-center gap-2">
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                color: typeConfig.color,
                backgroundColor: typeConfig.bg,
              }}
            >
              {typeConfig.label}
            </span>

            <div className="flex items-center">
              {visibleParticipants.map((p, i) => (
                <ParticipantAvatar
                  key={p.user.id}
                  participant={p}
                  index={i}
                />
              ))}
              {overflow > 0 && (
                <span
                  className="relative flex size-7 items-center justify-center rounded-full border-2 border-white bg-[#F2F2F7] text-[10px] font-semibold text-[#8E8E93]"
                  style={{ marginLeft: -8, zIndex: 6 }}
                >
                  +{overflow}
                </span>
              )}
            </div>
          </div>
        </div>

        {(meeting.notes || meeting.participants.length > 3) && (
          <div className="shrink-0 pt-1 text-[#8E8E93]">
            {expanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </div>
        )}
      </button>

      {expanded && (
        <div className="mt-3 border-t border-[#F2F2F7] pt-3">
          {meeting.notes && (
            <div className="mb-3 flex items-start gap-2">
              <FileText className="mt-0.5 size-3.5 shrink-0 text-[#8E8E93]" />
              <p className="text-[13px] leading-relaxed text-[#3C3C43]">
                {meeting.notes}
              </p>
            </div>
          )}

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">
              Participants
            </p>
            <div className="flex flex-col gap-1.5">
              {meeting.participants.map((p) => {
                const emp = p.user.employee;
                const name = emp
                  ? `${emp.firstName} ${emp.lastName}`
                  : p.user.email;
                const initials = emp
                  ? `${emp.firstName[0]}${emp.lastName[0]}`
                  : p.user.email[0].toUpperCase();

                return (
                  <div
                    key={p.user.id}
                    className="flex items-center gap-2 text-[13px] text-[#1D1D1F]"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#E5E5EA] text-[9px] font-semibold text-[#3C3C43]">
                      {emp?.avatarUrl ? (
                        <img
                          src={emp.avatarUrl}
                          alt=""
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    {name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
