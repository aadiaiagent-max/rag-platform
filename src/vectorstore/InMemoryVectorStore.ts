import type { EmbeddedChunk, RetrievalHit } from "../types.js";

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("vector length mismatch");
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!;
    const y = b[i]!;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export class InMemoryVectorStore {
  private chunks: EmbeddedChunk[] = [];

  upsert(chunks: EmbeddedChunk[]): void {
    const byId = new Map(this.chunks.map((c) => [c.id, c]));
    for (const c of chunks) byId.set(c.id, c);
    this.chunks = [...byId.values()];
  }

  clear(): void {
    this.chunks = [];
  }

  size(): number {
    return this.chunks.length;
  }

  search(queryEmbedding: number[], topK = 3): RetrievalHit[] {
    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(0, topK));
  }
}
