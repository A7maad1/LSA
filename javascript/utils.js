// ============================================
// UTILITY FUNCTIONS
// Common helper functions used across application
// ============================================

/**
 * Format date to readable format
 * @param {string|Date} date - Date to format
 * @param {string} format - Format template
 * @returns {string} Formatted date
 */
function formatDate(date, format = 'DD/MM/YYYY') {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return 'تاريخ غير صحيح';

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('DD', day)
            .replace('MM', month)
            .replace('YYYY', year)
            .replace('HH', hours)
            .replace('mm', minutes);
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'تاريخ غير صحيح';
    }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100, suffix = '...') {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
}

/**
 * Convert bytes to human-readable format
 * @param {number} bytes - Bytes to convert
 * @param {number} decimals - Decimal places
 * @returns {string} Formatted size
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i];
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
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

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object} Cloned object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (obj instanceof Object) {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if visible
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} target - Target element or selector
 * @param {object} options - Scroll options
 */
function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    element.scrollIntoView({
        behavior: options.behavior || 'smooth',
        block: options.block || 'start'
    });
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Set multiple CSS variables on element
 * @param {HTMLElement} element - Target element
 * @param {object} variables - CSS variables object
 */
function setCSSVariables(element, variables) {
    for (const [key, value] of Object.entries(variables)) {
        element.style.setProperty(`--${key}`, value);
    }
}

/**
 * Check if element has class
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name
 * @returns {boolean} True if has class
 */
function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name
 */
function toggleClass(element, className) {
    element.classList.toggle(className);
}

/**
 * Add class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name
 */
function addClass(element, className) {
    element.classList.add(className);
}

/**
 * Remove class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name
 */
function removeClass(element, className) {
    element.classList.remove(className);
}

/**
 * Get computed style property
 * @param {HTMLElement} element - Target element
 * @param {string} property - CSS property
 * @returns {string} Property value
 */
function getStyleProperty(element, property) {
    return window.getComputedStyle(element).getPropertyValue(property);
}

/**
 * Retry an async function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxAttempts - Maximum attempts
 * @param {number} delay - Initial delay in ms
 * @returns {Promise} Result of function
 */
async function retryAsync(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxAttempts - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }
    
    throw lastError;
}

/**
 * Create promise that resolves after delay
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise} Resolves after delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Export utilities for global access
 */
const Utils = {
    formatDate,
    truncateText,
    formatBytes,
    debounce,
    throttle,
    deepClone,
    generateId,
    isInViewport,
    smoothScrollTo,
    getQueryParam,
    setCSSVariables,
    hasClass,
    toggleClass,
    addClass,
    removeClass,
    getStyleProperty,
    retryAsync,
    delay
};

window.Utils = Utils;
