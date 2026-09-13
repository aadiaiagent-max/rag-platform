export interface Document {
  id: string;
  text: string;
  metadata?: Record<string, string>;
}

export interface Chunk {
  id: string;
  documentId: string;
  text: string;
  index: number;
  metadata?: Record<string, string>;
}

export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

export interface RetrievalHit {
  chunk: EmbeddedChunk;
  score: number;
}

export interface ChatAnswer {
  answer: string;
  citations: RetrievalHit[];
}
