"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SemanticChunker = void 0;
class SemanticChunker {
    maxTokens;
    overlap;
    constructor(maxTokens = 500, overlap = 50) {
        this.maxTokens = maxTokens;
        this.overlap = overlap;
    }
    /**
     * Attempts to split by natural boundaries (paragraphs, sentences) rather than blindly mid-word.
     */
    chunkText(text) {
        const chunks = [];
        // Basic heuristic: split by double newline (paragraphs), then fallback to single newline, then periods.
        let paragraphs = text.split(/\n\s*\n/);
        let currentChunkText = '';
        let startChar = 0;
        for (let i = 0; i < paragraphs.length; i++) {
            const p = paragraphs[i].trim();
            if (!p)
                continue;
            // Roughly estimate tokens by word count (1 token ≈ 0.75 words)
            const currentTokenEstimate = (currentChunkText.length + p.length) / 4;
            if (currentTokenEstimate > this.maxTokens && currentChunkText.length > 0) {
                // Finalize chunk
                chunks.push({
                    text: currentChunkText.trim(),
                    metadata: { startChar, endChar: startChar + currentChunkText.length }
                });
                // Handle overlap by bringing the last chunk of text over
                const words = currentChunkText.split(' ');
                const overlapText = words.slice(Math.max(words.length - this.overlap, 0)).join(' ');
                startChar += currentChunkText.length - overlapText.length;
                currentChunkText = overlapText + ' ' + p;
            }
            else {
                currentChunkText += (currentChunkText ? '\n\n' : '') + p;
            }
        }
        if (currentChunkText.trim()) {
            chunks.push({
                text: currentChunkText.trim(),
                metadata: { startChar, endChar: startChar + currentChunkText.length }
            });
        }
        return chunks;
    }
}
exports.SemanticChunker = SemanticChunker;
