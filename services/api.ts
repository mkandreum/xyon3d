import { Product, AppSettings, Order } from '../types';

const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

// Session ID for wishlist (in production, this would be handled by authentication)
const getSessionId = () => {
    let sessionId = localStorage.getItem('xyon3d_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('xyon3d_session_id', sessionId);
    }
    return sessionId;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('xyon3d_token');
    return {
        'Content-Type': 'application/json',
        'X-Session-ID': getSessionId(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const ApiService = {
    // ==================== PRODUCTS ====================

    getProducts: async (): Promise<Product[]> => {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // Convert id to string and price to number for compatibility
        return data.map((p: any) => ({
            ...p,
            id: p.id.toString(),
            price: typeof p.price === 'string' ? parseFloat(p.price) : p.price
        }));
    },

    saveProduct: async (product: Product): Promise<Product> => {
        const isNew = !product.id || product.id === 'new';
        const url = isNew ? `${API_BASE_URL}/products` : `${API_BASE_URL}/products/${product.id}`;
        const method = isNew ? 'POST' : 'PUT';

        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                imageUrl: product.imageUrl,
                modelUrl: product.modelUrl,
                gallery: product.gallery || [],
            }),
        });

        if (!response.ok) throw new Error('Failed to save product');
        const data = await response.json();
        return { ...data, id: data.id.toString() };
    },

    deleteProduct: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },

    uploadImage: async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData, // No headers needed, fetch handles multipart/form-data
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
    },

    // ==================== ORDERS ====================

    getOrders: async (): Promise<Order[]> => {
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        return data.map((o: any) => ({
            ...o,
            id: o.id.toString(),
            total: typeof o.total === 'string' ? parseFloat(o.total) : o.total,
            // Ensure items is parsed if string
            items: typeof o.items === 'string' ? JSON.parse(o.items) : o.items
        }));
    },

    createOrder: async (order: Omit<Order, 'id'>): Promise<Order> => {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(order),
        });
        if (!response.ok) throw new Error('Failed to create order');
        const data = await response.json();
        return { ...data, id: data.id.toString() };
    },

    updateOrderStatus: async (id: string, status: 'pending' | 'shipped' | 'delivered'): Promise<Order> => {
        const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        const data = await response.json();
        return { ...data, id: data.id.toString() };
    },

    // ==================== SETTINGS ====================

    getSettings: async (): Promise<AppSettings> => {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    },

    saveSettings: async (settings: AppSettings): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings),
        });
        if (!response.ok) throw new Error('Failed to save settings');
    },

    // ==================== WISHLIST ====================

    getWishlist: async (): Promise<string[]> => {
        const response = await fetch(`${API_BASE_URL}/wishlist`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        const data = await response.json();
        return data.map((id: number) => id.toString());
    },

    saveWishlist: async (productIds: string[]): Promise<void> => {
        // This is a simplified implementation
        // In a real app, you'd sync the entire wishlist or use add/remove individually
        console.log('Wishlist sync not fully implemented in API mode');
    },

    addToWishlist: async (productId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: parseInt(productId) }),
        });
        if (!response.ok) throw new Error('Failed to add to wishlist');
    },

    removeFromWishlist: async (productId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!response.ok) throw new Error('Failed to remove from wishlist');
    },

    // ==================== ANALYTICS ====================

    getAnalytics: async (): Promise<{
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        ordersByStatus: Record<string, number>;
    }> => {
        const response = await fetch(`${API_BASE_URL}/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    },

    // ==================== AUTH ====================

    register: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        return response.json();
    },

    loginUser: async (data: any) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        return response.json();
    },

    getUserProfile: async () => {
        // Profile endpoint not yet implemented in backend, mocking for now or skipping
        return { message: 'Profile fetch placeholder' };
    },

    createMoneiPayment: async (data: { orderId: string, total: number, customerEmail: string }) => {
        const response = await fetch(`${API_BASE_URL}/create-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Payment creation failed');
        }
        return response.json();
    }
};
