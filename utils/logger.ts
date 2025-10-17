// utils/logger.ts
import { LogEntry } from '../types/ticket';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;

  constructor(config: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableFile: false,
    enableRemote: false,
  }) {
    this.config = config;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private formatMessage(level: LogLevel, message: string, context?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context || {},
    };
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.enableConsole) return;

    const { timestamp, level, message, context } = entry;
    const timeStr = new Date(timestamp).toLocaleTimeString();
    
    const logMessage = `[${timeStr}] ${level.toUpperCase()}: ${message}`;
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(logMessage, context);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, context);
        break;
      case LogLevel.INFO:
        console.info(logMessage, context);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage, context);
        break;
    }
  }

  private async logToFile(entry: LogEntry): Promise<void> {
    if (!this.config.enableFile) return;

    try {
      // In a real application, you would write to a file
      // For now, we'll just simulate it
      console.log('FILE LOG:', JSON.stringify(entry, null, 2));
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private async logToRemote(entry: LogEntry): Promise<void> {
    if (!this.config.enableRemote || !this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  async log(level: LogLevel, message: string, context?: any): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry = this.formatMessage(level, message, context);

    // Log to console synchronously
    this.logToConsole(entry);

    // Log to file and remote asynchronously
    try {
      await Promise.all([
        this.logToFile(entry),
        this.logToRemote(entry),
      ]);
    } catch (error) {
      console.error('Error in logging:', error);
    }
  }

  async error(message: string, context?: any): Promise<void> {
    await this.log(LogLevel.ERROR, message, context);
  }

  async warn(message: string, context?: any): Promise<void> {
    await this.log(LogLevel.WARN, message, context);
  }

  async info(message: string, context?: any): Promise<void> {
    await this.log(LogLevel.INFO, message, context);
  }

  async debug(message: string, context?: any): Promise<void> {
    await this.log(LogLevel.DEBUG, message, context);
  }

  // Ticket-specific logging methods
  async logTicketCreation(ticketData: any, result: any): Promise<void> {
    await this.info('Ticket created successfully', {
      operation: 'createTicket',
      ticketId: result._id,
      orderNumber: result.orderNumber,
      table: result.table,
      waiter: result.waiter,
      timestamp: new Date().toISOString(),
    });
  }

  async logTicketScan(ticketId: string, success: boolean, error?: any): Promise<void> {
    if (success) {
      await this.info('Ticket scanned successfully', {
        operation: 'scanTicket',
        ticketId,
        timestamp: new Date().toISOString(),
      });
    } else {
      await this.error('Ticket scan failed', {
        operation: 'scanTicket',
        ticketId,
        error: error?.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async logValidationError(field: string, value: any, error: string): Promise<void> {
    await this.warn('Validation error', {
      operation: 'validation',
      field,
      value,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  async logNetworkError(operation: string, error: any): Promise<void> {
    await this.error('Network error', {
      operation,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
    });
  }

  async logRetryAttempt(operation: string, attempt: number, error: any): Promise<void> {
    await this.warn('Retry attempt', {
      operation,
      attempt,
      error: error?.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance logging
  async logPerformance(operation: string, duration: number, context?: any): Promise<void> {
    await this.info('Performance metric', {
      operation,
      duration,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Security logging
  async logSecurityEvent(event: string, context?: any): Promise<void> {
    await this.warn('Security event', {
      event,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Frontend-specific logger
export class FrontendLogger {
  private static instance: FrontendLogger;

  static getInstance(): FrontendLogger {
    if (!FrontendLogger.instance) {
      FrontendLogger.instance = new FrontendLogger();
    }
    return FrontendLogger.instance;
  }

  async logUserAction(action: string, context?: any): Promise<void> {
    console.log('User Action:', action, context);
    
    // In production, you might want to send this to analytics
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to analytics service
      // analytics.track(action, context);
    }
  }

  async logError(error: Error, context?: any): Promise<void> {
    console.error('Frontend Error:', error, context);
    
    // In production, you might want to send this to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTracking.captureException(error, context);
    }
  }

  async logPerformance(operation: string, duration: number): Promise<void> {
    console.log(`Performance: ${operation} took ${duration}ms`);
    
    // In production, you might want to send this to performance monitoring
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to performance monitoring
      // performanceMonitoring.record(operation, duration);
    }
  }
}

export const frontendLogger = FrontendLogger.getInstance();
