// src/components/TicketForm.tsx
import React, { useState, useCallback, useRef } from 'react';
import { TicketData } from '../../types/ticket';
import { ticketService } from '../../services/ticketService';
import { FrontendValidator } from '../../utils/validation';
import { errorHandler } from '../../utils/errorHandler';

interface TicketFormProps {
  onSuccess?: (ticket: any) => void;
  onError?: (error: string) => void;
}

interface FormState {
  menu: string;
  table: string;
  waiter: string;
}

interface FormErrors {
  menu?: string;
  table?: string;
  waiter?: string;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState<FormState>({
    menu: '',
    table: '',
    waiter: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Validate single field
  const validateField = useCallback(async (field: keyof FormState) => {
    if (!formRef.current) return;

    const input = formRef.current.querySelector(`[name="${field}"]`) as HTMLInputElement;
    if (!input) return;

    setIsValidating(true);
    
    try {
      const validation = FrontendValidator.validateField(input);
      
      if (!validation.isValid) {
        const error = validation.errors[0];
        setErrors(prev => ({ ...prev, [field]: error.message }));
        FrontendValidator.showFieldError(input, error.message);
      } else {
        setErrors(prev => ({ ...prev, [field]: undefined }));
        FrontendValidator.showFieldSuccess(input);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    if (!formRef.current) return false;

    const validation = FrontendValidator.validateForm(formRef.current);
    
    if (!validation.isValid) {
      const newErrors: FormErrors = {};
      validation.errors.forEach(error => {
        newErrors[error.field as keyof FormErrors] = error.message;
      });
      setErrors(newErrors);
      FrontendValidator.showFormErrors(validation.errors);
      return false;
    }

    setErrors({});
    return true;
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Create ticket data
      const ticketData: TicketData = {
        menu: formData.menu.trim(),
        table: formData.table.trim(),
        waiter: formData.waiter.trim(),
      };

      // Submit with retry logic
      const result = await ticketService.createTicketWithRetry(ticketData);
      
      // Success
      onSuccess?.(result.data);
      
      // Reset form
      setFormData({ menu: '', table: '', waiter: '' });
      setErrors({});
      if (formRef.current) {
        FrontendValidator.clearAllErrors(formRef.current);
      }

    } catch (error) {
      const frontendError = errorHandler.handleNetworkError(error as Error);
      const userMessage = errorHandler.formatUserError(frontendError);
      
      onError?.(userMessage);
      console.error('Ticket creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, isSubmitting, validateForm, onSuccess, onError]);

  // Handle field blur (validate on blur)
  const handleFieldBlur = useCallback((field: keyof FormState) => {
    validateField(field);
  }, [validateField]);

  return (
    <div className="ticket-form-container">
      <form ref={formRef} onSubmit={handleSubmit} className="ticket-form">
        <h2>Crear Nuevo Ticket</h2>
        
        <div className="form-group">
          <label htmlFor="menu">Menú *</label>
          <input
            type="text"
            id="menu"
            name="menu"
            value={formData.menu}
            onChange={(e) => handleInputChange('menu', e.target.value)}
            onBlur={() => handleFieldBlur('menu')}
            placeholder="Descripción del menú..."
            disabled={isSubmitting}
            className={errors.menu ? 'error' : ''}
          />
          {errors.menu && <div className="error-message">{errors.menu}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="table">Mesa *</label>
          <input
            type="text"
            id="table"
            name="table"
            value={formData.table}
            onChange={(e) => handleInputChange('table', e.target.value)}
            onBlur={() => handleFieldBlur('table')}
            placeholder="Número o identificador de mesa..."
            disabled={isSubmitting}
            className={errors.table ? 'error' : ''}
          />
          {errors.table && <div className="error-message">{errors.table}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="waiter">Mesero *</label>
          <input
            type="text"
            id="waiter"
            name="waiter"
            value={formData.waiter}
            onChange={(e) => handleInputChange('waiter', e.target.value)}
            onBlur={() => handleFieldBlur('waiter')}
            placeholder="Nombre completo del mesero..."
            disabled={isSubmitting}
            className={errors.waiter ? 'error' : ''}
          />
          {errors.waiter && <div className="error-message">{errors.waiter}</div>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isValidating}
          className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
        >
          {isSubmitting ? 'Creando Ticket...' : 'Crear Ticket'}
        </button>
      </form>

      <style>{`
        .ticket-form-container {
          max-width: 500px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .ticket-form h2 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-group input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input.error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .form-group input.success {
          border-color: #10b981;
          background-color: #f0fdf4;
        }

        .form-group input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        .submit-btn {
          width: 100%;
          background-color: #3b82f6;
          color: white;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }

        .submit-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .submit-btn.loading::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          margin: -10px 0 0 -10px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 640px) {
          .ticket-form-container {
            margin: 1rem;
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TicketForm;
