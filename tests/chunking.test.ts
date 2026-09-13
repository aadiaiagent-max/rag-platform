import { describe, expect, it } from "vitest";
import { chunkDocument } from "../src/chunking/chunkText.js";

describe("chunkDocument", () => {
  it("chunks with overlap", () => {
    const doc = { id: "d1", text: "a".repeat(50) };
    const chunks = chunkDocument(doc, { chunkSize: 20, overlap: 5 });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.id).toBe("d1#0");
  });

  it("rejects bad overlap", () => {
    expect(() =>
      chunkDocument({ id: "d", text: "hi" }, { chunkSize: 10, overlap: 10 }),
    ).toThrow(/overlap/);
  });
});
