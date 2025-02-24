import { API_BASE_URL, ENDPOINTS } from '../config/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

export const loginWithEmailPassword = async (email, password) => {
    try {
        console.log('🔄 Login attempt:', { email });

        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('✅ Login successful:', data);
        
        localStorage.setItem('userToken', data.token);
        return { user: data };
    } catch (error) {
        console.error('❌ Login failed:', error);
        return { error: error.message || 'Failed to connect to server' };
    }
};

export const register = async (userData) => {
    try {
        console.log('🔄 Registration attempt:', { ...userData, password: '[HIDDEN]' });

        const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            credentials: 'include',
        });
        
        const data = await handleResponse(response);
        console.log('✅ Registration successful:', data);
        
        localStorage.setItem('userToken', data.token);
        return { user: data };
    } catch (error) {
        console.error('❌ Registration failed:', error);
        return { error: error.message || 'Failed to connect to server' };
    }
};

export const logout = () => {
    localStorage.removeItem('userToken');
};