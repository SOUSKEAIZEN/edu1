
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  model?: string;
}

export interface LLMProvider {
  generate(messages: LLMMessage[], options?: LLMOptions): Promise<{ content: string, tokensUsed: number }>;
  stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string, void, unknown>;
  embed(text: string): Promise<number[]>;
}

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private defaultOptions: LLMOptions = {
    maxTokens: 1000,
    temperature: 0.7,
    timeoutMs: 15000,
    model: 'gpt-4'
  };
  
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async generate(messages: LLMMessage[], options?: LLMOptions): Promise<{ content: string, tokensUsed: number }> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Simulate Timeout logic
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('LLM Request Timeout'));
      }, opts.timeoutMs);

      setTimeout(() => {
        clearTimeout(timer);
        resolve({
          content: "This is a deterministic AI placeholder response grounded in context.",
          tokensUsed: 42
        });
      }, 50); // Simulated delay
    });
  }

  async *stream(messages: LLMMessage[], options?: LLMOptions): AsyncGenerator<string, void, unknown> {
    const responseWords = "This is a simulated streaming response from the AI Mentor. It provides explanations without hallucinating or completing assignments for you.".split(' ');
    
    for (const word of responseWords) {
      await new Promise(r => setTimeout(r, 20)); // stream delay
      yield word + ' ';
    }
  }

  async embed(text: string): Promise<number[]> {
    return Array(1536).fill(0.1);
  }
}
