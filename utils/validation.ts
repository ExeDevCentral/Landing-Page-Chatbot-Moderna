// utils/validation.ts
import { ValidationRule, ValidationResult, ValidationError } from '../types/ticket';

export class TicketValidator {
  private static readonly VALIDATION_RULES: ValidationRule[] = [
    {
      field: 'menu',
      required: true,
      minLength: 3,
      maxLength: 200,
      custom: (value: string) => {
        if (value.trim().length === 0) {
          return 'El menú no puede estar vacío';
        }
        if (!/^[a-zA-Z0-9\s\-_.,áéíóúñüÁÉÍÓÚÑÜ]+$/.test(value)) {
          return 'El menú contiene caracteres no válidos';
        }
        return true;
      },
    },
    {
      field: 'table',
      required: true,
      minLength: 1,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\-_\s]+$/,
      custom: (value: string) => {
        if (value.trim().length === 0) {
          return 'La mesa no puede estar vacía';
        }
        return true;
      },
    },
    {
      field: 'waiter',
      required: true,
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\sáéíóúñüÁÉÍÓÚÑÜ]+$/,
      custom: (value: string) => {
        if (value.trim().length === 0) {
          return 'El nombre del mesero no puede estar vacío';
        }
        if (value.trim().split(' ').length < 2) {
          return 'El nombre del mesero debe incluir nombre y apellido';
        }
        return true;
      },
    },
  ];

  static validateTicketData(data: Record<string, any>): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of this.VALIDATION_RULES) {
      const value = data[rule.field];
      const error = this.validateField(value, rule);

      if (error) {
        errors.push({
          field: rule.field,
          message: error,
          value,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private static validateField(value: any, rule: ValidationRule): string | null {
    // Required field validation
    if (rule.required && (!value || value.toString().trim().length === 0)) {
      return `${this.getFieldLabel(rule.field)} es requerido`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim().length === 0) {
      return null;
    }

    const stringValue = value.toString().trim();

    // Min length validation
    if (rule.minLength && stringValue.length < rule.minLength) {
      return `${this.getFieldLabel(rule.field)} debe tener al menos ${rule.minLength} caracteres`;
    }

    // Max length validation
    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return `${this.getFieldLabel(rule.field)} no puede tener más de ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return `${this.getFieldLabel(rule.field)} contiene caracteres no válidos`;
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(stringValue);
      if (customResult !== true) {
        return typeof customResult === 'string' ? customResult : `${this.getFieldLabel(rule.field)} no es válido`;
      }
    }

    return null;
  }

  private static getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      menu: 'Menú',
      table: 'Mesa',
      waiter: 'Mesero',
    };
    return labels[fieldName] || fieldName;
  }

  static sanitizeTicketData(data: Record<string, any>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const rule of this.VALIDATION_RULES) {
      const value = data[rule.field];
      if (value !== undefined && value !== null) {
        // Basic sanitization
        sanitized[rule.field] = value.toString().trim();
        
        // Additional sanitization based on field type
        switch (rule.field) {
          case 'menu':
            // Remove extra spaces and normalize
            sanitized[rule.field] = sanitized[rule.field].replace(/\s+/g, ' ');
            break;
          case 'table':
            // Convert to uppercase for consistency
            sanitized[rule.field] = sanitized[rule.field].toUpperCase();
            break;
          case 'waiter':
            // Capitalize first letter of each word
            sanitized[rule.field] = sanitized[rule.field]
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
            break;
        }
      }
    }

    return sanitized;
  }

  static validateTicketId(id: string): boolean {
    // MongoDB ObjectId validation
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  static validatePaginationParams(page: any, limit: any): { isValid: boolean; pageNum: number; limitNum: number; error?: string } {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1) {
      return { isValid: false, pageNum: 0, limitNum: 0, error: 'Página debe ser un número mayor a 0' };
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return { isValid: false, pageNum: 0, limitNum: 0, error: 'Límite debe ser un número entre 1 y 100' };
    }

    return { isValid: true, pageNum, limitNum };
  }
}

// Frontend validation utilities
export class FrontendValidator {
  static validateForm(form: HTMLFormElement): ValidationResult {
    const formData = new FormData(form);
    const data: Record<string, any> = {};

    // Extract form data
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return TicketValidator.validateTicketData(data);
  }

  static validateField(field: HTMLInputElement): ValidationResult {
    const fieldName = field.name;
    const value = field.value;

    // Find the rule for this field
    const rule = TicketValidator['VALIDATION_RULES'].find(r => r.field === fieldName);
    if (!rule) {
      return { isValid: true, errors: [] };
    }

    const error = TicketValidator['validateField'](value, rule);
    
    if (error) {
      return {
        isValid: false,
        errors: [{
          field: fieldName,
          message: error,
          value,
        }],
      };
    }

    return { isValid: true, errors: [] };
  }

  static showFieldError(field: HTMLInputElement, message: string): void {
    // Remove existing error
    this.clearFieldError(field);

    // Add error class
    field.classList.add('error');
    field.classList.remove('success');

    // Create error message element
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message show';
    errorElement.textContent = message;

    // Insert after the field
    field.parentNode?.insertBefore(errorElement, field.nextSibling);
  }

  static clearFieldError(field: HTMLInputElement): void {
    // Remove error class
    field.classList.remove('error');

    // Remove error message
    const errorElement = field.parentNode?.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  static showFieldSuccess(field: HTMLInputElement): void {
    field.classList.remove('error');
    field.classList.add('success');
    this.clearFieldError(field);
  }

  static showFormErrors(errors: ValidationError[]): void {
    errors.forEach(error => {
      const field = document.querySelector(`[name="${error.field}"]`) as HTMLInputElement;
      if (field) {
        this.showFieldError(field, error.message);
      }
    });
  }

  static clearAllErrors(form: HTMLFormElement): void {
    const fields = form.querySelectorAll('input');
    fields.forEach(field => {
      this.clearFieldError(field);
      field.classList.remove('error', 'success');
    });
  }
}
