const GroqProvider = require('./providers/groqProvider');

function resolveProvider(providerName = 'groq') {
  const normalized = String(providerName || 'groq').toLowerCase().trim();

  switch (normalized) {
    case 'groq':
      return new GroqProvider();
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}

module.exports = {
  resolveProvider,
};

