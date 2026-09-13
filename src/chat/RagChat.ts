import type { Embedder } from "../embeddings/Embedder.js";
import { chunkDocuments } from "../chunking/chunkText.js";
import { InMemoryVectorStore } from "../vectorstore/InMemoryVectorStore.js";
import { Retriever } from "../retrieval/Retriever.js";
import type { ChatAnswer, Document, EmbeddedChunk } from "../types.js";

export interface AnswerGenerator {
  generate(input: { question: string; contexts: string[] }): Promise<string>;
}

/** Simple extractive-ish generator for demos — stitches top contexts. */
export class TemplateAnswerGenerator implements AnswerGenerator {
  async generate(input: { question: string; contexts: string[] }): Promise<string> {
    if (input.contexts.length === 0) {
      return "I don't have enough context to answer that.";
    }
    const joined = input.contexts.map((c, i) => `[${i + 1}] ${c}`).join("\n");
    return `Based on the retrieved context:\n${joined}\n\nQuestion: ${input.question}`;
  }
}

export class RagPipeline {
  private readonly store = new InMemoryVectorStore();
  private readonly retriever: Retriever;

  constructor(
    private readonly embedder: Embedder,
    private readonly generator: AnswerGenerator = new TemplateAnswerGenerator(),
  ) {
    this.retriever = new Retriever(this.store, embedder);
  }

  async ingest(
    docs: Document[],
    chunkOpts?: { chunkSize?: number; overlap?: number },
  ): Promise<number> {
    const chunks = chunkDocuments(docs, chunkOpts);
    const embeddings = await this.embedder.embed(chunks.map((c) => c.text));
    const embedded: EmbeddedChunk[] = chunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i]!,
    }));
    this.store.upsert(embedded);
    return embedded.length;
  }

  async ask(question: string, topK = 3): Promise<ChatAnswer> {
    const citations = await this.retriever.retrieve(question, topK);
    const answer = await this.generator.generate({
      question,
      contexts: citations.map((h) => h.chunk.text),
    });
    return { answer, citations };
  }

  stats(): { chunks: number } {
    return { chunks: this.store.size() };
  }
}
