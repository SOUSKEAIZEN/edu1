import { query } from '../../db';
import { SemanticChunker } from './Chunker';
import { LLMProvider, OpenAIProvider } from '../ai/LLMProvider';

export interface DocumentMetadata {
  title: string;
  source: string;
  uploader_id: string;
  subject_id?: string;
  course_id?: string;
  semester_id?: string;
  document_type: string;
}

export class DocumentPipeline {
  private chunker: SemanticChunker;
  private llm: LLMProvider;

  constructor(llmProvider?: LLMProvider) {
    this.chunker = new SemanticChunker(500, 50);
    this.llm = llmProvider || new OpenAIProvider();
  }

  async processDocument(rawText: string, metadata: DocumentMetadata) {
    console.log(`[DocumentPipeline] Starting ingestion for: ${metadata.title}`);
    
    // 1. Validation & Cleaning
    const cleanText = this.cleanText(rawText);
    
    // 2. Create Document record
    const docRes = await query(`
      INSERT INTO documents (title, type, subject_id, uploader_id, status)
      VALUES ($1, $2, $3, $4, 'PROCESSING') RETURNING id
    `, [metadata.title, metadata.document_type, metadata.subject_id || null, metadata.uploader_id]);
    
    const docId = docRes.rows[0].id;

    // 3. Create Version record (for handling outdated versions)
    const versionRes = await query(`
      INSERT INTO document_versions (document_id, version_number, is_active)
      VALUES ($1, 1, TRUE) RETURNING id
    `, [docId]);
    const versionId = versionRes.rows[0].id;

    try {
      // 4. Chunking
      const chunks = this.chunker.chunkText(cleanText);

      // 5. Embedding & Vector Storage
      for (const chunk of chunks) {
        // Wrap text to prevent prompt injection inside RAG context
        const secureChunkText = `--- DOCUMENT SNIPPET ---\n${chunk.text}\n--- END SNIPPET ---`;
        const embedding = await this.llm.embed!(secureChunkText);
        
        // Use pgvector pg-format for embedding: [0.1, 0.2, ...]
        const embeddingString = `[${embedding.join(',')}]`;

        await query(`
          INSERT INTO document_chunks (document_id, version_id, chunk_text, embedding, metadata)
          VALUES ($1, $2, $3, $4, $5)
        `, [docId, versionId, secureChunkText, embeddingString, JSON.stringify(chunk.metadata)]);
      }

      // 6. Processing Status
      await query(`UPDATE documents SET status = 'READY' WHERE id = $1`, [docId]);
      return { success: true, docId, chunksGenerated: chunks.length };

    } catch (error) {
      await query(`UPDATE documents SET status = 'FAILED' WHERE id = $1`, [docId]);
      throw error;
    }
  }

  private cleanText(text: string): string {
    // Remove null bytes, fix encoding issues, normalize whitespace
    return text.replace(/\0/g, '').replace(/\r\n/g, '\n').replace(/\s{3,}/g, ' \n').trim();
  }
}
