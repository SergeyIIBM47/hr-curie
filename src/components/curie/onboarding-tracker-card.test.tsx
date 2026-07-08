import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  OnboardingTrackerCard,
  type OnboardingTrackerData,
} from "./onboarding-tracker-card";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { onboardingPlan: { findUnique: vi.fn() } },
}));

const DATA: OnboardingTrackerData = {
  employeeName: "Kai Nguyen",
  position: "Software Engineer",
  startDate: new Date("2026-05-23T00:00:00.000Z"),
  status: "ON_TRACK",
  steps: [
    { ord: 1, label: "Offer signed", status: "DONE", meta: "May 16" },
    { ord: 2, label: "Equipment & access", status: "CURRENT", meta: "In progress" },
    { ord: 3, label: "30-day review", status: "UPCOMING" },
  ],
};

describe("OnboardingTrackerCard", () => {
  it("renders heading, subtitle, and status pill from data", async () => {
    render(await OnboardingTrackerCard({ data: DATA }));
    expect(screen.getByText("Onboarding · Kai Nguyen")).toBeInTheDocument();
    expect(
      screen.getByText("Software Engineer · starts May 23"),
    ).toBeInTheDocument();
    expect(screen.getByText("On track")).toBeInTheDocument();
  });

  it("renders one dot per step with status-specific labels", async () => {
    render(await OnboardingTrackerCard({ data: DATA }));
    expect(screen.getByLabelText("Step 1 complete")).toBeInTheDocument();
    expect(screen.getByLabelText("Step 2 in progress")).toBeInTheDocument();
    expect(screen.getByLabelText("Step 3 upcoming")).toBeInTheDocument();
    expect(screen.getByText("May 16")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });

  it("renders optional tags after the steps", async () => {
    render(
      await OnboardingTrackerCard({
        data: {
          ...DATA,
          status: "AT_RISK",
          tags: [{ label: "Buddy assigned", variant: "tag" }],
        },
      }),
    );
    expect(screen.getByText("At risk")).toBeInTheDocument();
    expect(screen.getByText("Buddy assigned")).toBeInTheDocument();
  });

  it("renders nothing without data or planId", async () => {
    const { container } = render(await OnboardingTrackerCard({}));
    expect(container).toBeEmptyDOMElement();
  });

  it("fetches the plan by id and maps step meta", async () => {
    vi.mocked(prisma.onboardingPlan.findUnique).mockResolvedValueOnce({
      startDate: new Date("2026-05-23T00:00:00.000Z"),
      status: "ON_TRACK",
      employee: { firstName: "Kai", lastName: "Nguyen", position: null },
      steps: [
        {
          ord: 1,
          label: "Paperwork",
          status: "DONE",
          completedAt: new Date("2026-05-22T00:00:00.000Z"),
        },
        { ord: 2, label: "Welcome", status: "UPCOMING", completedAt: null },
      ],
      // prisma types are irrelevant to the mapping under test
    } as never);

    render(await OnboardingTrackerCard({ planId: "plan-1" }));
    expect(screen.getByText("Onboarding · Kai Nguyen")).toBeInTheDocument();
    expect(screen.getByText("May 22")).toBeInTheDocument();
  });

  it("renders nothing when the plan id is unknown", async () => {
    vi.mocked(prisma.onboardingPlan.findUnique).mockResolvedValueOnce(null);
    const { container } = render(
      await OnboardingTrackerCard({ planId: "missing" }),
    );
    expect(container).toBeEmptyDOMElement();
  });
});
