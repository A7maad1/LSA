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

// Note: API object is now defined in supabase-api.js with all modules

// ============================================
// EXPORT SUPABASE CLIENT
// ============================================
// Export for global use in other modules (like auth.js)
window.supabaseClient = {
    url: SUPABASE_URL,
    anonKey: SUPABASE_ANON_KEY,
    
    // Simple database client
    client: {
        // Query profiles table
        from: function(tableName) {
            const self = this;
            return {
                tableName: tableName,
                filters: {},
                
                select: function(columns = '*') {
                    this.columns = columns;
                    return this;
                },
                
                eq: function(column, value) {
                    this.filters[column] = value;
                    return this;
                },
                
                single: async function() {
                    try {
                        let url = `${SUPABASE_URL}/rest/v1/${this.tableName}?select=${this.columns || '*'}`;
                        
                        // Add filters
                        for (const [col, val] of Object.entries(this.filters)) {
                            url += `&${col}=eq.${encodeURIComponent(val)}`;
                        }
                        
                        url += '&limit=1';
                        
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'apikey': SUPABASE_ANON_KEY,
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                            }
                        });
                        
                        const data = await response.json();
                        
                        if (!response.ok) {
                            return { data: null, error: { message: 'Query failed' } };
                        }
                        
                        return {
                            data: Array.isArray(data) && data.length > 0 ? data[0] : null,
                            error: null
                        };
                    } catch (error) {
                        return { data: null, error: { message: error.message } };
                    }
                }
            };
        },
        
        // Call PostgreSQL functions
        rpc: async function(functionName, params) {
            try {
                const response = await fetch(
                    `${SUPABASE_URL}/rest/v1/rpc/${functionName}`,
                    {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(params)
                    }
                );
                
                const data = await response.json();
                
                if (!response.ok) {
                    return {
                        data: null,
                        error: { message: data?.message || 'RPC call failed' }
                    };
                }
                
                return {
                    data: data,
                    error: null
                };
            } catch (error) {
                return {
                    data: null,
                    error: { message: error.message }
                };
            }
        }
    }
};
