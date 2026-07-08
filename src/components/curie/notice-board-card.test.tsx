import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoticeBoardCard, type NoticeView } from "./notice-board-card";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { announcement: { findMany: vi.fn() } },
}));

const NOW = new Date("2026-05-26T09:35:00.000Z");

function notice(overrides: Partial<NoticeView>): NoticeView {
  return {
    id: "n-1",
    author: "Sofia Admin",
    tag: "POLICY",
    createdAt: new Date("2026-05-26T09:00:00.000Z"),
    title: "Policy update",
    body: "Plain body",
    ...overrides,
  };
}

describe("NoticeBoardCard", () => {
  it("renders the card heading and one notice per row", async () => {
    render(
      await NoticeBoardCard({
        now: NOW,
        notices: [
          notice({ id: "a", author: "Sofia Admin" }),
          notice({ id: "b", author: "Lina Okafor", tag: "TEAM" }),
        ],
      }),
    );
    expect(screen.getByText("Notice board")).toBeInTheDocument();
    expect(screen.getByText("Sofia Admin")).toBeInTheDocument();
    expect(screen.getByText("Lina Okafor")).toBeInTheDocument();
  });

  it("maps tags to pill labels and marks only the first notice unread", async () => {
    render(
      await NoticeBoardCard({
        now: NOW,
        notices: [
          notice({ id: "a", tag: "POLICY" }),
          notice({ id: "b", tag: "TEAM" }),
          notice({ id: "c", tag: "HR" }),
        ],
      }),
    );
    expect(screen.getByText("Policy")).toBeInTheDocument();
    expect(screen.getByText("Team")).toBeInTheDocument();
    expect(screen.getByText("HR")).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: "Unread" })).toHaveLength(1);
  });

  it("renders **bold** body segments as strong text", async () => {
    render(
      await NoticeBoardCard({
        now: NOW,
        notices: [notice({ body: "Read the **new policy** today" })],
      }),
    );
    const strong = screen.getByText("new policy");
    expect(strong.tagName).toBe("STRONG");
  });

  it("formats relative times across all ranges", async () => {
    const cases: [Date, string][] = [
      [new Date("2026-05-26T09:34:30.000Z"), "just now"],
      [new Date("2026-05-26T09:30:00.000Z"), "5m ago"],
      [new Date("2026-05-26T06:35:00.000Z"), "3h ago"],
      [new Date("2026-05-25T09:00:00.000Z"), "Yesterday"],
      [new Date("2026-05-23T09:35:00.000Z"), "3d ago"],
      [new Date("2026-05-10T09:35:00.000Z"), "May 10"],
    ];
    render(
      await NoticeBoardCard({
        now: NOW,
        notices: cases.map(([createdAt], i) =>
          notice({ id: `n-${i}`, createdAt }),
        ),
      }),
    );
    for (const [, label] of cases) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("shows the empty state without notices", async () => {
    render(await NoticeBoardCard({ now: NOW, notices: [] }));
    expect(screen.getByText("No announcements yet.")).toBeInTheDocument();
  });

  it("fetches notices via prisma and falls back to Anonymous", async () => {
    vi.mocked(prisma.announcement.findMany).mockResolvedValueOnce([
      {
        id: "db-1",
        tag: "EVENT",
        createdAt: new Date("2026-05-26T09:00:00.000Z"),
        title: "Summer party",
        body: "Save the date",
        author: { employee: null },
      },
      {
        id: "db-2",
        tag: "HR",
        createdAt: new Date("2026-05-26T08:00:00.000Z"),
        title: "Benefits",
        body: "Enroll now",
        author: { employee: { firstName: "Sofia", lastName: "Admin" } },
      },
      // prisma types are irrelevant to the mapping under test
    ] as never);

    render(await NoticeBoardCard({ now: NOW }));
    expect(screen.getByText("Anonymous")).toBeInTheDocument();
    expect(screen.getByText("Sofia Admin")).toBeInTheDocument();
    expect(screen.getByText("Event")).toBeInTheDocument();
  });
});
