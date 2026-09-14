import { query } from '../../db';
import { LLMProvider, OpenAIProvider } from '../ai/LLMProvider';

export interface RetrievalFilters {
  subject_id?: string;
  document_type?: string;
}

export class Retriever {
  private llm: LLMProvider;

  constructor(llmProvider?: LLMProvider) {
    this.llm = llmProvider || new OpenAIProvider();
  }

  async search(userQuery: string, filters: RetrievalFilters, limit = 5) {
    // 1. Embed query
    const queryEmbedding = await this.llm.embed!(userQuery);
    const embeddingString = `[${queryEmbedding.join(',')}]`;

    // 2. Vector Search (Cosine similarity <=> in pgvector)
    // We only retrieve chunks from ACTIVE document versions to prevent outdated info
    
    let sql = `
      SELECT 
        dc.id, 
        dc.chunk_text, 
        1 - (dc.embedding <=> $1::vector) as similarity,
        d.title as document_title,
        d.id as document_id
      FROM document_chunks dc
      JOIN document_versions dv ON dc.version_id = dv.id
      JOIN documents d ON dc.document_id = d.id
      WHERE dv.is_active = TRUE AND d.status = 'READY'
    `;
    
    const params: any[] = [embeddingString];
    let paramIndex = 2;

    if (filters.subject_id) {
      sql += ` AND d.subject_id = $${paramIndex}`;
      params.push(filters.subject_id);
      paramIndex++;
    }

    if (filters.document_type) {
      sql += ` AND d.type = $${paramIndex}`;
      params.push(filters.document_type);
      paramIndex++;
    }

    // Sort by similarity and limit
    sql += ` ORDER BY dc.embedding <=> $1::vector LIMIT $${paramIndex}`;
    params.push(limit);

    const res = await query(sql, params);
    
    // 3. Optional Reranking (Mocked here, could use Cohere Rerank API)
    return this.rerank(res.rows, userQuery);
  }

  private rerank(chunks: any[], query: string) {
    // Simple mock reranker: bump chunks that have exact keyword matches
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
    
    return chunks.sort((a, b) => {
      let aScore = a.similarity;
      let bScore = b.similarity;
      
      keywords.forEach(k => {
        if (a.chunk_text.toLowerCase().includes(k)) aScore += 0.05;
        if (b.chunk_text.toLowerCase().includes(k)) bScore += 0.05;
      });
      
      return bScore - aScore;
    });
  }

  static formatForPrompt(chunks: any[]): string {
    if (chunks.length === 0) return "No relevant documents found.";
    
    let formatted = "--- RETRIEVED KNOWLEDGE BASE ---\n";
    chunks.forEach((c, idx) => {
      formatted += `\n[Citation: ${c.document_title} (ID: ${c.document_id})]\n${c.chunk_text}\n`;
    });
    return formatted;
  }
}
