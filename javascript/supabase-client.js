// ============================================
// SUPABASE CLIENT - Browser Compatible
// ============================================

class SupabaseClient {
    constructor(url, key) {
        this.url = url.replace(/\/$/, ''); // Remove trailing slash
        this.key = key;
        this.headers = {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'apikey': key
        };
    }

    async request(method, endpoint, body = null) {
        const url = `${this.url}/rest/v1${endpoint}`;
        const options = {
            method,
            headers: this.headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            
            // Handle 204 No Content
            if (response.status === 204) {
                return null;
            }

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `API error: ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('Supabase request error:', error);
            throw error;
        }
    }

    // Table operations
    table(name) {
        return {
            select: async (columns = '*', filter = null) => {
                let endpoint = `/${name}?select=${columns}`;
                if (filter) endpoint += `&${filter}`;
                return this.request('GET', endpoint);
            },
            
            insert: async (data) => {
                return this.request('POST', `/${name}`, data);
            },
            
            update: async (data, filter) => {
                let endpoint = `/${name}`;
                if (filter) endpoint += `?${filter}`;
                return this.request('PATCH', endpoint, data);
            },
            
            delete: async (filter) => {
                let endpoint = `/${name}`;
                if (filter) endpoint += `?${filter}`;
                return this.request('DELETE', endpoint);
            },
            
            // Convenience methods
            findById: async (id) => {
                const result = await this.request('GET', `/${name}?id=eq.${id}`);
                return Array.isArray(result) ? result[0] : null;
            },
            
            getAll: async () => {
                return this.request('GET', `/${name}?order=created_at.desc`);
            }
        };
    }

    // Auth operations
    auth() {
        return {
            signUp: async (email, password) => {
                return this.request('POST', '/auth/v1/signup', {
                    email,
                    password
                });
            },
            
            signIn: async (email, password) => {
                return this.request('POST', '/auth/v1/token?grant_type=password', {
                    email,
                    password
                });
            },
            
            signOut: async () => {
                localStorage.removeItem('sb_token');
                return true;
            },
            
            getSession: () => {
                return localStorage.getItem('sb_token');
            }
        };
    }

    // Storage operations
    storage(bucket) {
        return {
            upload: async (path, file) => {
                const formData = new FormData();
                formData.append('', file);
                
                const response = await fetch(
                    `${this.url}/storage/v1/object/${bucket}/${path}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.key}`,
                            'apikey': this.key
                        },
                        body: formData
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Upload failed: ${response.status}`);
                }
                
                return await response.json();
            },
            
            getPublicUrl: (path) => {
                return `${this.url}/storage/v1/object/public/${bucket}/${path}`;
            }
        };
    }
}

// Initialize with environment variables (hardcoded for now)
const SUPABASE_URL = 'https://urcorksxlreocdjdnatw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY29ya3N4bHJlb2NkamRuYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MzAwNDEsImV4cCI6MTc2MzA2NjA0MX0.8v_lPaGTpPkv3TgKmE0cWWZxA7qPb8Y1Ym5kJ0Q-gOs';

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// API UTILITIES
// ============================================

const API = {
    // Activities
    activities: {
        getAll: async () => {
            try {
                return await supabase.table('activities').getAll();
            } catch (error) {
                console.error('Error fetching activities:', error);
                return [];
            }
        },

        getById: async (id) => {
            try {
                return await supabase.table('activities').findById(id);
            } catch (error) {
                console.error('Error fetching activity:', error);
                return null;
            }
        },

        create: async (activity) => {
            try {
                return await supabase.table('activities').insert({
                    ...activity,
                    created_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error creating activity:', error);
                throw error;
            }
        },

        update: async (id, activity) => {
            try {
                return await supabase.table('activities').update(activity, `id=eq.${id}`);
            } catch (error) {
                console.error('Error updating activity:', error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                await supabase.table('activities').delete(`id=eq.${id}`);
                return true;
            } catch (error) {
                console.error('Error deleting activity:', error);
                throw error;
            }
        }
    },

    // Announcements
    announcements: {
        getAll: async () => {
            try {
                return await supabase.table('announcements').getAll();
            } catch (error) {
                console.error('Error fetching announcements:', error);
                return [];
            }
        },

        create: async (announcement) => {
            try {
                return await supabase.table('announcements').insert({
                    ...announcement,
                    created_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error creating announcement:', error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                await supabase.table('announcements').delete(`id=eq.${id}`);
                return true;
            } catch (error) {
                console.error('Error deleting announcement:', error);
                throw error;
            }
        }
    },

    // Meetings
    meetings: {
        getAll: async () => {
            try {
                return await supabase.table('meetings').getAll();
            } catch (error) {
                console.error('Error fetching meetings:', error);
                return [];
            }
        },

        create: async (meeting) => {
            try {
                return await supabase.table('meetings').insert({
                    ...meeting,
                    created_at: new Date().toISOString()
                });
            } catch (error) {
                console.error('Error creating meeting:', error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                await supabase.table('meetings').delete(`id=eq.${id}`);
                return true;
            } catch (error) {
                console.error('Error deleting meeting:', error);
                throw error;
            }
        }
    }
};

// ============================================
// AUTH API - For Dashboard Login
// ============================================

const authAPI = {
    signUp: async (email, password) => {
        try {
            const response = await supabase.auth().signUp(email, password);
            if (response.user) {
                localStorage.setItem('sb_user', JSON.stringify(response.user));
                localStorage.setItem('sb_token', response.session?.access_token || 'token');
                return response.user;
            }
            throw new Error('Signup failed');
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    signIn: async (email, password) => {
        try {
            const response = await supabase.auth().signIn(email, password);
            if (response.user) {
                localStorage.setItem('sb_user', JSON.stringify(response.user));
                localStorage.setItem('sb_token', response.session?.access_token || 'token');
                return response.user;
            }
            throw new Error('Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signOut: async () => {
        localStorage.removeItem('sb_user');
        localStorage.removeItem('sb_token');
        return true;
    },

    getSession: () => {
        const user = localStorage.getItem('sb_user');
        const token = localStorage.getItem('sb_token');
        return user && token ? JSON.parse(user) : null;
    }
};
