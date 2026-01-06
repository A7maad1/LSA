// ============================================
// JWT HELPER - For signing authentication tokens
// ============================================

class JWTHelper {
    constructor(secret) {
        // Decode the base64 secret
        this.secretBytes = this.base64ToBytes(secret);
    }

    // Base64URL encode
    base64UrlEncode(str) {
        return btoa(str)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    // Base64 decode to string
    base64Decode(base64) {
        try {
            return atob(base64);
        } catch (e) {
            console.error('Error decoding base64:', e);
            throw e;
        }
    }

    // Decode base64 string to bytes
    base64ToBytes(base64) {
        const binaryString = this.base64Decode(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Uint8Array to hex string
    bytesToHex(bytes) {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Sign JWT token using HMAC-SHA256
    async sign(payload) {
        const header = {
            alg: 'HS256',
            typ: 'JWT'
        };

        const now = Math.floor(Date.now() / 1000);
        const tokenPayload = {
            ...payload,
            iss: 'https://urcorksxlreocdjdnatw.supabase.co',
            iat: now,
            exp: now + 3600 // 1 hour expiration
        };

        const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
        const payloadEncoded = this.base64UrlEncode(JSON.stringify(tokenPayload));
        const message = `${headerEncoded}.${payloadEncoded}`;

        try {
            // Import the secret key for HMAC-SHA256
            const key = await crypto.subtle.importKey(
                'raw',
                this.secretBytes,
                { name: 'HMAC', hash: 'SHA-256' },
                false,
                ['sign']
            );

            // Sign the message
            const signature = await crypto.subtle.sign(
                'HMAC',
                key,
                new TextEncoder().encode(message)
            );

            // Convert signature to base64url
            const signatureArray = Array.from(new Uint8Array(signature));
            const signatureBinary = String.fromCharCode.apply(null, signatureArray);
            const signatureEncoded = this.base64UrlEncode(signatureBinary);

            const token = `${message}.${signatureEncoded}`;
            console.log('JWT Token created successfully');
            return token;
        } catch (error) {
            console.error('Error signing JWT:', error);
            throw error;
        }
    }
}

// Initialize JWT helper with the legacy secret
const JWT_SECRET = 'BIZURUfpSnsVHgd2a4MjzT2MQvty+mZcAFcjzjbOvrVS7c9pSNrMYu9Eon8/jmd64QW6Xg0oXNTbTEFbKBYr1w==';
const jwtHelper = new JWTHelper(JWT_SECRET);

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

            const text = await response.text();
            let data = null;
            
            if (text) {
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    data = text;
                }
            }
            
            if (!response.ok) {
                throw new Error(data?.message || data || `API error: ${response.status}`);
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
                formData.append('file', file);
                
                const headers = {
                    'apikey': this.key,
                    'Authorization': `Bearer ${this.key}`
                };
                
                console.log('Uploading to storage with anon key');
                
                const response = await fetch(
                    `${this.url}/storage/v1/object/${bucket}/${path}`,
                    {
                        method: 'POST',
                        headers: headers,
                        body: formData
                    }
                );
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Upload error response:', errorText);
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
// IMPORTANT: Get this key from Supabase Dashboard > Settings > API > anon (public) key
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY29ya3N4bHJlb2NkamRuYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODMxOTksImV4cCI6MjA3OTA1OTE5OX0.9s2ScvRseIQk8hy8pNhHAsl9jOOUXLUuKQE_dyEjneA';

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
    },

    // Certificates
    certificates: {
        getAll: async () => {
            try {
                return await supabase.table('certificate_requests').getAll();
            } catch (error) {
                console.error('Error fetching certificates:', error);
                return [];
            }
        },

        create: async (certificate) => {
            try {
                const result = await supabase.table('certificate_requests').insert({
                    ...certificate,
                    created_at: new Date().toISOString()
                });
                // Supabase returns an array with the inserted records
                return Array.isArray(result) ? result[0] : result;
            } catch (error) {
                console.error('Error creating certificate request:', error);
                throw error;
            }
        },

        update: async (id, certificate) => {
            try {
                return await supabase.table('certificate_requests').update(certificate, `id=eq.${id}`);
            } catch (error) {
                console.error('Error updating certificate request:', error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                await supabase.table('certificate_requests').delete(`id=eq.${id}`);
                return true;
            } catch (error) {
                console.error('Error deleting certificate request:', error);
                throw error;
            }
        }
    },

    // Contacts
    contacts: {
        getAll: async () => {
            try {
                return await supabase.table('contacts').getAll();
            } catch (error) {
                console.error('Error fetching contacts:', error);
                return [];
            }
        },

        insert: async (contact) => {
            try {
                const result = await supabase.table('contacts').insert({
                    ...contact,
                    created_at: new Date().toISOString()
                });
                // Supabase returns an array with the inserted records
                return Array.isArray(result) ? result[0] : result;
            } catch (error) {
                console.error('Error creating contact message:', error);
                throw error;
            }
        },

        update: async (id, contact) => {
            try {
                return await supabase.table('contacts').update(contact, `id=eq.${id}`);
            } catch (error) {
                console.error('Error updating contact message:', error);
                throw error;
            }
        },

        delete: async (id) => {
            try {
                await supabase.table('contacts').delete(`id=eq.${id}`);
                return true;
            } catch (error) {
                console.error('Error deleting contact message:', error);
                throw error;
            }
        }
    }
};

// ============================================
// STORAGE API - For Image and File Uploads
// ============================================

const storageAPI = {
    uploadImage: async (file, bucket = 'activities') => {
        try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${file.name}`;
            
            const storage = supabase.storage(bucket);
            const result = await storage.upload(fileName, file);
            
            // Return the public URL
            return storage.getPublicUrl(fileName);
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    deleteImage: async (path, bucket = 'activities') => {
        try {
            const storage = supabase.storage(bucket);
            return await storage.delete(path);
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
};

// ============================================
// AUTH API - For Dashboard Login
// ============================================

const authAPI = {
    signUp: async (email, password) => {
        try {
            // Check if user already exists
            const existing = await supabase.table('users').select('*', `email=eq.${email}`);
            if (existing && existing.length > 0) {
                throw new Error('البريد الإلكتروني مستخدم بالفعل');
            }
            
            // Create new user
            const response = await supabase.table('users').insert({
                email,
                password,
                full_name: 'مستخدم جديد',
                role: 'teacher'
            });
            
            if (response) {
                const user = response[0];
                
                // Generate real JWT token
                const jwtToken = await jwtHelper.sign({
                    sub: user.id || email,
                    email: email,
                    aud: 'authenticated',
                    role: 'authenticated'
                });
                
                localStorage.setItem('sb_user', JSON.stringify(user));
                localStorage.setItem('sb_token', 'token_' + Date.now()); // Keep for backward compatibility
                localStorage.setItem('sb_jwt_token', jwtToken); // Store real JWT for API calls
                return user;
            }
            throw new Error('Signup failed');
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    },

    signIn: async (email, password) => {
        try {
            console.log('Attempting login with email:', email);
            
            // Build proper filter string
            const filter = `email=eq.${encodeURIComponent(email)}`;
            console.log('Filter:', filter);
            
            // Query users table with direct REST call
            const endpoint = `/users?select=*&${filter}`;
            const users = await supabase.request('GET', endpoint);
            
            console.log('Found users:', users);
            
            if (!users || users.length === 0) {
                throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }
            
            const user = users[0];
            console.log('User found:', user);
            
            // Simple password check (not hashed - for testing only)
            if (user.password !== password) {
                console.log('Password mismatch. Expected:', user.password, 'Got:', password);
                throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            }
            
            // Generate real JWT token
            const jwtToken = await jwtHelper.sign({
                sub: user.id || email,
                email: email,
                aud: 'authenticated',
                role: 'authenticated'
            });
            
            console.log('JWT token generated:', jwtToken);
            console.log('JWT token parts:', jwtToken.split('.').map((part, i) => ({
                part: i === 0 ? 'header' : i === 1 ? 'payload' : 'signature',
                length: part.length,
                value: i < 2 ? JSON.parse(atob(part.padEnd(part.length + (4 - part.length % 4) % 4, '='))) : part.substring(0, 20) + '...'
            })));
            
            // Store session with real JWT token
            localStorage.setItem('sb_user', JSON.stringify(user));
            localStorage.setItem('sb_token', 'token_' + Date.now()); // Keep for backward compatibility
            localStorage.setItem('sb_jwt_token', jwtToken); // Store real JWT for API calls
            
            console.log('Login successful');
            return user;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    signOut: async () => {
        localStorage.removeItem('sb_user');
        localStorage.removeItem('sb_token');
        localStorage.removeItem('sb_jwt_token');
        return true;
    },

    getSession: () => {
        const user = localStorage.getItem('sb_user');
        const token = localStorage.getItem('sb_token');
        const jwtToken = localStorage.getItem('sb_jwt_token');
        return user && token ? JSON.parse(user) : null;
    }
};
