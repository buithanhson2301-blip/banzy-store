import { create } from 'zustand';
import { authAPI } from './api';

interface User {
    _id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
}

interface Shop {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    phone?: string;
    address?: string;
    license: {
        plan: string;
        trialEndsAt: string;
        expiresAt?: string;
        status: string;
    };
}

interface AuthState {
    user: User | null;
    shop: Shop | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; shopName?: string }) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    setAuth: (user: User, shop: Shop, token: string) => void;
    setShop: (shop: Shop) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    shop: null,
    token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
    isLoading: true,
    isAuthenticated: false,

    login: async (email, password) => {
        const { data } = await authAPI.login({ email, password });
        localStorage.setItem('token', data.token);
        set({
            user: data.user,
            shop: data.shop,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    register: async (registerData) => {
        const { data } = await authAPI.register(registerData);
        localStorage.setItem('token', data.token);
        set({
            user: data.user,
            shop: data.shop,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
        });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            shop: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    },

    fetchUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        try {
            const { data } = await authAPI.getMe();
            set({
                user: data.user,
                shop: data.shop,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch {
            localStorage.removeItem('token');
            set({
                user: null,
                shop: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    },

    setAuth: (user, shop, token) => {
        localStorage.setItem('token', token);
        set({ user, shop, token, isAuthenticated: true, isLoading: false });
    },

    setShop: (shop) => {
        set({ shop });
    },
}));

// Format currency helper
export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

// Format date helper
export const formatDate = (date: string, includeTime = false) => {
    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(date).toLocaleDateString('vi-VN', options);
};

// Order status labels
export const ORDER_STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xử lý',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};

// Order status colors
export const ORDER_STATUS_COLORS: Record<string, string> = {
    pending: 'warning',
    processing: 'primary',
    shipping: 'primary',
    completed: 'success',
    cancelled: 'danger',
};
