import type { Embedder } from "../embeddings/Embedder.js";
import type { InMemoryVectorStore } from "../vectorstore/InMemoryVectorStore.js";
import type { RetrievalHit } from "../types.js";

export class Retriever {
  constructor(
    private readonly store: InMemoryVectorStore,
    private readonly embedder: Embedder,
  ) {}

  async retrieve(query: string, topK = 3): Promise<RetrievalHit[]> {
    const [q] = await this.embedder.embed([query]);
    return this.store.search(q!, topK);
  }
}
