/** Pluggable embedding backend. */
export interface Embedder {
  readonly dimensions: number;
  embed(texts: string[]): Promise<number[][]>;
}

/**
 * Deterministic bag-of-hashed-tokens embedder for tests/demos.
 * No model download or API key. Similar texts get similar vectors.
 */
export class HashingEmbedder implements Embedder {
  constructor(public readonly dimensions = 64) {
    if (dimensions < 8) throw new Error("dimensions must be >= 8");
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.embedOne(t));
  }

  private embedOne(text: string): number[] {
    const vec = new Array<number>(this.dimensions).fill(0);
    const tokens = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    for (const token of tokens) {
      const h = fnv1a(token);
      const idx = h % this.dimensions;
      const sign = h & 1 ? 1 : -1;
      vec[idx] += sign;
    }
    return l2Normalize(vec);
  }
}

function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function l2Normalize(v: number[]): number[] {
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}
