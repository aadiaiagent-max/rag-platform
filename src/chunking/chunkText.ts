import type { Chunk, Document } from "../types.js";

export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

/** Character-window chunker with overlap — deterministic and easy to reason about. */
export function chunkDocument(
  doc: Document,
  options: ChunkOptions = {},
): Chunk[] {
  const chunkSize = options.chunkSize ?? 200;
  const overlap = options.overlap ?? 40;
  if (chunkSize <= 0) throw new Error("chunkSize must be > 0");
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be >= 0 and < chunkSize");
  }

  const text = doc.text.trim();
  if (!text) return [];

  const chunks: Chunk[] = [];
  let start = 0;
  let index = 0;
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const slice = text.slice(start, end).trim();
    if (slice) {
      chunks.push({
        id: `${doc.id}#${index}`,
        documentId: doc.id,
        text: slice,
        index,
        metadata: doc.metadata,
      });
      index += 1;
    }
    if (end >= text.length) break;
    start = end - overlap;
  }
  return chunks;
}

export function chunkDocuments(
  docs: Document[],
  options?: ChunkOptions,
): Chunk[] {
  return docs.flatMap((d) => chunkDocument(d, options));
}
