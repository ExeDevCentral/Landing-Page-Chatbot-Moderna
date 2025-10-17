'use strict';

// Main JavaScript functionality with comprehensive error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize all components with error handling
        initializeAnimations();
        initializeScrollEffects();
        initializeCounters();
        initializeParallax();
        initializeAuth();
        initializePerformanceMonitoring();
    } catch (error) {
        console.error('Failed to initialize main functionality:', error);
        showGlobalError('Error al cargar la aplicación. Por favor, recarga la página.');
    }
});

function initializeAuth() {
    try {
        const token = localStorage.getItem('token');
        const loginButton = document.getElementById('login-button');
        const logoutButton = document.getElementById('logout-button');
        const ticketsTab = document.getElementById('tickets-tab');

        if (token) {
            // Verify token validity
            verifyToken(token).then(isValid => {
                if (isValid) {
                    if (loginButton) loginButton.style.display = 'none';
                    if (logoutButton) logoutButton.style.display = 'block';
                    if (ticketsTab) ticketsTab.style.display = 'block';
                } else {
                    // Token is invalid, clear it
                    localStorage.removeItem('token');
                    if (loginButton) loginButton.style.display = 'block';
                    if (logoutButton) logoutButton.style.display = 'none';
                    if (ticketsTab) ticketsTab.style.display = 'none';
                }
            }).catch(error => {
                console.error('Token verification failed:', error);
                localStorage.removeItem('token');
            });
        } else {
            if (loginButton) loginButton.style.display = 'block';
            if (logoutButton) logoutButton.style.display = 'none';
            if (ticketsTab) ticketsTab.style.display = 'none';
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    localStorage.removeItem('token');
                    window.location.reload();
                } catch (error) {
                    console.error('Error during logout:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error initializing auth:', error);
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });
        
        return response.ok;
    } catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}

// Animation on scroll with error handling
function initializeAnimations() {
    try {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                try {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                } catch (error) {
                    console.error('Error in animation observer:', error);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animateElements = document.querySelectorAll('.feature-card, .hero-content, .hero-visual, .contact-info, .contact-form');
        animateElements.forEach(el => {
            try {
                observer.observe(el);
            } catch (error) {
                console.error('Error observing element:', error);
            }
        });
    } catch (error) {
        console.error('Error initializing animations:', error);
    }
}

// Scroll effects with error handling
function initializeScrollEffects() {
    try {
        let lastScrollTop = 0;
        const navbar = document.querySelector('.navbar');
        
        if (!navbar) return;
        
        const handleScroll = debounce(() => {
            try {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Navbar background opacity
                if (scrollTop > 100) {
                    navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                } else {
                    navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                }
                
                // Hide/show navbar on scroll
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
            } catch (error) {
                console.error('Error in scroll handler:', error);
            }
        }, 10);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    } catch (error) {
        console.error('Error initializing scroll effects:', error);
    }
}

// Counter animations with error handling
function initializeCounters() {
    try {
        const counters = document.querySelectorAll('.stat-number, .metric-value');
        
        if (counters.length === 0) return;
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                try {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        counterObserver.unobserve(entry.target);
                    }
                } catch (error) {
                    console.error('Error in counter observer:', error);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            try {
                counterObserver.observe(counter);
            } catch (error) {
                console.error('Error observing counter:', error);
            }
        });
    } catch (error) {
        console.error('Error initializing counters:', error);
    }
}

function animateCounter(element) {
    try {
        const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
        if (isNaN(target) || target <= 0) return;
        
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            try {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                
                // Format number based on original text
                const originalText = element.textContent;
                if (originalText.includes('%')) {
                    element.textContent = Math.floor(current) + '%';
                } else if (originalText.includes('K')) {
                    element.textContent = Math.floor(current) + 'K+';
                } else if (originalText.includes('.')) {
                    element.textContent = current.toFixed(1);
                } else {
                    element.textContent = Math.floor(current);
                }
            } catch (error) {
                console.error('Error in counter animation:', error);
                clearInterval(timer);
            }
        }, 16);
    } catch (error) {
        console.error('Error animating counter:', error);
    }
}

// Parallax effects with error handling
function initializeParallax() {
    try {
        const handleParallax = debounce(() => {
            try {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.hero-visual');
                
                parallaxElements.forEach(element => {
                    try {
                        const speed = 0.5;
                        element.style.transform = `translateY(${scrolled * speed}px)`;
                    } catch (error) {
                        console.error('Error in parallax element:', error);
                    }
                });
            } catch (error) {
                console.error('Error in parallax handler:', error);
            }
        }, 10);
        
        window.addEventListener('scroll', handleParallax, { passive: true });
    } catch (error) {
        console.error('Error initializing parallax:', error);
    }
}

// Performance monitoring
function initializePerformanceMonitoring() {
    try {
        // Monitor page load performance
        window.addEventListener('load', () => {
            try {
                const perfData = performance.getEntriesByType('navigation')[0];
                if (perfData) {
                    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
                }
            } catch (error) {
                console.error('Error monitoring performance:', error);
            }
        });

        // Monitor memory usage (if available)
        if ('memory' in performance) {
            setInterval(() => {
                try {
                    const memory = performance.memory;
                    if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
                        console.warn('High memory usage detected:', memory);
                    }
                } catch (error) {
                    console.error('Error monitoring memory:', error);
                }
            }, 30000); // Check every 30 seconds
        }
    } catch (error) {
        console.error('Error initializing performance monitoring:', error);
    }
}

// Utility functions with error handling
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        try {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        } catch (error) {
            console.error('Error in debounced function:', error);
        }
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        try {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        } catch (error) {
            console.error('Error in throttled function:', error);
        }
    };
}

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    try {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    } catch (error) {
        console.error('Error toggling mobile menu:', error);
    }
}

// Theme toggle (for future dark mode)
function toggleTheme() {
    try {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        
        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: isDark ? 'dark' : 'light' } 
        }));
    } catch (error) {
        console.error('Error toggling theme:', error);
    }
}

// Load saved theme
function loadTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
    } catch (error) {
        console.error('Error loading theme:', error);
    }
}

// Initialize theme
try {
    loadTheme();
} catch (error) {
    console.error('Error initializing theme:', error);
}

// Global error handler
function showGlobalError(message) {
    try {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'global-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4444;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            try {
                errorDiv.remove();
            } catch (error) {
                console.error('Error removing error message:', error);
            }
        }, 5000);
    } catch (error) {
        console.error('Error showing global error:', error);
    }
}

// Handle unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    showGlobalError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showGlobalError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
});

// Add enhanced CSS for animations and error handling
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    .feature-card,
    .hero-content,
    .hero-visual,
    .contact-info,
    .contact-form {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease-out;
    }
    
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    
    .navbar {
        transition: all 0.3s ease;
    }
    
    .hero-visual,
    .dashboard-preview {
        transition: transform 0.1s ease-out;
    }
    
    .global-error {
        animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-100%);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
    
    /* Loading states */
    .loading {
        opacity: 0.6;
        pointer-events: none;
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
        border-top: 2px solid #3498db;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Error states */
    .error {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    /* Success states */
    .success {
        border-color: #27ae60 !important;
        background-color: #f0f9f0 !important;
    }
    
    .success-message {
        color: #27ae60;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(animationStyles);
