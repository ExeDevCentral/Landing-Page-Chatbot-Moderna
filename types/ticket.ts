// types/ticket.ts
export interface TicketData {
  menu: string;
  table: string;
  waiter: string;
}

export interface Ticket extends TicketData {
  _id: string;
  orderNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data: Ticket;
}

export interface TicketListResponse {
  success: boolean;
  data: Ticket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface TicketError {
  error: string;
  message: string;
  details?: string[];
  timestamp: string;
  stack?: string;
}

// Error types
export enum ErrorType {
  VALIDATION_ERROR = 'ValidationError',
  CAST_ERROR = 'CastError',
  DUPLICATE_KEY_ERROR = 'DuplicateKeyError',
  MONGO_NETWORK_ERROR = 'MongoNetworkError',
  MONGO_TIMEOUT_ERROR = 'MongoTimeoutError',
  INTERNAL_SERVER_ERROR = 'InternalServerError',
  NOT_FOUND = 'NotFound',
  UNAUTHORIZED = 'Unauthorized',
  FORBIDDEN = 'Forbidden',
  BAD_REQUEST = 'BadRequest',
  CONFLICT = 'Conflict',
  TOO_MANY_REQUESTS = 'TooManyRequests',
  SERVICE_UNAVAILABLE = 'ServiceUnavailable',
}

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  status: 'fail' | 'error';
  errorType: ErrorType;
}

// Validation types
export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Retry configuration
export interface RetryConfig {
  maxRetries: number;
  delay: number;
  exponentialBackoff: boolean;
  retryCondition: (error: Error) => boolean;
}

// Logging types
export interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: Record<string, any>;
  stack?: string;
}

// Frontend error handling
export interface FrontendError {
  type: 'network' | 'validation' | 'server' | 'timeout' | 'unknown';
  message: string;
  details?: any;
  timestamp: string;
  retryable: boolean;
}

export interface ErrorHandler {
  handle(error: Error, context?: any): FrontendError;
  isRetryable(error: Error): boolean;
  getRetryDelay(attempt: number): number;
}
