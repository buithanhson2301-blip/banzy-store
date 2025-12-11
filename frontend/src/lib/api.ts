import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'Đã xảy ra lỗi';

        // Handle license expired
        if (error.response?.data?.code === 'LICENSE_EXPIRED') {
            if (typeof window !== 'undefined') {
                window.location.href = '/license-expired';
            }
        }

        // Handle unauthorized
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        return Promise.reject({ message, ...error.response?.data });
    }
);

// Auth API
export const authAPI = {
    register: (data: { email: string; password: string; name: string; shopName?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token: string, password: string) =>
        api.post(`/auth/reset-password/${token}`, { password }),
    updateShop: (data: { name: string; description?: string; phone?: string; address?: string }) =>
        api.put('/auth/shop', data),
    changePassword: (currentPassword: string, newPassword: string) =>
        api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Products API
export const productsAPI = {
    getAll: (params?: any) => api.get('/products', { params }),
    getById: (id: string) => api.get(`/products/${id}`),
    create: (data: any) => api.post('/products', data),
    update: (id: string, data: any) => api.put(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
    getCategories: () => api.get('/products/categories'),
    getLowStock: () => api.get('/products/low-stock'),
    updateStock: (id: string, adjustment: number, reason?: string) =>
        api.patch(`/products/${id}/stock`, { adjustment, reason }),
};

// Customers API
export const customersAPI = {
    getAll: (params?: any) => api.get('/customers', { params }),
    getById: (id: string) => api.get(`/customers/${id}`),
    create: (data: any) => api.post('/customers', data),
    update: (id: string, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
    getOrders: (id: string) => api.get(`/customers/${id}/orders`),
};

// Orders API
export const ordersAPI = {
    getAll: (params?: any) => api.get('/orders', { params }),
    getById: (id: string) => api.get(`/orders/${id}`),
    create: (data: any) => api.post('/orders', data),
    update: (id: string, data: any) => api.put(`/orders/${id}`, data),
    updateStatus: (id: string, status: string, note?: string) =>
        api.patch(`/orders/${id}/status`, { status, note }),
    cancel: (id: string, reason?: string) =>
        api.post(`/orders/${id}/cancel`, { reason }),
    getStats: () => api.get('/orders/stats'),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRevenue: (params?: any) => api.get('/dashboard/revenue', { params }),
    getTopProducts: (limit?: number) => api.get('/dashboard/top-products', { params: { limit } }),
    getRecentOrders: (limit?: number) => api.get('/dashboard/recent-orders', { params: { limit } }),
};

// Staff API
export const staffAPI = {
    getAll: () => api.get('/staff'),
    create: (data: { email: string; name: string; role: string; password?: string }) =>
        api.post('/staff', data),
    update: (id: string, data: any) => api.put(`/staff/${id}`, data),
    delete: (id: string) => api.delete(`/staff/${id}`),
    resetPassword: (id: string, newPassword: string) =>
        api.post(`/staff/${id}/reset-password`, { newPassword }),
};

// Suppliers API
export const suppliersAPI = {
    getAll: (params?: any) => api.get('/suppliers', { params }),
    getById: (id: string) => api.get(`/suppliers/${id}`),
    create: (data: any) => api.post('/suppliers', data),
    update: (id: string, data: any) => api.put(`/suppliers/${id}`, data),
    delete: (id: string) => api.delete(`/suppliers/${id}`),
};

// Integrations API
export const integrationsAPI = {
    getAll: () => api.get('/integrations'),
    get: (platform: string) => api.get(`/integrations/${platform}`),
    connect: (platform: string, data: any) => api.post(`/integrations/${platform}/connect`, data),
    disconnect: (platform: string) => api.post(`/integrations/${platform}/disconnect`),
    updateSettings: (platform: string, settings: any) => api.patch(`/integrations/${platform}/settings`, settings),
    syncProducts: (platform: string) => api.post(`/integrations/${platform}/sync-products`),
    syncOrders: (platform: string) => api.post(`/integrations/${platform}/sync-orders`),
};

// Tier Settings API
export const tierSettingsAPI = {
    get: () => api.get('/tier-settings'),
    update: (tiers: any[]) => api.put('/tier-settings', { tiers }),
};

// Shipping API
export const shippingAPI = {
    // Settings
    getSettings: () => api.get('/shipping/settings'),
    getProviderSettings: (provider: string) => api.get(`/shipping/settings/${provider}`),
    saveSettings: (provider: string, data: any) => api.post(`/shipping/settings/${provider}`, data),
    verifyToken: (provider: string) => api.post(`/shipping/settings/${provider}/verify`),

    // Orders
    sendToShipping: (orderId: string, provider?: string) =>
        api.post(`/shipping/orders/${orderId}/send`, { provider: provider || 'viettel_post' }),
    trackOrder: (orderId: string) => api.get(`/shipping/orders/${orderId}/track`),
    cancelShipping: (orderId: string) => api.post(`/shipping/orders/${orderId}/cancel`),

    // Utilities
    calculateFee: (data: any) => api.post('/shipping/calculate-fee', data),

    // Locations
    getProvinces: () => api.get('/shipping/locations/provinces'),
    getDistricts: (provinceId: number) => api.get(`/shipping/locations/districts/${provinceId}`),
    getWards: (districtId: number) => api.get(`/shipping/locations/wards/${districtId}`),
};

export default api;
