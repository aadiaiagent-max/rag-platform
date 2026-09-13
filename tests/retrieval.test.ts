import { describe, expect, it } from "vitest";
import { HashingEmbedder } from "../src/embeddings/Embedder.js";
import { InMemoryVectorStore, cosineSimilarity } from "../src/vectorstore/InMemoryVectorStore.js";
import { Retriever } from "../src/retrieval/Retriever.js";
import { chunkDocuments } from "../src/chunking/chunkText.js";
import type { Document } from "../src/types.js";

const docs: Document[] = [
  {
    id: "cats",
    text: "Cats are independent pets that enjoy napping in sunbeams and chasing lasers.",
  },
  {
    id: "rag",
    text: "Retrieval-augmented generation embeds document chunks and retrieves nearest neighbors for a query.",
  },
];

describe("retrieval", () => {
  it("ranks relevant chunk highest", async () => {
    const embedder = new HashingEmbedder(64);
    const store = new InMemoryVectorStore();
    const chunks = chunkDocuments(docs, { chunkSize: 200, overlap: 20 });
    const vectors = await embedder.embed(chunks.map((c) => c.text));
    store.upsert(chunks.map((c, i) => ({ ...c, embedding: vectors[i]! })));

    const retriever = new Retriever(store, embedder);
    const hits = await retriever.retrieve("retrieval embeddings nearest neighbors", 2);
    expect(hits[0]?.chunk.documentId).toBe("rag");
    expect(hits[0]!.score).toBeGreaterThan(hits[1]!.score);
  });

  it("cosine similarity is 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
  });
});
