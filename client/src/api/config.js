const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const api = {
    async get(endpoint) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include' 
        });
        return response; 
    },
    async post(endpoint, body) {
        const isFormData = body instanceof FormData;
        
        const headers = {};
        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: headers,
            credentials: 'include', 
            body: isFormData ? body : JSON.stringify(body),
        });
        
        return response; 
    }
};