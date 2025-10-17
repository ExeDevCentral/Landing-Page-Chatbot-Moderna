// services/ticketService.ts
import { TicketData, Ticket, TicketResponse, TicketListResponse, ApiResponse } from '../types/ticket';
import { errorHandler } from '../utils/errorHandler';
import { TicketValidator } from '../utils/validation';

export class TicketService {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = '/api/tickets', timeout: number = 30000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  // Create a new ticket with comprehensive error handling
  async createTicket(ticketData: TicketData): Promise<TicketResponse> {
    try {
      // Validate data before sending
      const validation = TicketValidator.validateTicketData(ticketData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = TicketValidator.sanitizeTicketData(ticketData);

      // Create request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const frontendError = errorHandler.handleHttpError(response, errorData);
          throw new Error(frontendError.message);
        }

        const result: TicketResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Respuesta inválida del servidor');
        }

        return result;

      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

    } catch (error) {
      errorHandler.logError(error as Error, { 
        operation: 'createTicket', 
        ticketData 
      });
      throw error;
    }
  }

  // Get ticket by ID with error handling
  async getTicketById(id: string): Promise<Ticket> {
    try {
      // Validate ID format
      if (!TicketValidator.validateTicketId(id)) {
        throw new Error('ID de ticket inválido');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const frontendError = errorHandler.handleHttpError(response, errorData);
          throw new Error(frontendError.message);
        }

        const result: ApiResponse<Ticket> = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Ticket no encontrado');
        }

        return result.data;

      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

    } catch (error) {
      errorHandler.logError(error as Error, { 
        operation: 'getTicketById', 
        ticketId: id 
      });
      throw error;
    }
  }

  // Get all tickets with pagination and filters
  async getAllTickets(params: {
    page?: number;
    limit?: number;
    sort?: string;
    table?: string;
    waiter?: string;
  } = {}): Promise<TicketListResponse> {
    try {
      // Validate pagination parameters
      const paginationValidation = TicketValidator.validatePaginationParams(
        params.page || 1, 
        params.limit || 10
      );

      if (!paginationValidation.isValid) {
        throw new Error(paginationValidation.error);
      }

      // Build query string
      const queryParams = new URLSearchParams();
      queryParams.append('page', paginationValidation.pageNum.toString());
      queryParams.append('limit', paginationValidation.limitNum.toString());
      
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.table) queryParams.append('table', params.table);
      if (params.waiter) queryParams.append('waiter', params.waiter);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const frontendError = errorHandler.handleHttpError(response, errorData);
          throw new Error(frontendError.message);
        }

        const result: TicketListResponse = await response.json();
        
        if (!result.success) {
          throw new Error('Error al obtener los tickets');
        }

        return result;

      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

    } catch (error) {
      errorHandler.logError(error as Error, { 
        operation: 'getAllTickets', 
        params 
      });
      throw error;
    }
  }

  // Update ticket with error handling
  async updateTicket(id: string, updateData: Partial<TicketData>): Promise<TicketResponse> {
    try {
      // Validate ID format
      if (!TicketValidator.validateTicketId(id)) {
        throw new Error('ID de ticket inválido');
      }

      // Validate update data
      const validation = TicketValidator.validateTicketData(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Sanitize data
      const sanitizedData = TicketValidator.sanitizeTicketData(updateData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sanitizedData),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const frontendError = errorHandler.handleHttpError(response, errorData);
          throw new Error(frontendError.message);
        }

        const result: TicketResponse = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error('Error al actualizar el ticket');
        }

        return result;

      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

    } catch (error) {
      errorHandler.logError(error as Error, { 
        operation: 'updateTicket', 
        ticketId: id, 
        updateData 
      });
      throw error;
    }
  }

  // Delete ticket with error handling
  async deleteTicket(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate ID format
      if (!TicketValidator.validateTicketId(id)) {
        throw new Error('ID de ticket inválido');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(`${this.baseUrl}/${id}`, {
          method: 'DELETE',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const frontendError = errorHandler.handleHttpError(response, errorData);
          throw new Error(frontendError.message);
        }

        const result: ApiResponse = await response.json();
        
        if (!result.success) {
          throw new Error('Error al eliminar el ticket');
        }

        return {
          success: true,
          message: result.message || 'Ticket eliminado exitosamente',
        };

      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }

    } catch (error) {
      errorHandler.logError(error as Error, { 
        operation: 'deleteTicket', 
        ticketId: id 
      });
      throw error;
    }
  }

  // Retry operation with exponential backoff
  async createTicketWithRetry(ticketData: TicketData): Promise<TicketResponse> {
    return errorHandler.retryOperation(
      () => this.createTicket(ticketData),
      'createTicketWithRetry'
    );
  }

  // Get ticket with retry
  async getTicketByIdWithRetry(id: string): Promise<Ticket> {
    return errorHandler.retryOperation(
      () => this.getTicketById(id),
      'getTicketByIdWithRetry'
    );
  }

  // Check if service is available
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check

      try {
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;

      } catch (error) {
        clearTimeout(timeoutId);
        return false;
      }

    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const ticketService = new TicketService();
