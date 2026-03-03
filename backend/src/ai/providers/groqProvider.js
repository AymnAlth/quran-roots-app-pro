const BaseProvider = require('./baseProvider');

class GroqProvider extends BaseProvider {
  constructor(options = {}) {
    super({
      name: 'groq',
      model: options.model || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    });

    this.apiKey = options.apiKey || process.env.GROQ_API_KEY;
    this.baseUrl = options.baseUrl || process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
    this.timeoutMs = Number(options.timeoutMs || process.env.GROQ_TIMEOUT_MS || 45000);
  }

  async chatCompletion({ messages, temperature = 0.35, maxTokens = 900 }) {
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorBody}`);
      }

      const payload = await response.json();
      const content = payload?.choices?.[0]?.message?.content?.trim();

      if (!content) {
        throw new Error('Groq returned an empty completion');
      }

      return {
        content,
        model: payload?.model || this.model,
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

module.exports = GroqProvider;

