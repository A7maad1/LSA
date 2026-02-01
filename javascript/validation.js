// ============================================
// INPUT VALIDATION & SANITIZATION UTILITY
// Security-focused validation functions
// ============================================

class ValidationUtils {
    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(String(email).trim());
    }

    /**
     * Validate phone number (flexible international format)
     * @param {string} phone - Phone number to validate
     * @returns {boolean} True if valid
     */
    static validatePhone(phone) {
        const regex = /^[\d\s\-\+\(\)]{7,20}$/;
        return regex.test(String(phone).trim());
    }

    /**
     * Validate URL
     * @param {string} url - URL to validate
     * @returns {boolean} True if valid
     */
    static validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Validate text length
     * @param {string} text - Text to validate
     * @param {number} minLength - Minimum length
     * @param {number} maxLength - Maximum length
     * @returns {boolean} True if valid
     */
    static validateLength(text, minLength = 1, maxLength = 5000) {
        const length = String(text).trim().length;
        return length >= minLength && length <= maxLength;
    }

    /**
     * Validate required field
     * @param {any} value - Value to validate
     * @returns {boolean} True if not empty
     */
    static validateRequired(value) {
        if (typeof value === 'string') {
            return value.trim().length > 0;
        }
        return value != null && value !== '';
    }

    /**
     * Validate date format (ISO 8601)
     * @param {string} date - Date to validate
     * @returns {boolean} True if valid
     */
    static validateDate(date) {
        const isoRegex = /^\d{4}-\d{2}-\d{2}/;
        if (!isoRegex.test(date)) return false;
        return !isNaN(Date.parse(date));
    }

    /**
     * Validate number
     * @param {any} value - Value to validate
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {boolean} True if valid
     */
    static validateNumber(value, min = -Infinity, max = Infinity) {
        const num = Number(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Validate Moroccan MASSAR number (11 digits)
     * @param {string} massar - MASSAR number
     * @returns {boolean} True if valid
     */
    static validateMassarNumber(massar) {
        const regex = /^\d{11}$/;
        return regex.test(String(massar).trim());
    }

    /**
     * Validate Moroccan phone number
     * @param {string} phone - Phone number
     * @returns {boolean} True if valid
     */
    static validateMoroccanPhone(phone) {
        const regex = /^(\+212|0)([5-9]\d{8})$/;
        return regex.test(String(phone).replace(/\s/g, ''));
    }

    /**
     * Sanitize HTML input to prevent XSS
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Sanitize user input for database
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    static sanitizeInput(text) {
        return String(text)
            .trim()
            .replace(/[\<\>\"\']/g, '') // Remove potentially dangerous characters
            .substring(0, 5000); // Limit length
    }

    /**
     * Validate form data object
     * @param {object} formData - Form data to validate
     * @param {object} rules - Validation rules
     * @returns {object} {isValid, errors}
     */
    static validateForm(formData, rules) {
        const errors = {};
        let isValid = true;

        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];

            if (rule.required && !this.validateRequired(value)) {
                errors[field] = `${field} is required`;
                isValid = false;
                continue;
            }

            if (value && rule.type) {
                let fieldValid = true;
                switch (rule.type) {
                    case 'email':
                        fieldValid = this.validateEmail(value);
                        if (!fieldValid) errors[field] = 'Invalid email format';
                        break;
                    case 'phone':
                        fieldValid = this.validatePhone(value);
                        if (!fieldValid) errors[field] = 'Invalid phone format';
                        break;
                    case 'url':
                        fieldValid = this.validateURL(value);
                        if (!fieldValid) errors[field] = 'Invalid URL';
                        break;
                    case 'date':
                        fieldValid = this.validateDate(value);
                        if (!fieldValid) errors[field] = 'Invalid date format';
                        break;
                    case 'number':
                        fieldValid = this.validateNumber(value, rule.min, rule.max);
                        if (!fieldValid) errors[field] = `Number must be between ${rule.min} and ${rule.max}`;
                        break;
                    case 'massar':
                        fieldValid = this.validateMassarNumber(value);
                        if (!fieldValid) errors[field] = 'MASSAR number must be 11 digits';
                        break;
                }
                isValid = isValid && fieldValid;
            }

            if (value && rule.minLength && !this.validateLength(value, rule.minLength, 5000)) {
                errors[field] = `Minimum length is ${rule.minLength} characters`;
                isValid = false;
            }

            if (value && rule.maxLength && !this.validateLength(value, 0, rule.maxLength)) {
                errors[field] = `Maximum length is ${rule.maxLength} characters`;
                isValid = false;
            }
        }

        return { isValid, errors };
    }

    /**
     * Create validation error message
     * @param {object} errors - Errors object
     * @returns {string} Formatted error message
     */
    static getErrorMessage(errors) {
        const messages = Object.values(errors);
        if (messages.length === 0) return '';
        if (messages.length === 1) return messages[0];
        return messages.join(', ');
    }
}

// Export for global access
window.ValidationUtils = ValidationUtils;
