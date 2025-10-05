import { GoogleTrendsError } from '../types/index.js';

export class RateLimitError extends Error implements GoogleTrendsError {
  code = 'RATE_LIMIT_EXCEEDED';
  statusCode = 429;
  
  constructor(message = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class InvalidRequestError extends Error implements GoogleTrendsError {
  code = 'INVALID_REQUEST';
  statusCode = 400;
  
  constructor(message = 'Invalid request parameters') {
    super(message);
    this.name = 'InvalidRequestError';
  }
}

export class NetworkError extends Error implements GoogleTrendsError {
  code = 'NETWORK_ERROR';
  
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ParseError extends Error implements GoogleTrendsError {
  code = 'PARSE_ERROR';
  
  constructor(message = 'Failed to parse response') {
    super(message);
    this.name = 'ParseError';
  }
}

export class UnknownError extends Error implements GoogleTrendsError {
  code = 'UNKNOWN_ERROR';
  
  constructor(message = 'An unknown error occurred') {
    super(message);
    this.name = 'UnknownError';
  }
} 