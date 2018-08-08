class InvalidInputError extends Error {
  constructor(message) {
    super(message || 'Input is not valid');

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = InvalidInputError;
