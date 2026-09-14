"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIPipeline = void 0;
const LLMProvider_1 = require("./LLMProvider");
const PromptEngine_1 = require("./PromptEngine");
const ContextBuilder_1 = require("./ContextBuilder");
const Retriever_1 = require("../rag/Retriever");
const ConversationService_1 = require("./ConversationService");
const Cache_1 = require("./Cache");
class AIPipeline {
    llm;
    constructor(provider) {
        this.llm = provider || new LLMProvider_1.OpenAIProvider();
    }
    async processQuery(studentUserId, conversationId, query, mode = 'LEARN') {
        try {
            // 1. Save user message
            await ConversationService_1.ConversationService.addMessage(conversationId, 'user', query);
            // 2. Intent & Context
            const intent = ContextBuilder_1.ContextBuilder.detectIntent(query);
            const contextItems = await ContextBuilder_1.ContextBuilder.buildContext(studentUserId, query);
            let ragContext = '';
            if (intent === 'GENERAL_MENTORING' || intent === 'ACADEMIC_QUERY') {
                const retriever = new Retriever_1.Retriever(this.llm);
                const chunks = await retriever.search(query, {}, 3).catch(() => []); // graceful fallback on RAG failure
                ragContext = Retriever_1.Retriever.formatForPrompt(chunks);
            }
            const contextString = JSON.stringify(contextItems, null, 2) + '\n\n' + ragContext;
            // 3. History
            const historyRaw = await ConversationService_1.ConversationService.getMessages(conversationId);
            // Take last 5 messages for context window size limits
            const history = historyRaw.slice(-5).map(m => ({ role: m.role, content: m.content }));
            // 4. Build Prompts
            const systemMessage = PromptEngine_1.PromptEngine.getSystemPrompt(mode, 'v1');
            const userMessage = PromptEngine_1.PromptEngine.constructPrompt(intent, contextString, query, history);
            // 5. Generate with Cost Control (Timeout & Tokens)
            const cacheKey = require('crypto').createHash('sha256').update(systemMessage + userMessage).digest('hex');
            const cachedResponse = Cache_1.PromptCache.get(cacheKey);
            let responseContent = '';
            let tokensUsed = 0;
            if (cachedResponse) {
                responseContent = cachedResponse;
            }
            else {
                const response = await this.llm.generate([
                    { role: 'system', content: systemMessage },
                    { role: 'user', content: userMessage }
                ], { maxTokens: 800, timeoutMs: 10000 });
                responseContent = response.content;
                tokensUsed = tokensUsed;
                Cache_1.PromptCache.set(cacheKey, responseContent);
            }
            // 6. Validation
            const validatedResponse = this.validateResponse(responseContent);
            // 7. Save assistant message
            const savedMsg = await ConversationService_1.ConversationService.addMessage(conversationId, 'assistant', validatedResponse, tokensUsed);
            return {
                messageId: savedMsg.id,
                intent,
                contextUsed: contextItems.map(c => c.type),
                response: validatedResponse
            };
        }
        catch (error) {
            console.error(JSON.stringify({ event: 'AI_FAILURE', student_id: studentUserId, error: error.message, timestamp: new Date().toISOString() }));
            // Graceful fallback if AI provider fails
            const fallbackMessage = "I'm currently experiencing a connection issue and cannot analyze the data right now. Please try again later or reach out to your human mentor if you need immediate assistance.";
            const savedMsg = await ConversationService_1.ConversationService.addMessage(conversationId, 'assistant', fallbackMessage, 0);
            return {
                messageId: savedMsg.id,
                intent: 'UNKNOWN',
                contextUsed: [],
                response: fallbackMessage
            };
        }
    }
    async *streamQuery(studentUserId, conversationId, query, mode = 'LEARN') {
        // Save user message
        await ConversationService_1.ConversationService.addMessage(conversationId, 'user', query);
        // (Abbreviated context build for streaming for demonstration, usually identical to processQuery)
        const systemMessage = PromptEngine_1.PromptEngine.getSystemPrompt(mode, 'v1');
        const userMessage = PromptEngine_1.PromptEngine.constructPrompt('GENERAL_MENTORING', '{}', query, []);
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
            await ConversationService_1.ConversationService.addMessage(conversationId, 'assistant', this.validateResponse(fullResponse), 0);
        }
        catch (e) {
            const fallback = " Connection error occurred.";
            fullResponse += fallback;
            yield fallback;
            await ConversationService_1.ConversationService.addMessage(conversationId, 'assistant', fullResponse, 0);
        }
    }
    validateResponse(response) {
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
exports.AIPipeline = AIPipeline;
