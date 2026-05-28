import * as React from "react";
import { cn } from "@/lib/utils";
import { Pill, type PillVariant } from "./pill";
import { prisma } from "@/lib/prisma";

export interface OnboardingStepView {
  ord: number;
  label: string;
  status: "DONE" | "CURRENT" | "UPCOMING";
  meta?: string;
}

export interface OnboardingTrackerData {
  employeeName: string;
  position: string;
  startDate: Date;
  status: "ON_TRACK" | "AT_RISK" | "BLOCKED" | "COMPLETE";
  steps: OnboardingStepView[];
  tags?: { label: string; variant: PillVariant }[];
}

interface OnboardingTrackerCardProps {
  planId?: string;
  data?: OnboardingTrackerData;
  className?: string;
}

const STATUS_PILL: Record<
  OnboardingTrackerData["status"],
  { variant: PillVariant; label: string }
> = {
  ON_TRACK: { variant: "status-info", label: "On track" },
  AT_RISK: { variant: "status-pending", label: "At risk" },
  BLOCKED: { variant: "status-rejected", label: "Blocked" },
  COMPLETE: { variant: "status-approved", label: "Complete" },
};

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function shortDate(date: Date): string {
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

async function fetchPlan(planId: string): Promise<OnboardingTrackerData | null> {
  const plan = await prisma.onboardingPlan.findUnique({
    where: { id: planId },
    include: {
      employee: { select: { firstName: true, lastName: true, position: true } },
      steps: { orderBy: { ord: "asc" } },
    },
  });
  if (!plan) return null;
  return {
    employeeName: `${plan.employee.firstName} ${plan.employee.lastName}`,
    position: plan.employee.position ?? "",
    startDate: plan.startDate,
    status: plan.status,
    steps: plan.steps.map((s) => ({
      ord: s.ord,
      label: s.label,
      status: s.status,
      meta:
        s.status === "DONE" && s.completedAt
          ? shortDate(s.completedAt)
          : s.status === "CURRENT"
            ? "In progress"
            : undefined,
    })),
  };
}

export async function OnboardingTrackerCard({
  planId,
  data,
  className,
}: OnboardingTrackerCardProps) {
  const resolved =
    data ?? (planId ? await fetchPlan(planId) : null);
  if (!resolved) {
    return null;
  }

  const status = STATUS_PILL[resolved.status];

  return (
    <div
      data-curie="onboarding-tracker"
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
            Onboarding · {resolved.employeeName}
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--color-curie-fg-muted)]">
            {resolved.position} · starts {shortDate(resolved.startDate)}
          </div>
        </div>
        <Pill variant={status.variant}>{status.label}</Pill>
      </div>

      <ol
        data-curie="onboarding-tracker-steps"
        className="mt-2 flex items-start gap-0"
      >
        {resolved.steps.map((step, i) => {
          const isLast = i === resolved.steps.length - 1;
          const next = resolved.steps[i + 1];
          const segmentInk = step.status === "DONE" && next != null;
          return (
            <li
              key={step.ord}
              data-step-status={step.status}
              className="relative flex flex-1 flex-col items-center gap-2"
            >
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute top-[11px] h-px"
                  style={{
                    left: "calc(50% + 14px)",
                    right: "calc(-50% + 14px)",
                    background: segmentInk
                      ? "var(--color-curie-fg)"
                      : "var(--color-curie-border)",
                  }}
                />
              ) : null}
              <TrackerDot ord={step.ord} status={step.status} />
              <div
                className={cn(
                  "text-center text-[12px] font-medium",
                  step.status === "UPCOMING"
                    ? "text-[var(--color-curie-fg-secondary)]"
                    : "text-[var(--color-curie-fg)]",
                )}
              >
                {step.label}
              </div>
              {step.meta ? (
                <div
                  className={cn(
                    "text-center font-[family-name:var(--font-curie-mono)]",
                    "text-[11px] text-[var(--color-curie-fg-muted)]",
                  )}
                >
                  {step.meta}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {resolved.tags && resolved.tags.length > 0 ? (
        <div
          className={cn(
            "mt-[22px] flex gap-2 pt-[18px]",
            "border-t border-[var(--color-curie-border)]",
          )}
        >
          {resolved.tags.map((tag, i) => (
            <Pill key={`${tag.label}-${i}`} variant={tag.variant}>
              {tag.label}
            </Pill>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TrackerDot({
  ord,
  status,
}: {
  ord: number;
  status: OnboardingStepView["status"];
}) {
  const base = cn(
    "grid place-items-center h-6 w-6 rounded-full",
    "font-[family-name:var(--font-curie-mono)] text-[11px] font-semibold",
  );

  if (status === "DONE") {
    return (
      <span
        className={cn(
          base,
          "bg-[var(--color-curie-fg)] text-[var(--color-curie-fg-on-ink)]",
          "border-[1.5px] border-[var(--color-curie-fg)]",
        )}
        aria-label={`Step ${ord} complete`}
      >
        ✓
      </span>
    );
  }

  if (status === "CURRENT") {
    return (
      <span
        className={cn(
          base,
          "bg-[var(--color-curie-brand-soft)]",
          "text-[var(--color-curie-brand-ink)]",
          "border-[1.5px] border-[var(--color-curie-brand-ink)]",
        )}
        aria-label={`Step ${ord} in progress`}
      >
        {ord}
      </span>
    );
  }

  return (
    <span
      className={cn(
        base,
        "bg-[var(--color-curie-surface-sunken)]",
        "text-[var(--color-curie-fg-muted)]",
        "border-[1.5px] border-[var(--color-curie-border-strong)]",
      )}
      aria-label={`Step ${ord} upcoming`}
    >
      {ord}
    </span>
  );
}
