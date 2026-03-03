const { resolveProvider } = require('./providerFactory');
const { buildOperationalInsightPrompt } = require('./prompts/operationalInsightPrompt');

class AIService {
  async analyzeAyahOperationalContext(payload) {
    const providerName = process.env.AI_PROVIDER || 'groq';
    const provider = resolveProvider(providerName);
    const messages = buildOperationalInsightPrompt(payload);

    const completion = await provider.chatCompletion({
      messages,
      temperature: 0.3,
      maxTokens: 1100,
    });

    return {
      provider: provider.name,
      model: completion.model || provider.model,
      content: completion.content,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AIService();

