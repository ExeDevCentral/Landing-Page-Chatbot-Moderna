'use strict';

// Waiter functionality with comprehensive error handling
class WaiterApp {
    constructor() {
        this.form = document.getElementById('ticket-form');
        this.isSubmitting = false;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.init();
    }

    init() {
        try {
            this.bindEvents();
            this.validateForm();
            this.setupFormValidation();
        } catch (error) {
            console.error('Failed to initialize waiter app:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    }

    bindEvents() {
        try {
            if (this.form) {
                this.form.addEventListener('submit', (e) => this.handleSubmit(e));
                
                // Real-time validation
                const inputs = this.form.querySelectorAll('input[required]');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => this.validateField(input));
                    input.addEventListener('input', () => this.clearFieldError(input));
                });
            }
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    setupFormValidation() {
        try {
            // Add custom validation styles
            const style = document.createElement('style');
            style.textContent = `
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: bold;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #ddd;
                    border-radius: 4px;
                    font-size: 1rem;
                    transition: border-color 0.3s ease;
                }
                
                .form-group input:focus {
                    outline: none;
                    border-color: #3B82F6;
                }
                
                .form-group input.error {
                    border-color: #e74c3c;
                    background-color: #fdf2f2;
                }
                
                .form-group input.success {
                    border-color: #27ae60;
                    background-color: #f0f9f0;
                }
                
                .error-message {
                    color: #e74c3c;
                    font-size: 0.875rem;
                    margin-top: 0.25rem;
                    display: none;
                }
                
                .error-message.show {
                    display: block;
                }
                
                .btn {
                    background-color: #3B82F6;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 4px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                
                .btn:hover:not(:disabled) {
                    background-color: #2563eb;
                }
                
                .btn:disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
                
                .loading {
                    position: relative;
                }
                
                .loading::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 20px;
                    height: 20px;
                    margin: -10px 0 0 -10px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #3B82F6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .success-message {
                    background-color: #d1fae5;
                    color: #065f46;
                    padding: 1rem;
                    border-radius: 4px;
                    margin-top: 1rem;
                    display: none;
                }
                
                .success-message.show {
                    display: block;
                }
            `;
            document.head.appendChild(style);
        } catch (error) {
            console.error('Error setting up form validation:', error);
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        try {
            this.isSubmitting = true;
            this.setSubmitState(true);

            // Validate form
            if (!this.validateForm()) {
                this.setSubmitState(false);
                this.isSubmitting = false;
                return;
            }

            const formData = this.getFormData();
            
            // Show loading state
            this.showLoading();

            // Submit with retry logic
            const ticket = await this.submitWithRetry(formData);
            
            // Show success
            this.showSuccess(ticket);
            
            // Reset form
            this.resetForm();
            
        } catch (error) {
            console.error('Submit error:', error);
            this.handleSubmitError(error);
        } finally {
            this.setSubmitState(false);
            this.isSubmitting = false;
        }
    }

    getFormData() {
        try {
            const formData = new FormData(this.form);
            return {
                menu: formData.get('menu')?.trim(),
                table: formData.get('table')?.trim(),
                waiter: formData.get('waiter')?.trim()
            };
        } catch (error) {
            console.error('Error getting form data:', error);
            throw new Error('Error al obtener los datos del formulario');
        }
    }

    async submitWithRetry(formData, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const ticket = await response.json();
            
            if (!ticket.data) {
                throw new Error('Respuesta inválida del servidor');
            }

            return ticket;

        } catch (error) {
            if (attempt < this.maxRetries && this.isRetryableError(error)) {
                console.warn(`Retry attempt ${attempt} for ticket submission:`, error.message);
                await this.delay(this.retryDelay * attempt);
                return this.submitWithRetry(formData, attempt + 1);
            }
            throw error;
        }
    }

    isRetryableError(error) {
        return error.name === 'AbortError' || 
               error.message.includes('timeout') ||
               error.message.includes('network') ||
               error.message.includes('ECONNREFUSED') ||
               error.message.includes('ENOTFOUND');
    }

    handleSubmitError(error) {
        let errorMessage = 'Error al crear el ticket. Por favor, inténtalo de nuevo.';
        
        if (error.name === 'AbortError') {
            errorMessage = 'La solicitud tardó demasiado. Por favor, inténtalo de nuevo.';
        } else if (error.message.includes('timeout')) {
            errorMessage = 'Tiempo de espera agotado. Por favor, inténtalo de nuevo.';
        } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else if (error.message.includes('400')) {
            errorMessage = 'Datos inválidos. Por favor, revisa los campos del formulario.';
        } else if (error.message.includes('409')) {
            errorMessage = 'Ya existe un ticket con este número de orden.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Error interno del servidor. Por favor, inténtalo más tarde.';
        }

        this.showError(errorMessage);
    }

    validateForm() {
        try {
            let isValid = true;
            const inputs = this.form.querySelectorAll('input[required]');
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            return isValid;
        } catch (error) {
            console.error('Error validating form:', error);
            return false;
        }
    }

    validateField(field) {
        try {
            const value = field.value?.trim();
            const fieldName = field.name;
            let isValid = true;
            let errorMessage = '';

            // Clear previous errors
            this.clearFieldError(field);

            // Required field validation
            if (!value) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(fieldName)} es requerido`;
            } else {
                // Specific validations
                switch (fieldName) {
                    case 'menu':
                        if (value.length < 3) {
                            isValid = false;
                            errorMessage = 'El menú debe tener al menos 3 caracteres';
                        } else if (value.length > 200) {
                            isValid = false;
                            errorMessage = 'El menú no puede tener más de 200 caracteres';
                        }
                        break;
                    case 'table':
                        if (value.length < 1) {
                            isValid = false;
                            errorMessage = 'La mesa es requerida';
                        } else if (value.length > 50) {
                            isValid = false;
                            errorMessage = 'El identificador de mesa no puede tener más de 50 caracteres';
                        }
                        break;
                    case 'waiter':
                        if (value.length < 2) {
                            isValid = false;
                            errorMessage = 'El nombre del mesero debe tener al menos 2 caracteres';
                        } else if (value.length > 100) {
                            isValid = false;
                            errorMessage = 'El nombre del mesero no puede tener más de 100 caracteres';
                        }
                        break;
                }
            }

            // Update field appearance
            if (isValid) {
                field.classList.remove('error');
                field.classList.add('success');
            } else {
                field.classList.remove('success');
                field.classList.add('error');
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        } catch (error) {
            console.error('Error validating field:', error);
            return false;
        }
    }

    getFieldLabel(fieldName) {
        const labels = {
            'menu': 'Menú',
            'table': 'Mesa',
            'waiter': 'Mesero'
        };
        return labels[fieldName] || fieldName;
    }

    showFieldError(field, message) {
        try {
            let errorElement = field.parentNode.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = message;
            errorElement.classList.add('show');
        } catch (error) {
            console.error('Error showing field error:', error);
        }
    }

    clearFieldError(field) {
        try {
            const errorElement = field.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.classList.remove('show');
            }
            field.classList.remove('error');
        } catch (error) {
            console.error('Error clearing field error:', error);
        }
    }

    setSubmitState(submitting) {
        try {
            const submitBtn = this.form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = submitting;
                submitBtn.textContent = submitting ? 'Generando Ticket...' : 'Generate Ticket';
            }
        } catch (error) {
            console.error('Error setting submit state:', error);
        }
    }

    showLoading() {
        try {
            this.form.classList.add('loading');
        } catch (error) {
            console.error('Error showing loading:', error);
        }
    }

    hideLoading() {
        try {
            this.form.classList.remove('loading');
        } catch (error) {
            console.error('Error hiding loading:', error);
        }
    }

    showSuccess(ticket) {
        try {
            this.hideLoading();
            
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message show';
            successMessage.innerHTML = `
                <strong>¡Ticket creado exitosamente!</strong><br>
                Número de orden: ${ticket.data.orderNumber}<br>
                Mesa: ${ticket.data.table}<br>
                Mesero: ${ticket.data.waiter}
            `;
            
            this.form.parentNode.appendChild(successMessage);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                try {
                    successMessage.remove();
                } catch (error) {
                    console.error('Error removing success message:', error);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Error showing success:', error);
        }
    }

    showError(message) {
        try {
            this.hideLoading();
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message show';
            errorMessage.style.cssText = `
                background-color: #fef2f2;
                color: #dc2626;
                padding: 1rem;
                border-radius: 4px;
                margin-top: 1rem;
                border: 1px solid #fecaca;
            `;
            errorMessage.textContent = message;
            
            this.form.parentNode.appendChild(errorMessage);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                try {
                    errorMessage.remove();
                } catch (error) {
                    console.error('Error removing error message:', error);
                }
            }, 5000);
            
        } catch (error) {
            console.error('Error showing error:', error);
        }
    }

    resetForm() {
        try {
            this.form.reset();
            
            // Clear all field states
            const inputs = this.form.querySelectorAll('input');
            inputs.forEach(input => {
                input.classList.remove('error', 'success');
            });
            
            // Clear error messages
            const errorMessages = this.form.parentNode.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
            
        } catch (error) {
            console.error('Error resetting form:', error);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize waiter app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.waiterApp = new WaiterApp();
    } catch (error) {
        console.error('Failed to initialize waiter app:', error);
    }
});
