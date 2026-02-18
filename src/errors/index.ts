export class VersionCheckerError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(message: string, code: string, cause?: unknown) {
    super(message);
    this.name = 'VersionCheckerError';
    this.code = code;
    this.cause = cause;
  }
}

export class ProviderError extends VersionCheckerError {
  constructor(message: string, cause?: unknown) {
    super(message, 'PROVIDER_ERROR', cause);
    this.name = 'ProviderError';
  }
}

export class ParseError extends VersionCheckerError {
  constructor(message: string, cause?: unknown) {
    super(message, 'PARSE_ERROR', cause);
    this.name = 'ParseError';
  }
}

export class ValidationError extends VersionCheckerError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends VersionCheckerError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}
