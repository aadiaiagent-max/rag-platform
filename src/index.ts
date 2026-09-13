export type {
  Document,
  Chunk,
  EmbeddedChunk,
  RetrievalHit,
  ChatAnswer,
} from "./types.js";
export { chunkDocument, chunkDocuments } from "./chunking/chunkText.js";
export type { ChunkOptions } from "./chunking/chunkText.js";
export { HashingEmbedder } from "./embeddings/Embedder.js";
export type { Embedder } from "./embeddings/Embedder.js";
export {
  InMemoryVectorStore,
  cosineSimilarity,
} from "./vectorstore/InMemoryVectorStore.js";
export { Retriever } from "./retrieval/Retriever.js";
export {
  RagPipeline,
  TemplateAnswerGenerator,
} from "./chat/RagChat.js";
export type { AnswerGenerator } from "./chat/RagChat.js";
export { evaluateRetrieval } from "./eval/evaluateRetrieval.js";
export type { EvalCase, EvalReport } from "./eval/evaluateRetrieval.js";
