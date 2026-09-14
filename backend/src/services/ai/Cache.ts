export class PromptCache {
  private static cache = new Map<string, { response: string, expiresAt: number }>();
  private static TTL_MS = 1000 * 60 * 60; // 1 hour

  static get(promptKey: string): string | null {
    const cached = this.cache.get(promptKey);
    if (!cached) return null;
    
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(promptKey);
      return null;
    }
    
    return cached.response;
  }

  static set(promptKey: string, response: string) {
    // Basic limit to prevent memory leaks
    if (this.cache.size > 1000) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(promptKey, { response, expiresAt: Date.now() + this.TTL_MS });
  }
}
