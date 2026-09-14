export class RAGEvaluator {
  
  static evaluateRetrieval(retrievedChunks: string[], expectedKeywords: string[]) {
    if (retrievedChunks.length === 0) return { precision: 0, recall: 0 };

    let relevantRetrieved = 0;
    
    for (const chunk of retrievedChunks) {
      // Very basic heuristic: chunk is relevant if it contains an expected keyword
      const isRelevant = expectedKeywords.some(kw => chunk.toLowerCase().includes(kw.toLowerCase()));
      if (isRelevant) relevantRetrieved++;
    }

    const precision = relevantRetrieved / retrievedChunks.length;
    // Recall is harder to calculate without knowing TOTAL relevant chunks in the entire DB. 
    // We assume expectedKeywords maps 1:1 to desired chunks for this metric.
    const recall = relevantRetrieved / expectedKeywords.length; 

    return {
      precision,
      recall,
      f1: (2 * precision * recall) / (precision + recall || 1)
    };
  }
}
