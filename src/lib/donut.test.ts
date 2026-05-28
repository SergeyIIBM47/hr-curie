import { describe, expect, it } from "vitest";
import { computeSlices } from "./donut";

const sum = (values: number[]) => values.reduce((acc, n) => acc + n, 0);

describe("computeSlices", () => {
  it("returns percents summing to 100 for balanced counts", () => {
    const slices = computeSlices([1, 1, 1, 1]);
    const percents = slices.map((s) => s.percent);
    expect(sum(percents)).toBeCloseTo(100, 2);
  });

  it("returns percents summing to 100 for uneven counts", () => {
    const slices = computeSlices([3, 1, 4, 2]);
    expect(sum(slices.map((s) => s.percent))).toBeCloseTo(100, 2);
  });

  it("handles a single non-zero slice", () => {
    const slices = computeSlices([5]);
    expect(slices).toHaveLength(1);
    expect(slices[0].percent).toBe(100);
    expect(slices[0].dasharray).toBe("100 0");
  });

  it("returns all-zero slices when total is zero", () => {
    const slices = computeSlices([0, 0, 0]);
    for (const slice of slices) {
      expect(slice.percent).toBe(0);
      expect(slice.dasharray).toBe("0 100");
    }
  });

  it("dasharray pairs sum to 100 per slice", () => {
    const slices = computeSlices([2, 5, 3]);
    for (const slice of slices) {
      const [a, b] = slice.dasharray.split(" ").map(Number);
      expect(a + b).toBeCloseTo(100, 2);
    }
  });

  it("offsets accumulate so each slice starts where the previous ended", () => {
    const slices = computeSlices([10, 20, 70]);
    expect(slices[0].dashoffset).toBeCloseTo(25, 2);
    expect(slices[1].dashoffset).toBeCloseTo(15, 2); // (100 - 10) + 25 mod 100
    expect(slices[2].dashoffset).toBeCloseTo(95, 2); // (100 - 30) + 25 mod 100 = 95
  });

  it("ignores negative counts", () => {
    const slices = computeSlices([10, -5, 20]);
    const percents = slices.map((s) => s.percent);
    expect(percents[1]).toBe(0);
    expect(sum(percents)).toBeCloseTo(100, 2);
  });

  it("returns one slice per input count", () => {
    expect(computeSlices([1, 2, 3, 4, 5])).toHaveLength(5);
  });
});
