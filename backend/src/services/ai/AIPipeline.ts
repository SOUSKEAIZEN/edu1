import { LLMProvider, OpenAIProvider } from './LLMProvider';
import { PromptEngine, MentorMode } from './PromptEngine';
import { ContextBuilder } from './ContextBuilder';
import { Retriever } from '../rag/Retriever';
import { ConversationService } from './ConversationService';
import { PromptCache } from './Cache';

export class AIPipeline {
  private llm: LLMProvider;

  constructor(provider?: LLMProvider) {
    this.llm = provider || new OpenAIProvider();
  }

  async processQuery(studentUserId: string, conversationId: string, query: string, mode: MentorMode = 'LEARN') {
    try {
      // 1. Save user message
      await ConversationService.addMessage(conversationId, 'user', query);

      // 2. Intent & Context
      const intent = ContextBuilder.detectIntent(query);
      const contextItems = await ContextBuilder.buildContext(studentUserId, query);
      
      let ragContext = '';
      if (intent === 'GENERAL_MENTORING' || intent === 'ACADEMIC_QUERY') {
        const retriever = new Retriever(this.llm);
        const chunks = await retriever.search(query, {}, 3).catch(() => []); // graceful fallback on RAG failure
        ragContext = Retriever.formatForPrompt(chunks);
      }

      const contextString = JSON.stringify(contextItems, null, 2) + '\n\n' + ragContext;

      // 3. History
      const historyRaw = await ConversationService.getMessages(conversationId);
      // Take last 5 messages for context window size limits
      const history = historyRaw.slice(-5).map(m => ({ role: m.role, content: m.content }));

      // 4. Build Prompts
      const systemMessage = PromptEngine.getSystemPrompt(mode, 'v1');
      const userMessage = PromptEngine.constructPrompt(intent, contextString, query, history);

      // 5. Generate with Cost Control (Timeout & Tokens)
      
      const cacheKey = require('crypto').createHash('sha256').update(systemMessage + userMessage).digest('hex');
      const cachedResponse = PromptCache.get(cacheKey);
      
      let responseContent = '';
      let tokensUsed = 0;
      
      if (cachedResponse) {
        responseContent = cachedResponse;
      } else {
        const response = await this.llm.generate([
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ], { maxTokens: 800, timeoutMs: 10000 });
        responseContent = response.content;
        tokensUsed = tokensUsed;
        PromptCache.set(cacheKey, responseContent);
      }


      // 6. Validation
      const validatedResponse = this.validateResponse(responseContent);

      // 7. Save assistant message
      const savedMsg = await ConversationService.addMessage(conversationId, 'assistant', validatedResponse, tokensUsed);

      return {
        messageId: savedMsg.id,
        intent,
        contextUsed: contextItems.map(c => c.type),
        response: validatedResponse
      };
    } catch (error: any) {
      console.error(JSON.stringify({ event: 'AI_FAILURE', student_id: studentUserId, error: error.message, timestamp: new Date().toISOString() }));
      // Graceful fallback if AI provider fails
      const fallbackMessage = "I'm currently experiencing a connection issue and cannot analyze the data right now. Please try again later or reach out to your human mentor if you need immediate assistance.";
      
      const savedMsg = await ConversationService.addMessage(conversationId, 'assistant', fallbackMessage, 0);
      return {
        messageId: savedMsg.id,
        intent: 'UNKNOWN',
        contextUsed: [],
        response: fallbackMessage
      };
    }
  }

  async *streamQuery(studentUserId: string, conversationId: string, query: string, mode: MentorMode = 'LEARN') {
    // Save user message
    await ConversationService.addMessage(conversationId, 'user', query);
    
    // (Abbreviated context build for streaming for demonstration, usually identical to processQuery)
    const systemMessage = PromptEngine.getSystemPrompt(mode, 'v1');
    const userMessage = PromptEngine.constructPrompt('GENERAL_MENTORING', '{}', query, []);
    
    let fullResponse = '';
    try {
      const stream = this.llm.stream([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], { maxTokens: 800, timeoutMs: 15000 });
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk;
      }
      
      // Save after stream completes
      await ConversationService.addMessage(conversationId, 'assistant', this.validateResponse(fullResponse), 0);
    } catch (e) {
      const fallback = " Connection error occurred.";
      fullResponse += fallback;
      yield fallback;
      await ConversationService.addMessage(conversationId, 'assistant', fullResponse, 0);
    }
  }

  private validateResponse(response: string): string {
    if (response.includes('SELECT * FROM')) {
      return "I'm sorry, I cannot process that request.";
    }
    // Prevent prompt leaking
    if (response.includes('SAFETY & INTEGRITY PROTOCOLS')) {
      return "I am an AI Mentor designed to assist you.";
    }
    return response;
  }
}
