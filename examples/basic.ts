import { readFile } from "node:fs/promises";
import {
  HashingEmbedder,
  RagPipeline,
  evaluateRetrieval,
  Retriever,
  InMemoryVectorStore,
} from "../src/index.js";
import type { Document } from "../src/index.js";

async function main() {
  const docs = JSON.parse(
    await readFile(new URL("../fixtures/docs.json", import.meta.url), "utf8"),
  ) as Document[];

  const embedder = new HashingEmbedder(64);
  const rag = new RagPipeline(embedder);
  const n = await rag.ingest(docs, { chunkSize: 160, overlap: 30 });
  console.log(`Ingested ${n} chunks`);

  const answer = await rag.ask("How does retrieval-augmented generation work?");
  console.log("\n=== Answer ===\n" + answer.answer);
  console.log(
    "\nCitations:",
    answer.citations.map((c) => `${c.chunk.id} (${c.score.toFixed(3)})`),
  );

  const store = new InMemoryVectorStore();
  const chunks = (
    await import("../src/chunking/chunkText.js")
  ).chunkDocuments(docs, { chunkSize: 160, overlap: 30 });
  const embeddings = await embedder.embed(chunks.map((c) => c.text));
  store.upsert(
    chunks.map((c, i) => ({ ...c, embedding: embeddings[i]! })),
  );
  const report = await evaluateRetrieval(
    new Retriever(store, embedder),
    [
      {
        query: "retrieval augmented generation chunks embeddings",
        relevantChunkIds: chunks
          .filter((c) => c.documentId === "doc-rag")
          .map((c) => c.id),
      },
    ],
    3,
  );
  console.log("\nEval hitRate:", report.hitRate);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
