import { describe, expect, it } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("The Sunken City")).toBe("the-sunken-city");
  });

  it("strips non-alphanumeric characters", () => {
    expect(slugify("Blackwood's Keep!")).toBe("blackwood-s-keep");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Edge Cases--  ")).toBe("edge-cases");
  });
});
