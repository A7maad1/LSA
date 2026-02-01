// ============================================
// SECURE SUPABASE CLIENT
// Consolidated module for all database operations
// ============================================

class SecureSupabaseClient {
    constructor() {
        // Get environment variables from window.__env__ (set by config script)
        // or from localStorage (used in development)
        const getEnv = (key) => {
            return (
                window.__env?.[key] ||
                localStorage.getItem(key) ||
                window[key]
            );
        };
        
        this.url = getEnv('VITE_SUPABASE_URL') || 'https://urcorksxlreocdjdnatw.supabase.co';
        this.anonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY29ya3N4bHJlb2NkamRuYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODMxOTksImV4cCI6MjA3OTA1OTE5OX0.9s2ScvRseIQk8hy8pNhHAsl9jOOUXLUuKQE_dyEjneA';
        this.timeout = getEnv('VITE_API_TIMEOUT') || 30000;
        
        if (!this.url || !this.anonKey) {
            console.error('❌ Supabase environment variables not configured');
        }
    }

    /**
     * Make authenticated request to Supabase API
     * @param {string} endpoint - API endpoint path
     * @param {object} options - Fetch options
     * @returns {Promise} API response
     */
    async request(endpoint, options = {}) {
        const url = `${this.url}/rest/v1${endpoint}`;
        const headers = {
            'Authorization': `Bearer ${this.anonKey}`,
            'Content-Type': 'application/json',
            'apikey': this.anonKey,
            ...options.headers
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
            }

            // Handle 204 No Content responses
            if (response.status === 204) {
                return null;
            }

            // Handle empty response body
            const contentLength = response.headers.get('content-length');
            if (contentLength === '0' || response.status === 201) {
                // For INSERT/POST that returns 201, try to parse JSON, or return success
                const text = await response.text();
                if (!text) {
                    return { success: true };
                }
                try {
                    return JSON.parse(text);
                } catch (e) {
                    return { success: true };
                }
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            this.logError('Supabase Request Error', error);
            throw error;
        }
    }

    /**
     * Log errors safely without exposing sensitive data
     * @param {string} context - Error context
     * @param {Error} error - Error object
     */
    logError(context, error) {
        const isDevelopment = (window.__env?.DEV || window.DEV) || false;
        if (isDevelopment) {
            console.error(`${context}:`, error);
        } else {
            console.error(`${context}: ${error.message}`);
        }
    }
}

// Initialize client
const supabaseClient = new SecureSupabaseClient();

// ============================================
// ACTIVITIES API
// ============================================
const activitiesAPI = {
    /**
     * Get all activities
     * @returns {Promise<Array>} Activities list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/activities?order=created_at.desc');
        } catch (error) {
            supabaseClient.logError('Error fetching activities', error);
            throw error;
        }
    },

    /**
     * Get activity by ID
     * @param {string} id - Activity ID
     * @returns {Promise<object>} Activity object
     */
    async getById(id) {
        try {
            const data = await supabaseClient.request(`/activities?id=eq.${id}`);
            return data[0] || null;
        } catch (error) {
            supabaseClient.logError('Error fetching activity', error);
            throw error;
        }
    },

    /**
     * Create new activity
     * @param {object} activity - Activity data
     * @returns {Promise<object>} Created activity
     */
    async create(activity) {
        try {
            // Validate input
            if (!activity.title || !activity.description) {
                throw new Error('Title and description are required');
            }

            const response = await supabaseClient.request('/activities', {
                method: 'POST',
                body: JSON.stringify({
                    title: String(activity.title).substring(0, 255),
                    description: String(activity.description).substring(0, 5000),
                    image_url: activity.image_url || null,
                    date: activity.date || new Date().toISOString(),
                    created_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating activity', error);
            throw error;
        }
    },

    /**
     * Update activity
     * @param {string} id - Activity ID
     * @param {object} activity - Updated activity data
     * @returns {Promise<object>} Updated activity
     */
    async update(id, activity) {
        try {
            const response = await supabaseClient.request(
                `/activities?id=eq.${id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: String(activity.title).substring(0, 255),
                        description: String(activity.description).substring(0, 5000),
                        image_url: activity.image_url,
                        date: activity.date,
                        updated_at: new Date().toISOString(),
                    })
                }
            );
            return response;
        } catch (error) {
            supabaseClient.logError('Error updating activity', error);
            throw error;
        }
    },

    /**
     * Delete activity
     * @param {string} id - Activity ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/activities?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting activity', error);
            throw error;
        }
    }
};

// ============================================
// ANNOUNCEMENTS API
// ============================================
const announcementsAPI = {
    /**
     * Get all announcements
     * @returns {Promise<Array>} Announcements list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/announcements?order=created_at.desc');
        } catch (error) {
            supabaseClient.logError('Error fetching announcements', error);
            throw error;
        }
    },

    /**
     * Create announcement
     * @param {object} announcement - Announcement data
     * @returns {Promise<object>} Created announcement
     */
    async create(announcement) {
        try {
            if (!announcement.title || !announcement.content) {
                throw new Error('Title and content are required');
            }

            const response = await supabaseClient.request('/announcements', {
                method: 'POST',
                body: JSON.stringify({
                    title: String(announcement.title).substring(0, 255),
                    content: String(announcement.content).substring(0, 5000),
                    category: announcement.category || 'عام',
                    file_url: announcement.file_url || null,
                    created_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating announcement', error);
            throw error;
        }
    },

    /**
     * Delete announcement
     * @param {string} id - Announcement ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/announcements?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting announcement', error);
            throw error;
        }
    }
};

// ============================================
// GALLERY API
// ============================================
const galleryAPI = {
    /**
     * Get all gallery images
     * @returns {Promise<Array>} Gallery images list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/gallery?order=order_index.asc');
        } catch (error) {
            supabaseClient.logError('Error fetching gallery', error);
            throw error;
        }
    },

    /**
     * Create gallery image
     * @param {object} image - Image data
     * @returns {Promise<object>} Created image
     */
    async create(image) {
        try {
            if (!image.title || !image.image_url) {
                throw new Error('Title and image URL are required');
            }

            const response = await supabaseClient.request('/gallery', {
                method: 'POST',
                body: JSON.stringify({
                    title: String(image.title).substring(0, 255),
                    description: image.description ? String(image.description).substring(0, 1000) : null,
                    image_url: image.image_url,
                    order_index: image.order_index || 0,
                    created_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating gallery image', error);
            throw error;
        }
    },

    /**
     * Delete gallery image
     * @param {string} id - Image ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/gallery?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting gallery image', error);
            throw error;
        }
    }
};

// ============================================
// CERTIFICATES API
// ============================================
const certificatesAPI = {
    /**
     * Get all certificate requests
     * @returns {Promise<Array>} Certificate requests list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/certificate_requests?order=created_at.desc');
        } catch (error) {
            supabaseClient.logError('Error fetching certificates', error);
            throw error;
        }
    },

    /**
     * Create certificate request
     * @param {object} certificate - Certificate data
     * @returns {Promise<object>} Created certificate request
     */
    async create(certificate) {
        try {
            // Validate required fields
            const requiredFields = ['first_name', 'last_name', 'massar_number', 'submission_date'];
            for (const field of requiredFields) {
                if (!certificate[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            const response = await supabaseClient.request('/certificate_requests', {
                method: 'POST',
                body: JSON.stringify({
                    first_name: String(certificate.first_name).substring(0, 100),
                    last_name: String(certificate.last_name).substring(0, 100),
                    massar_number: String(certificate.massar_number).substring(0, 50),
                    submission_date: certificate.submission_date,
                    status: 'pending',
                    notes: certificate.notes ? String(certificate.notes).substring(0, 1000) : null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating certificate request', error);
            throw error;
        }
    },

    /**
     * Update certificate request status
     * @param {string} id - Certificate ID
     * @param {string} status - New status
     * @param {string} notes - Notes
     * @returns {Promise<object>} Updated certificate
     */
    async updateStatus(id, status, notes = '') {
        try {
            const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
            if (!validStatuses.includes(status)) {
                throw new Error('Invalid status');
            }

            const response = await supabaseClient.request(
                `/certificate_requests?id=eq.${id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        status,
                        notes: notes ? String(notes).substring(0, 1000) : null,
                        updated_at: new Date().toISOString(),
                    })
                }
            );
            return response;
        } catch (error) {
            supabaseClient.logError('Error updating certificate', error);
            throw error;
        }
    },

    /**
     * Delete certificate request
     * @param {string} id - Certificate ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/certificate_requests?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting certificate', error);
            throw error;
        }
    }
};

// ============================================
// CONTACTS API
// ============================================
const contactsAPI = {
    /**
     * Get all contact messages
     * @returns {Promise<Array>} Contact messages list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/contacts?order=created_at.desc');
        } catch (error) {
            supabaseClient.logError('Error fetching contacts', error);
            throw error;
        }
    },

    /**
     * Create contact message
     * @param {object} contact - Contact data
     * @returns {Promise<object>} Created contact
     */
    async create(contact) {
        try {
            // Validate input
            const requiredFields = ['name', 'email', 'subject', 'message'];
            for (const field of requiredFields) {
                if (!contact[field]) {
                    throw new Error(`${field} is required`);
                }
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(contact.email)) {
                throw new Error('Invalid email format');
            }

            const response = await supabaseClient.request('/contacts', {
                method: 'POST',
                body: JSON.stringify({
                    name: String(contact.name).substring(0, 100),
                    email: String(contact.email).substring(0, 100),
                    phone: contact.phone ? String(contact.phone).substring(0, 20) : null,
                    subject: String(contact.subject).substring(0, 255),
                    message: String(contact.message).substring(0, 5000),
                    is_read: false,
                    created_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating contact message', error);
            throw error;
        }
    },

    /**
     * Mark contact as read
     * @param {string} id - Contact ID
     * @returns {Promise<void>}
     */
    async markAsRead(id) {
        try {
            await supabaseClient.request(`/contacts?id=eq.${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_read: true })
            });
        } catch (error) {
            supabaseClient.logError('Error marking contact as read', error);
            throw error;
        }
    },

    /**
     * Delete contact message
     * @param {string} id - Contact ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/contacts?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting contact', error);
            throw error;
        }
    }
};

// ============================================
// MEETINGS API
// ============================================
const meetingsAPI = {
    /**
     * Get all meetings
     * @returns {Promise<Array>} Meetings list
     */
    async getAll() {
        try {
            return await supabaseClient.request('/meetings?order=date.desc');
        } catch (error) {
            supabaseClient.logError('Error fetching meetings', error);
            throw error;
        }
    },

    /**
     * Create meeting
     * @param {object} meeting - Meeting data
     * @returns {Promise<object>} Created meeting
     */
    async create(meeting) {
        try {
            if (!meeting.title || !meeting.date) {
                throw new Error('Title and date are required');
            }

            const response = await supabaseClient.request('/meetings', {
                method: 'POST',
                body: JSON.stringify({
                    title: String(meeting.title).substring(0, 255),
                    description: meeting.description ? String(meeting.description).substring(0, 5000) : null,
                    date: meeting.date,
                    location: meeting.location ? String(meeting.location).substring(0, 255) : null,
                    created_at: new Date().toISOString(),
                })
            });
            return response;
        } catch (error) {
            supabaseClient.logError('Error creating meeting', error);
            throw error;
        }
    },

    /**
     * Delete meeting
     * @param {string} id - Meeting ID
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await supabaseClient.request(`/meetings?id=eq.${id}`, {
                method: 'DELETE'
            });
        } catch (error) {
            supabaseClient.logError('Error deleting meeting', error);
            throw error;
        }
    }
};

// ============================================
// STORAGE API - FILE UPLOADS
// ============================================
const storageAPI = {
    /**
     * Upload file to Supabase Storage
     * @param {File} file - File object to upload
     * @param {string} bucket - Storage bucket name (default: 'announcements')
     * @returns {Promise<object>} Upload result with public URL
     */
    async uploadFile(file, bucket = 'announcements') {
        try {
            if (!file) {
                throw new Error('No file provided');
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit');
            }

            // Generate unique filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileExt = file.name.substring(file.name.lastIndexOf('.'));
            const fileName = `${timestamp}-${randomStr}${fileExt}`;
            const filePath = `${bucket}/${fileName}`;

            // Upload file using REST API
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(
                `${supabaseClient.url}/storage/v1/object/${bucket}/${fileName}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${supabaseClient.anonKey}`,
                        'apikey': supabaseClient.anonKey,
                    },
                    body: file
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Upload failed: ${errorData.message || response.statusText}`);
            }

            // Generate public URL
            const publicUrl = `${supabaseClient.url}/storage/v1/object/public/${bucket}/${fileName}`;
            
            console.log('File uploaded successfully:', {
                fileName: fileName,
                bucket: bucket,
                url: publicUrl
            });

            return {
                success: true,
                fileName: fileName,
                filePath: filePath,
                publicUrl: publicUrl,
                size: file.size
            };
        } catch (error) {
            supabaseClient.logError('Error uploading file', error);
            throw error;
        }
    },

    /**
     * Delete file from Supabase Storage
     * @param {string} filePath - File path in storage (bucket/filename)
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(filePath) {
        try {
            if (!filePath) {
                throw new Error('File path is required');
            }

            const [bucket, ...pathParts] = filePath.split('/');
            const fileName = pathParts.join('/');

            const response = await fetch(
                `${supabaseClient.url}/storage/v1/object/${bucket}/${fileName}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${supabaseClient.anonKey}`,
                        'apikey': supabaseClient.anonKey,
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`Delete failed: ${response.statusText}`);
            }

            console.log('File deleted successfully:', filePath);
            return true;
        } catch (error) {
            supabaseClient.logError('Error deleting file', error);
            throw error;
        }
    }
};

// ============================================
// AUTHENTICATION API
// ============================================
const authAPI = {
    /**
     * Login with email and password using Supabase Auth
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Authentication result
     */
    async login(email, password) {
        try {
            // Call Supabase Auth API
            const response = await fetch(
                `${supabaseClient.url}/auth/v1/token?grant_type=password`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': supabaseClient.anonKey,
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                console.error('Auth Error:', data);
                return {
                    success: false,
                    error: data.error_description || data.error || 'Authentication failed'
                };
            }

            // Get user metadata
            const userResponse = await fetch(
                `${supabaseClient.url}/auth/v1/user`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${data.access_token}`,
                        'apikey': supabaseClient.anonKey,
                    }
                }
            );

            const userData = await userResponse.json();

            return {
                success: true,
                session: data,
                user: userData,
                token: data.access_token
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Logout user by clearing session
     * @returns {Promise<object>} Logout result
     */
    async logout() {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                await fetch(
                    `${supabaseClient.url}/auth/v1/logout`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'apikey': supabaseClient.anonKey,
                        }
                    }
                );
            }

            localStorage.removeItem('session');
            localStorage.removeItem('authToken');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('session');
            localStorage.removeItem('authToken');
            return { success: true };
        }
    },

    /**
     * Get current user session
     * @returns {object} Current session or null
     */
    getCurrentSession() {
        const session = localStorage.getItem('session');
        return session ? JSON.parse(session) : null;
    },

    /**
     * Verify if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        const session = localStorage.getItem('session');
        const token = localStorage.getItem('authToken');
        return !!(session && token);
    }
};

// ============================================
// EXPORT API OBJECT
// ============================================
const API = {
    activities: activitiesAPI,
    announcements: announcementsAPI,
    gallery: galleryAPI,
    certificates: certificatesAPI,
    contacts: contactsAPI,
    meetings: meetingsAPI,
    storage: storageAPI,
    auth: authAPI
};

// Export for global access
window.API = API;
window.supabaseClient = supabaseClient;
