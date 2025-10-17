'use strict';

// Chatbot functionality with comprehensive error handling
class Chatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.messages = [];
        this.apiEndpoint = '/api/chat';
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.connectionStatus = 'connected';
        this.init();
    }

    init() {
        try {
            this.bindEvents();
            this.loadWelcomeMessage();
            this.checkConnectionStatus();
        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            this.showErrorMessage('Error al inicializar el chatbot');
        }
    }

    addSafeEventListener(selector, event, handler) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    bindEvents() {
        try {
            this.addSafeEventListener('#chatbot-toggle', 'click', () => this.toggle());
            this.addSafeEventListener('#chatbot-input', 'keypress', (e) => {
                const isEnter = e.key === 'Enter';
                const isShift = e.shiftKey;
                if (isEnter && !isShift) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            this.addSafeEventListener('#chatbot-input', 'input', (e) => {
                const sendBtn = document.querySelector('#send-btn');
                const hasText = e.target.value.trim().length > 0;
                if (sendBtn) {
                    sendBtn.disabled = !hasText;
                }
            });
            this.addSafeEventListener('#send-btn', 'click', () => this.sendMessage());
            this.addSafeEventListener('#minimize-btn', 'click', () => this.minimize());
            this.addSafeEventListener('#close-btn', 'click', () => this.close());

            window.addEventListener('resize', this.debounce(() => this.adjustChatbotPosition(), 250));
            document.addEventListener('visibilitychange', () => {
                const isHidden = document.hidden;
                if (isHidden) {
                    this.pauseTypingIndicator();
                } else {
                    this.resumeTypingIndicator();
                }
            });
        } catch (error) {
            console.error('Error binding events:', error);
        }
    }

    loadWelcomeMessage() {
        try {
            const welcomeMessages = [
                '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?',
                '¡Bienvenido! Estoy aquí para ayudarte con cualquier consulta.',
                '¡Hola! ¿Cómo puedo asistirte hoy?'
            ];
            
            const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
            this.addMessage('bot', randomMessage);
        } catch (error) {
            console.error('Error loading welcome message:', error);
            this.addMessage('bot', '¡Hola! ¿En qué puedo ayudarte?');
        }
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                timeout: 5000
            });
            
            if (response.ok) {
                this.connectionStatus = 'connected';
                this.updateConnectionIndicator('connected');
            } else {
                throw new Error('Health check failed');
            }
        } catch (error) {
            console.warn('Connection check failed:', error);
            this.connectionStatus = 'disconnected';
            this.updateConnectionIndicator('disconnected');
        }
    }

    updateConnectionIndicator(status) {
        const indicator = document.querySelector('.connection-indicator');
        if (indicator) {
            indicator.className = `connection-indicator ${status}`;
            indicator.title = status === 'connected' ? 'Conectado' : 'Desconectado';
        }
    }

    toggle() {
        try {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        } catch (error) {
            console.error('Error toggling chatbot:', error);
        }
    }

    open() {
        try {
            const widget = document.getElementById('chatbot-widget');
            const toggle = document.getElementById('chatbot-toggle');
            
            if (widget && toggle) {
                widget.classList.add('active');
                toggle.style.display = 'none';
                this.isOpen = true;
                this.isMinimized = false;
                
                // Focus on input after animation
                setTimeout(() => {
                    const input = document.getElementById('chatbot-input');
                    if (input) {
                        input.focus();
                        input.placeholder = 'Escribe tu mensaje aquí...';
                    }
                }, 300);

                // Adjust position for mobile
                this.adjustChatbotPosition();
            }
        } catch (error) {
            console.error('Error opening chatbot:', error);
        }
    }

    close() {
        try {
            const widget = document.getElementById('chatbot-widget');
            const toggle = document.getElementById('chatbot-toggle');
            
            if (widget && toggle) {
                widget.classList.remove('active');
                toggle.style.display = 'flex';
                this.isOpen = false;
                this.isMinimized = false;
            }
        } catch (error) {
            console.error('Error closing chatbot:', error);
        }
    }

    minimize() {
        try {
            const widget = document.getElementById('chatbot-widget');
            const toggle = document.getElementById('chatbot-toggle');
            
            if (widget && toggle) {
                widget.classList.remove('active');
                toggle.style.display = 'flex';
                this.isOpen = false;
                this.isMinimized = true;
            }
        } catch (error) {
            console.error('Error minimizing chatbot:', error);
        }
    }

    adjustChatbotPosition() {
        try {
            const widget = document.getElementById('chatbot-widget');
            if (widget && window.innerWidth < 768) {
                // Mobile adjustments
                widget.style.bottom = '20px';
                widget.style.right = '20px';
                widget.style.left = '20px';
                widget.style.width = 'auto';
            } else if (widget) {
                // Desktop adjustments
                widget.style.bottom = '20px';
                widget.style.right = '20px';
                widget.style.left = 'auto';
                widget.style.width = '350px';
            }
        } catch (error) {
            console.error('Error adjusting chatbot position:', error);
        }
    }

    validateMessage(message) {
        const isEmpty = !message || message.length === 0;
        if (isEmpty) {
            this.showErrorMessage('Por favor, escribe un mensaje');
            return false;
        }

        const isTooLong = message.length > 1000;
        if (isTooLong) {
            this.showErrorMessage('El mensaje es demasiado largo (máximo 1000 caracteres)');
            return false;
        }

        return true;
    }

    async sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input?.value?.trim();

        const isValid = this.validateMessage(message);
        if (!isValid) return;

        if (message.toLowerCase() === 'mostrar datos') {
            this.fetchAndDisplayData();
            input.value = '';
            return;
        }

        try {
            this.addMessage('user', message);
            input.value = '';
            this.setInputState(false);
            this.showTypingIndicator();

            const response = await this.sendWithRetry(message);
            
            this.hideTypingIndicator();
            this.addMessage('bot', response);
        } catch (error) {
            console.error('Error sending message:', error);
            this.hideTypingIndicator();
            this.handleSendError(error);
        } finally {
            this.setInputState(true);
        }
    }

    async sendWithRetry(message, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.response) {
                throw new Error('Respuesta vacía del servidor');
            }

            return data.response;

        } catch (error) {
            if (attempt < this.maxRetries && this.isRetryableError(error)) {
                console.warn(`Retry attempt ${attempt} for message:`, error.message);
                await this.delay(this.retryDelay * attempt);
                return this.sendWithRetry(message, attempt + 1);
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

    handleSendError(error) {
        const errorMessages = {
            'AbortError': 'La solicitud tardó demasiado. Por favor, inténtalo de nuevo.',
            'timeout': 'Tiempo de espera agotado. Por favor, inténtalo de nuevo.',
            'network': 'Error de conexión. Verificando conectividad...',
            'ECONNREFUSED': 'Error de conexión. Verificando conectividad...',
            '429': 'Has enviado demasiados mensajes. Por favor, espera un momento.',
            '401': 'Error de autenticación. Por favor, recarga la página.',
            '500': 'Error interno del servidor. Por favor, inténtalo más tarde.'
        };

        let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
        
        for (const key in errorMessages) {
            if (error.name === key || error.message.includes(key)) {
                errorMessage = errorMessages[key];
                if (key === 'network' || key === 'ECONNREFUSED') {
                    this.checkConnectionStatus();
                }
                break;
            }
        }

        this.addMessage('bot', errorMessage);
    }

    setInputState(enabled) {
        const input = document.getElementById('chatbot-input');
        const sendBtn = document.querySelector('.send-btn');
        
        if (input) {
            input.disabled = !enabled;
            input.placeholder = enabled ? 'Escribe tu mensaje aquí...' : 'Enviando...';
        }
        
        if (sendBtn) {
            sendBtn.disabled = !enabled || (input?.value?.trim().length === 0);
        }
    }

    addMessage(type, content) {
        try {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}-message`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.textContent = content;

            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = this.getCurrentTime();

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timeDiv);
            messagesContainer.appendChild(messageDiv);

            // Scroll to bottom with smooth behavior
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });

            // Store message
            this.messages.push({ 
                type, 
                content, 
                timestamp: new Date(),
                id: Date.now() + Math.random()
            });

            // Limit message history to prevent memory issues
            if (this.messages.length > 100) {
                this.messages = this.messages.slice(-50);
            }

        } catch (error) {
            console.error('Error adding message:', error);
        }
    }

    showTypingIndicator() {
        try {
            const messagesContainer = document.getElementById('chatbot-messages');
            if (!messagesContainer) return;

            const typingDiv = document.createElement('div');
            typingDiv.className = 'message bot-message typing-indicator';
            typingDiv.id = 'typing-indicator';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = '<span class="typing-dots">Escribiendo</span>';

            typingDiv.appendChild(contentDiv);
            messagesContainer.appendChild(typingDiv);
            
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });

        } catch (error) {
            console.error('Error showing typing indicator:', error);
        }
    }

    hideTypingIndicator() {
        try {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        } catch (error) {
            console.error('Error hiding typing indicator:', error);
        }
    }

    pauseTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.animationPlayState = 'paused';
        }
    }

    resumeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.animationPlayState = 'running';
        }
    }

    showErrorMessage(message) {
        try {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff4444;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        } catch (error) {
            console.error('Error showing error message:', error);
        }
    }

    getCurrentTime() {
        try {
            const now = new Date();
            return now.toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch (error) {
            console.error('Error getting current time:', error);
            return '--:--';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    async fetchAndDisplayData() {
        this.addMessage('bot', 'Recuperando y procesando datos...');
        this.showTypingIndicator();

        try {
            // 1. Solicitar datos -> backend
            const response = await fetch('/api/hierarchical-data');
            if (!response.ok) {
                throw new Error('Error al recuperar los datos');
            }

            // 2. Recibir respuesta JSON
            const data = await response.json();

            // 3. Ordenar por jerarquía
            const sortedData = this.sortHierarchicalData(data);

            this.hideTypingIndicator();

            // 4. Mostrar en frontend, uno por uno -> cada 0.5 s
            for (const item of sortedData) {
                this.addMessage('bot', `Item: ${item.name}`);
                await this.delay(500);
            }

            // 5. Confirmar visualmente al usuario cuando termine
            this.addMessage('bot', 'Todos los datos han sido mostrados.');

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('bot', 'Error al procesar los datos. Por favor, inténtalo de nuevo.');
            console.error('Error fetching and displaying data:', error);
        }
    }

    sortHierarchicalData(data, parentId = null) {
        const result = [];
        const children = data.filter(item => item.parentId === parentId);

        for (const child of children) {
            result.push(child);
            result.push(...this.sortHierarchicalData(data, child.id));
        }

        return result;
    }

    // Method to handle predefined responses for demo purposes
    getPredefinedResponse(message) {
        try {
            const lowerMessage = message.toLowerCase();
            
            const predefinedResponses = {
                'hola': '¡Hola! ¿En qué puedo ayudarte hoy?',
                'precio': 'Nuestros planes están diseñados para adaptarse a diferentes necesidades. ¿Te gustaría que te envíe información detallada sobre nuestros precios?',
                'demo': '¡Por supuesto! Puedes probar nuestro chatbot ahora mismo. También ofrecemos demos personalizados para empresas.',
                'contacto': 'Puedes contactarnos a través del formulario en nuestra página o enviarnos un email a info@aiassistant.com',
                'n8n': 'Nuestra plataforma está preparada para integrarse con n8n, permitiendo automatizar workflows complejos y optimizar procesos empresariales.',
                'ayuda': 'Estoy aquí para ayudarte. Puedes preguntarme sobre nuestros servicios, precios, demos o cualquier otra consulta.',
                'servicios': 'Ofrecemos servicios de chatbot con IA, integración con n8n, desarrollo web y automatización de procesos empresariales.',
                'gracias': '¡De nada! Me alegra poder ayudarte. ¿Hay algo más en lo que pueda asistirte?'
            };

            const matchedKeyword = Object.keys(predefinedResponses).find(keyword => lowerMessage.includes(keyword));

            return matchedKeyword 
                ? predefinedResponses[matchedKeyword] 
                : 'Gracias por tu mensaje. Nuestro equipo revisará tu consulta y te responderá pronto. ¿Hay algo más en lo que pueda ayudarte?';
        } catch (error) {
            console.error('Error getting predefined response:', error);
            return 'Gracias por tu mensaje. ¿Hay algo más en lo que pueda ayudarte?';
        }
    }
}

// Global chatbot instance
window.chatbot = null;

// Initialize all functionalities on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.chatbot = new Chatbot();
        setupSmoothScrolling();
        setupFormHandler();
    } catch (error) {
        console.error('Failed to initialize page:', error);
    }
});

function setupSmoothScrolling() {
    try {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    } catch (error) {
        console.error('Error setting up navigation:', error);
    }
}

function setupFormHandler() {
    try {
        const form = document.querySelector('.form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            const isFormValid = data.name && data.email && data.message;
            if (!isFormValid) {
                alert('Por favor, completa todos los campos requeridos.');
                return;
            }

            const submitBtn = form.querySelector('.btn-primary');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            try {
                await Promise.race([
                    new Promise(resolve => setTimeout(resolve, 2000)),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
                ]);
                alert('¡Gracias! Tu solicitud ha sido enviada correctamente. Nos pondremos en contacto contigo pronto.');
                form.reset();
            } catch (error) {
                console.error('Form submission error:', error);
                alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    } catch (error) {
        console.error('Error setting up form:', error);
    }
}

// Add enhanced CSS for animations and error handling
const style = document.createElement('style');
style.textContent = `
    .typing-dots::after {
        content: '...';
        animation: typing 1.5s infinite;
    }
    
    @keyframes typing {
        0%, 20% { content: '.'; }
        40% { content: '..'; }
        60%, 100% { content: '...'; }
    }
    
    .message {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .connection-indicator {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        transition: background-color 0.3s ease;
    }
    
    .connection-indicator.connected {
        background-color: #4CAF50;
    }
    
    .connection-indicator.disconnected {
        background-color: #f44336;
    }
    
    .error-message {
        animation: slideInFromRight 0.3s ease-out;
    }
    
    @keyframes slideInFromRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    #chatbot-input:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
        #chatbot-widget {
            width: calc(100vw - 40px) !important;
            left: 20px !important;
            right: 20px !important;
        }
    }
`;
document.head.appendChild(style);
