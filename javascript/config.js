// ============================================
// CONFIGURATION MANAGEMENT
// Centralized application configuration
// ============================================

const AppConfig = {
    // ============================================
    // APP INFO
    // ============================================
    app: {
        name: (window.__env?.VITE_APP_NAME || window.VITE_APP_NAME) || 'ثانوية صلاح الدين الأيوبي',
        url: (window.__env?.VITE_APP_URL || window.VITE_APP_URL) || window.location.origin,
        version: '1.0.0'
    },

    // ============================================
    // API CONFIGURATION
    // ============================================
    api: {
        timeout: parseInt((window.__env?.VITE_API_TIMEOUT || window.VITE_API_TIMEOUT) || '30000'),
        rateLimit: parseInt((window.__env?.VITE_API_RATE_LIMIT || window.VITE_API_RATE_LIMIT) || '100'),
        retryAttempts: 3,
        retryDelay: 1000
    },

    // ============================================
    // COLOR SCHEME
    // ============================================
    colors: {
        primary: {
            blue: '#1A73E8',
            green: '#2ECC71'
        },
        neutral: {
            white: '#FFFFFF',
            lightGray: '#F5F5F5',
            darkGray: '#333333',
            textColor: '#444444',
            borderColor: '#DDDDDD'
        },
        status: {
            success: '#27AE60',
            error: '#E74C3C',
            warning: '#F39C12',
            info: '#3498DB',
            pending: '#95A5A6'
        }
    },

    // ============================================
    // TYPOGRAPHY
    // ============================================
    typography: {
        fontFamily: "'Cairo', sans-serif",
        fontSize: {
            xs: '12px',
            sm: '14px',
            base: '16px',
            lg: '18px',
            xl: '24px',
            '2xl': '32px'
        },
        fontWeight: {
            light: 300,
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
            black: 900
        }
    },

    // ============================================
    // SPACING
    // ============================================
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px'
    },

    // ============================================
    // BREAKPOINTS
    // ============================================
    breakpoints: {
        mobile: '480px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1400px'
    },

    // ============================================
    // FEATURE FLAGS
    // ============================================
    features: {
        notifications: (window.__env?.VITE_ENABLE_NOTIFICATIONS || window.VITE_ENABLE_NOTIFICATIONS) === 'true',
        emailReports: (window.__env?.VITE_ENABLE_EMAIL_REPORTS || window.VITE_ENABLE_EMAIL_REPORTS) === 'true',
        darkMode: (window.__env?.VITE_ENABLE_DARK_MODE || window.VITE_ENABLE_DARK_MODE) === 'true'
    },

    // ============================================
    // LOGGING
    // ============================================
    logging: {
        level: (window.__env?.VITE_LOG_LEVEL || window.VITE_LOG_LEVEL) || 'info',
        isDevelopment: (window.__env?.DEV || window.DEV) || false
    },

    // ============================================
    // VALIDATION RULES
    // ============================================
    validation: {
        password: {
            minLength: 8,
            requireNumbers: true,
            requireSpecialChars: true,
            requireUppercase: true
        },
        name: {
            minLength: 2,
            maxLength: 100
        },
        email: {
            maxLength: 100
        },
        phone: {
            minLength: 7,
            maxLength: 20
        },
        message: {
            minLength: 10,
            maxLength: 5000
        },
        title: {
            minLength: 3,
            maxLength: 255
        }
    },

    // ============================================
    // GALLERY CONFIGURATION
    // ============================================
    gallery: {
        imageCompressionQuality: 0.8,
        maxImageWidth: 1200,
        maxImageHeight: 1200,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },

    // ============================================
    // FILE UPLOAD CONFIGURATION
    // ============================================
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        uploadTimeout: 60000 // 60 seconds
    },

    // ============================================
    // PAGINATION
    // ============================================
    pagination: {
        defaultPageSize: 20,
        maxPageSize: 100
    },

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    toast: {
        duration: 3000,
        position: 'bottom-right'
    },

    // ============================================
    // DATE & TIME
    // ============================================
    dateTime: {
        locale: 'ar-MA',
        timezone: 'Africa/Casablanca',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: 'HH:mm'
    },

    // ============================================
    // CERTIFICATE TYPES
    // ============================================
    certificateTypes: [
        'شهادة مسلك',
        'شهادة السنة الدراسية',
        'شهادة حسن السلوك',
        'شهادة المشاركة',
        'شهادة التخرج'
    ],

    // ============================================
    // ANNOUNCEMENT CATEGORIES
    // ============================================
    announcementCategories: [
        'عام',
        'امتحانات',
        'إجازات',
        'مسابقات',
        'مذكرات وزارية',
        'تنبيهات مهمة'
    ],

    // ============================================
    // ERROR MESSAGES
    // ============================================
    errors: {
        required: 'هذا الحقل مطلوب',
        invalidEmail: 'البريد الإلكتروني غير صحيح',
        invalidPhone: 'رقم الهاتف غير صحيح',
        invalidMassar: 'رقم المسار يجب أن يكون 11 رقم',
        networkError: 'خطأ في الاتصال بالخادم',
        timeout: 'انتهت مهلة الانتظار',
        serverError: 'حدث خطأ بالخادم',
        fileTooBig: 'حجم الملف كبير جداً',
        unsupportedFormat: 'صيغة الملف غير مدعومة'
    },

    // ============================================
    // SUCCESS MESSAGES
    // ============================================
    success: {
        saved: 'تم الحفظ بنجاح',
        created: 'تم الإنشاء بنجاح',
        updated: 'تم التحديث بنجاح',
        deleted: 'تم الحذف بنجاح',
        sent: 'تم الإرسال بنجاح'
    },

    // ============================================
    // METHODS
    // ============================================

    /**
     * Get a configuration value by path
     * @param {string} path - Configuration path (e.g., 'colors.primary.blue')
     * @param {any} defaultValue - Default value if not found
     * @returns {any} Configuration value
     */
    get(path, defaultValue = undefined) {
        const parts = path.split('.');
        let current = this;

        for (const part of parts) {
            current = current[part];
            if (current === undefined) return defaultValue;
        }

        return current;
    },

    /**
     * Check if feature is enabled
     * @param {string} featureName - Feature name
     * @returns {boolean} True if enabled
     */
    isFeatureEnabled(featureName) {
        return this.features[featureName] === true;
    },

    /**
     * Get CSS variable for a color
     * @param {string} colorPath - Color path
     * @returns {string} CSS variable value
     */
    getColorVar(colorPath) {
        return this.get(colorPath, '#000000');
    },

    /**
     * Get error message
     * @param {string} errorKey - Error key
     * @returns {string} Error message
     */
    getErrorMessage(errorKey) {
        return this.errors[errorKey] || 'حدث خطأ غير معروف';
    },

    /**
     * Get success message
     * @param {string} successKey - Success key
     * @returns {string} Success message
     */
    getSuccessMessage(successKey) {
        return this.success[successKey] || 'تمت العملية بنجاح';
    }
};

// Export for global access
window.AppConfig = AppConfig;
