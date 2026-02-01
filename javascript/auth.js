// ============================================
// AUTHENTICATION MODULE - Custom Profiles Table
// Uses custom profiles table instead of Supabase Auth
// ============================================

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.initializeAuth();
    }

    /**
     * Initialize authentication
     */
    initializeAuth() {
        this.restoreSession();
    }

    /**
     * Sign up with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} User data or null
     */
    async signUp(email, password) {
        try {
            // Validate inputs
            if (!ValidationUtils.validateEmail(email)) {
                throw new Error('البريد الإلكتروني غير صحيح');
            }
            if (!password || password.length < 8) {
                throw new Error('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
            }

            throw new Error('لا يمكن إنشاء حسابات جديدة - يُرجى استخدام الحسابات المتاحة');
        } catch (error) {
            console.error('❌ خطأ في إنشاء الحساب:', error.message);
            throw error;
        }
    }

    /**
     * Sign in with email and password using profiles table
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} User data or null
     */
    async signIn(email, password) {
        try {
            // Validate inputs
            if (!ValidationUtils.validateEmail(email)) {
                throw new Error('البريد الإلكتروني غير صحيح');
            }
            if (!password) {
                throw new Error('كلمة المرور مطلوبة');
            }

            console.log('🔐 محاولة تسجيل دخول:', email);

            // Call authenticate_user RPC function directly
            const authUrl = `${supabaseClient.url}/rest/v1/rpc/authenticate_user`;
            
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'apikey': supabaseClient.anonKey,
                    'Authorization': `Bearer ${supabaseClient.anonKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    p_email: email,
                    p_password: password
                })
            });

            const data = await response.json();

            if (!response.ok || !data?.success) {
                console.error('❌ البريد الإلكتروني أو كلمة المرور غير صحيحة');
                throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }

            // Store session
            this.currentUser = {
                id: data.user_id,
                email: data.email,
                role: data.role || 'user',
                full_name: data.full_name
            };
            
            // Generate a session token (client-side)
            this.sessionToken = this._generateSessionToken(this.currentUser);
            this.saveSession();

            console.log('✅ تم تسجيل الدخول بنجاح:', email);
            return this.currentUser;
        } catch (error) {
            console.error('❌ خطأ في تسجيل الدخول:', error.message);
            throw error;
        }
    }

    /**
     * Generate session token (client-side JWT-like token)
     */
    _generateSessionToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        // Simple base64 encoding (not real JWT, but sufficient for demo)
        return 'lsa_' + btoa(JSON.stringify(payload));
    }

    /**
     * Sign out current user
     * @returns {Promise<void>}
     */
    async signOut() {
        try {
            this.currentUser = null;
            this.sessionToken = null;
            localStorage.removeItem('lsa_auth_session');
            localStorage.removeItem('lsa_auth_token');
            console.log('✅ تم تسجيل الخروج بنجاح');
        } catch (error) {
            console.error('❌ خطأ في تسجيل الخروج:', error);
            throw error;
        }
    }

    /**
     * Get current session
     * @returns {object|null} Current user session or null
     */
    getSession() {
        return this.currentUser ? { email: this.currentUser.email, user: this.currentUser } : null;
    }

    /**
     * Get current authenticated user
     * @returns {object|null} User object or null
     */
    getUser() {
        return this.currentUser;
    }

    /**
     * Get current session token
     * @returns {string|null} Access token or null
     */
    getToken() {
        return this.sessionToken;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null && this.sessionToken !== null;
    }

    /**
     * Save session to localStorage
     */
    saveSession() {
        if (this.currentUser && this.sessionToken) {
            localStorage.setItem('lsa_auth_session', JSON.stringify(this.currentUser));
            localStorage.setItem('lsa_auth_token', this.sessionToken);
        }
    }

    /**
     * Restore session from localStorage
     */
    restoreSession() {
        try {
            const sessionStr = localStorage.getItem('lsa_auth_session');
            const token = localStorage.getItem('lsa_auth_token');

            if (sessionStr && token) {
                this.currentUser = JSON.parse(sessionStr);
                this.sessionToken = token;
                console.log('✅ تم استرجاع الجلسة:', this.currentUser.email);
            }
        } catch (error) {
            console.warn('⚠️ لم يتمكن من استرجاع الجلسة:', error.message);
            localStorage.removeItem('lsa_auth_session');
            localStorage.removeItem('lsa_auth_token');
        }
    }

    /**
     * Refresh session token
     * @returns {Promise<boolean>} True if successful
     */
    async refreshToken() {
        try {
            if (!this.sessionToken) {
                throw new Error('لا توجد جلسة نشطة');
            }

            // Client-side token refresh (regenerate token)
            if (this.currentUser) {
                this.sessionToken = this._generateSessionToken(this.currentUser);
                this.saveSession();
                console.log('✅ تم تحديث الجلسة');
                return true;
            }

            throw new Error('فشل تحديث الجلسة');
        } catch (error) {
            console.error('❌ خطأ في تحديث الجلسة:', error.message);
            return false;
        }
    }

    /**
     * Reset password for email
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    async resetPassword(email) {
        try {
            if (!ValidationUtils.validateEmail(email)) {
                throw new Error('البريد الإلكتروني غير صحيح');
            }

            throw new Error('خدمة إعادة تعيين كلمة المرور غير متاحة حالياً');
        } catch (error) {
            console.error('❌ خطأ في إعادة تعيين كلمة المرور:', error.message);
            throw error;
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global access
window.authManager = authManager;
window.AuthManager = AuthManager;
