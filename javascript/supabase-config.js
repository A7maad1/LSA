// ============================================
// SUPABASE CONFIGURATION & UTILITIES
// ============================================

// Initialize Supabase Client
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.headers = {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'apikey': key
        };
    }

    async request(endpoint, options = {}) {
        const url = `${this.url}/rest/v1${endpoint}`;
        try {
            const response = await fetch(url, {
                headers: this.headers,
                ...options
            });
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Supabase request error:', error);
            throw error;
        }
    }
}

const client = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// ACTIVITIES CRUD OPERATIONS
// ============================================

const activitiesAPI = {
    // Get all activities
    async getAll() {
        try {
            return await supabase.query('/activities?order=created_at.desc');
        } catch (error) {
            console.error('Error fetching activities:', error);
            return [];
        }
    },

    // Get single activity
    async getById(id) {
        try {
            const data = await supabase.query(`/activities?id=eq.${id}`);
            return data[0] || null;
        } catch (error) {
            console.error('Error fetching activity:', error);
            return null;
        }
    },

    // Add new activity
    async add(activity) {
        try {
            const response = await supabase.query('/activities', {
                method: 'POST',
                body: JSON.stringify({
                    title: activity.title,
                    description: activity.description,
                    image_url: activity.image_url || null,
                    date: activity.date || new Date().toISOString(),
                    created_at: new Date().toISOString(),
                }),
            });
            return response;
        } catch (error) {
            console.error('Error adding activity:', error);
            throw error;
        }
    },

    // Update activity
    async update(id, activity) {
        try {
            const response = await supabase.query(
                `/activities?id=eq.${id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: activity.title,
                        description: activity.description,
                        image_url: activity.image_url,
                        date: activity.date,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating activity:', error);
            throw error;
        }
    },

    // Delete activity
    async delete(id) {
        try {
            await supabase.query(
                `/activities?id=eq.${id}`,
                { method: 'DELETE' }
            );
            return true;
        } catch (error) {
            console.error('Error deleting activity:', error);
            throw error;
        }
    },
};

// ============================================
// ANNOUNCEMENTS CRUD OPERATIONS
// ============================================

const announcementsAPI = {
    // Get all announcements
    async getAll() {
        try {
            return await supabase.query('/announcements?order=created_at.desc');
        } catch (error) {
            console.error('Error fetching announcements:', error);
            return [];
        }
    },

    // Add announcement
    async add(announcement) {
        try {
            const response = await supabase.query('/announcements', {
                method: 'POST',
                body: JSON.stringify({
                    title: announcement.title,
                    content: announcement.content,
                    category: announcement.category || 'عام',
                    file_url: announcement.file_url || null,
                    created_at: new Date().toISOString(),
                }),
            });
            return response;
        } catch (error) {
            console.error('Error adding announcement:', error);
            throw error;
        }
    },

    // Update announcement
    async update(id, announcement) {
        try {
            const response = await supabase.query(
                `/announcements?id=eq.${id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        title: announcement.title,
                        content: announcement.content,
                        category: announcement.category,
                        file_url: announcement.file_url,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating announcement:', error);
            throw error;
        }
    },

    // Delete announcement
    async delete(id) {
        try {
            await supabase.query(
                `/announcements?id=eq.${id}`,
                { method: 'DELETE' }
            );
            return true;
        } catch (error) {
            console.error('Error deleting announcement:', error);
            throw error;
        }
    },
};

// ============================================
// MEETINGS CRUD OPERATIONS
// ============================================

const meetingsAPI = {
    // Get all meetings
    async getAll() {
        try {
            return await supabase.query('/meetings?order=meeting_date.desc');
        } catch (error) {
            console.error('Error fetching meetings:', error);
            return [];
        }
    },

    // Add meeting
    async add(meeting) {
        try {
            const response = await supabase.query('/meetings', {
                method: 'POST',
                body: JSON.stringify({
                    subject: meeting.subject,
                    description: meeting.description || '',
                    meeting_date: meeting.meeting_date,
                    location: meeting.location || 'المدرسة',
                    created_at: new Date().toISOString(),
                }),
            });
            return response;
        } catch (error) {
            console.error('Error adding meeting:', error);
            throw error;
        }
    },

    // Update meeting
    async update(id, meeting) {
        try {
            const response = await supabase.query(
                `/meetings?id=eq.${id}`,
                {
                    method: 'PATCH',
                    body: JSON.stringify({
                        subject: meeting.subject,
                        description: meeting.description,
                        meeting_date: meeting.meeting_date,
                        location: meeting.location,
                        updated_at: new Date().toISOString(),
                    }),
                }
            );
            return response;
        } catch (error) {
            console.error('Error updating meeting:', error);
            throw error;
        }
    },

    // Delete meeting
    async delete(id) {
        try {
            await supabase.query(
                `/meetings?id=eq.${id}`,
                { method: 'DELETE' }
            );
            return true;
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    },
};

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

const authAPI = {
    // Sign up
    async signUp(email, password) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/signup`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!response.ok) {
                throw new Error('Sign up failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    },

    // Sign in
    async signIn(email, password) {
        try {
            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                }
            );

            if (!response.ok) {
                throw new Error('Sign in failed');
            }

            const data = await response.json();
            localStorage.setItem('auth_token', data.access_token);
            return data;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    },

    // Sign out
    async signOut() {
        localStorage.removeItem('auth_token');
        return true;
    },

    // Get current session
    getSession() {
        const token = localStorage.getItem('auth_token');
        return token ? { access_token: token } : null;
    },

    // Check if authenticated
    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    },
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        supabase,
        activitiesAPI,
        announcementsAPI,
        meetingsAPI,
        authAPI,
    };
}
