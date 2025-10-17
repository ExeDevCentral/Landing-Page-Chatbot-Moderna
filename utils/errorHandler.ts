// utils/errorHandler.ts
import { AppError, ErrorType, FrontendError, RetryConfig } from '../types/ticket';

export class EnhancedErrorHandler {
  private static instance: EnhancedErrorHandler;
  private retryConfig: RetryConfig;

  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      delay: 1000,
      exponentialBackoff: true,
      retryCondition: this.isRetryableError.bind(this),
    };
  }

  static getInstance(): EnhancedErrorHandler {
    if (!EnhancedErrorHandler.instance) {
      EnhancedErrorHandler.instance = new EnhancedErrorHandler();
    }
    return EnhancedErrorHandler.instance;
  }

  // Create custom application error
  createAppError(
    message: string,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true
  ): AppError {
    const error = new Error(message) as AppError;
    error.statusCode = statusCode;
    error.isOperational = isOperational;
    error.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    error.errorType = errorType;
    Error.captureStackTrace(error, this.createAppError);
    return error;
  }

  // Handle MongoDB errors
  handleMongoError(err: any): AppError {
    if (err.name === ErrorType.CAST_ERROR) {
      return this.createAppError(
        'Formato de ID inválido',
        400,
        ErrorType.CAST_ERROR
      );
    }

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0];
      return this.createAppError(
        `${field} ya existe`,
        409,
        ErrorType.DUPLICATE_KEY_ERROR
      );
    }

    if (err.name === ErrorType.VALIDATION_ERROR) {
      const errors = Object.values(err.errors || {}).map((e: any) => e.message);
      return this.createAppError(
        `Datos inválidos: ${errors.join(', ')}`,
        400,
        ErrorType.VALIDATION_ERROR
      );
    }

    if (
      err.name === ErrorType.MONGO_NETWORK_ERROR ||
      err.name === ErrorType.MONGO_TIMEOUT_ERROR
    ) {
      return this.createAppError(
        'Error de conexión a la base de datos',
        503,
        ErrorType.SERVICE_UNAVAILABLE
      );
    }

    return this.createAppError(
      'Error de base de datos',
      500,
      ErrorType.INTERNAL_SERVER_ERROR
    );
  }

  // Handle network errors
  handleNetworkError(error: Error): FrontendError {
    if (error.name === 'AbortError') {
      return {
        type: 'timeout',
        message: 'La solicitud tardó demasiado tiempo',
        timestamp: new Date().toISOString(),
        retryable: true,
      };
    }

    if (error.message.includes('Failed to fetch')) {
      return {
        type: 'network',
        message: 'Error de conexión. Verifica tu conexión a internet',
        timestamp: new Date().toISOString(),
        retryable: true,
      };
    }

    return {
      type: 'unknown',
      message: 'Error de red desconocido',
      timestamp: new Date().toISOString(),
      retryable: true,
    };
  }

  // Handle HTTP response errors
  handleHttpError(response: Response, errorData?: any): FrontendError {
    const status = response.status;

    switch (status) {
      case 400:
        return {
          type: 'validation',
          message: 'Datos inválidos. Por favor, revisa los campos del formulario',
          details: errorData?.details,
          timestamp: new Date().toISOString(),
          retryable: false,
        };

      case 401:
        return {
          type: 'server',
          message: 'No autorizado. Por favor, inicia sesión nuevamente',
          timestamp: new Date().toISOString(),
          retryable: false,
        };

      case 403:
        return {
          type: 'server',
          message: 'Acceso prohibido',
          timestamp: new Date().toISOString(),
          retryable: false,
        };

      case 404:
        return {
          type: 'server',
          message: 'Recurso no encontrado',
          timestamp: new Date().toISOString(),
          retryable: false,
        };

      case 409:
        return {
          type: 'validation',
          message: 'Ya existe un ticket con este número de orden',
          timestamp: new Date().toISOString(),
          retryable: false,
        };

      case 429:
        return {
          type: 'server',
          message: 'Demasiadas solicitudes. Por favor, espera un momento',
          timestamp: new Date().toISOString(),
          retryable: true,
        };

      case 500:
        return {
          type: 'server',
          message: 'Error interno del servidor. Por favor, inténtalo más tarde',
          timestamp: new Date().toISOString(),
          retryable: true,
        };

      case 503:
        return {
          type: 'server',
          message: 'Servicio no disponible. Por favor, inténtalo más tarde',
          timestamp: new Date().toISOString(),
          retryable: true,
        };

      default:
        return {
          type: 'server',
          message: `Error del servidor: ${status}`,
          timestamp: new Date().toISOString(),
          retryable: status >= 500,
        };
    }
  }

  // Check if error is retryable
  isRetryableError(error: Error): boolean {
    const retryablePatterns = [
      'timeout',
      'network',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'AbortError',
    ];

    return retryablePatterns.some(pattern =>
      error.message.toLowerCase().includes(pattern.toLowerCase()) ||
      error.name.includes(pattern)
    );
  }

  // Get retry delay with exponential backoff
  getRetryDelay(attempt: number): number {
    if (!this.retryConfig.exponentialBackoff) {
      return this.retryConfig.delay;
    }

    return this.retryConfig.delay * Math.pow(2, attempt - 1);
  }

  // Retry operation with exponential backoff
  async retryOperation<T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.retryConfig.maxRetries) {
          console.error(
            `Operation failed after ${this.retryConfig.maxRetries} attempts`,
            { error: lastError, context }
          );
          throw lastError;
        }

        if (!this.retryConfig.retryCondition(lastError)) {
          throw lastError;
        }

        const delay = this.getRetryDelay(attempt);
        console.warn(
          `Attempt ${attempt} failed, retrying in ${delay}ms...`,
          { error: lastError.message, context }
        );

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Log error with context
  logError(error: Error, context: Record<string, any> = {}): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    };

    console.error('Error Log:', JSON.stringify(errorLog, null, 2));

    // In production, you might want to send this to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to external logging service
      // loggingService.log(errorLog);
    }
  }

  // Format error for user display
  formatUserError(error: FrontendError): string {
    const userFriendlyMessages: Record<string, string> = {
      network: 'Problema de conexión. Verifica tu internet.',
      validation: 'Por favor, revisa los datos ingresados.',
      server: 'Error del servidor. Inténtalo más tarde.',
      timeout: 'La operación tardó demasiado. Inténtalo de nuevo.',
      unknown: 'Ocurrió un error inesperado.',
    };

    return userFriendlyMessages[error.type] || error.message;
  }
}

// Export singleton instance
export const errorHandler = EnhancedErrorHandler.getInstance();
