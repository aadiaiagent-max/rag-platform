import { describe, expect, it } from "vitest";
import { HashingEmbedder } from "../src/embeddings/Embedder.js";
import { RagPipeline } from "../src/chat/RagChat.js";
import { evaluateRetrieval } from "../src/eval/evaluateRetrieval.js";
import { Retriever } from "../src/retrieval/Retriever.js";
import { InMemoryVectorStore } from "../src/vectorstore/InMemoryVectorStore.js";
import { chunkDocuments } from "../src/chunking/chunkText.js";

describe("RagPipeline", () => {
  it("ingests and answers with citations", async () => {
    const rag = new RagPipeline(new HashingEmbedder(64));
    await rag.ingest([
      {
        id: "gateway",
        text: "An LLM gateway routes traffic, applies rate limits, and logs token usage across providers.",
      },
    ]);
    const res = await rag.ask("What does an LLM gateway do?");
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.answer.toLowerCase()).toMatch(/gateway|rate|provider/);
  });

  it("reports retrieval hit rate", async () => {
    const embedder = new HashingEmbedder(64);
    const docs = [
      {
        id: "agents",
        text: "Agent runtimes call tools in a loop and stream events to the user interface.",
      },
    ];
    const chunks = chunkDocuments(docs, { chunkSize: 200, overlap: 20 });
    const vectors = await embedder.embed(chunks.map((c) => c.text));
    const store = new InMemoryVectorStore();
    store.upsert(chunks.map((c, i) => ({ ...c, embedding: vectors[i]! })));
    const report = await evaluateRetrieval(
      new Retriever(store, embedder),
      [
        {
          query: "tool calling agent runtime stream events",
          relevantChunkIds: chunks.map((c) => c.id),
        },
      ],
      3,
    );
    expect(report.hitRate).toBe(1);
  });
});
