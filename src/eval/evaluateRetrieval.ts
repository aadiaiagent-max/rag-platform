import type { Retriever } from "../retrieval/Retriever.js";

export interface EvalCase {
  query: string;
  /** Chunk ids that should appear in top-k for a hit. */
  relevantChunkIds: string[];
}

export interface EvalReport {
  cases: number;
  hits: number;
  hitRate: number;
  details: Array<{ query: string; hit: boolean; retrievedIds: string[] }>;
}

/** Top-k hit-rate eval — enough to prove the retrieval loop is measurable. */
export async function evaluateRetrieval(
  retriever: Retriever,
  cases: EvalCase[],
  topK = 3,
): Promise<EvalReport> {
  const details: EvalReport["details"] = [];
  let hits = 0;
  for (const c of cases) {
    const results = await retriever.retrieve(c.query, topK);
    const retrievedIds = results.map((r) => r.chunk.id);
    const hit = c.relevantChunkIds.some((id) => retrievedIds.includes(id));
    if (hit) hits += 1;
    details.push({ query: c.query, hit, retrievedIds });
  }
  return {
    cases: cases.length,
    hits,
    hitRate: cases.length === 0 ? 0 : hits / cases.length,
    details,
  };
}
