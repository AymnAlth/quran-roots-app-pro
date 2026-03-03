class BaseProvider {
  constructor({ name, model }) {
    this.name = name;
    this.model = model;
  }

  // eslint-disable-next-line no-unused-vars
  async chatCompletion(_payload) {
    throw new Error('chatCompletion() must be implemented by provider');
  }
}

module.exports = BaseProvider;

