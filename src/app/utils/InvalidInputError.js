class InvalidInputError extends Error {
  constructor(message) {
    super(message || "Input is not valid");

    Error.captureStackTrace(this, this.constructor);

    this.isUserInputError = true;
  }
}

module.exports = InvalidInputError;
