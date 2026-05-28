import { describe, expect, it } from "vitest";
import { TINT_LETTERS, getTintLetter } from "./name-hash";

describe("getTintLetter", () => {
  it("returns one of the six tint letters", () => {
    expect(TINT_LETTERS).toContain(getTintLetter("Sofia Admin"));
  });

  it("is deterministic for the same input", () => {
    const first = getTintLetter("Lina Okafor");
    const second = getTintLetter("Lina Okafor");
    expect(first).toBe(second);
  });

  it("is case-insensitive and whitespace-tolerant", () => {
    expect(getTintLetter("  LINA OKAFOR  ")).toBe(getTintLetter("lina okafor"));
  });

  it("returns the first tint letter for an empty name", () => {
    expect(getTintLetter("")).toBe(TINT_LETTERS[0]);
    expect(getTintLetter("   ")).toBe(TINT_LETTERS[0]);
  });

  it("distributes across multiple tint letters for a sample of names", () => {
    const sample = [
      "Sofia Admin",
      "Lina Okafor",
      "Mei Tanaka",
      "Daniel Reyes",
      "Aoife Walsh",
      "Theo Bennett",
      "Priya Iyer",
      "Marcus Chen",
      "Ines Costa",
      "Olu Adekunle",
      "Eva Schmidt",
      "Yusuf Demir",
    ];
    const distinct = new Set(sample.map(getTintLetter));
    expect(distinct.size).toBeGreaterThanOrEqual(3);
  });
});
