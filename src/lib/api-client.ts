/**
 * API Client
 * 
 * A comprehensive API client for making HTTP requests to the backend.
 * Uses proper async/await patterns and includes:
 * - Automatic authentication via cookies
 * - Error handling
 * - Type safety
 * - Request/response interceptors
 */

// Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Default request options
const defaultOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Make a GET request
 */
export async function apiGet<T>(
  url: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  try {
    // Build URL with query parameters
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl = `${url}?${queryString}`;
      }
    }

    const response = await fetch(fullUrl, {
      ...defaultOptions,
      method: 'GET',
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result.error || result.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data: result,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Make a POST request
 */
export async function apiPost<T>(
  url: string,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result.error || result.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data: result,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Make a PUT request
 */
export async function apiPut<T>(
  url: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result.error || result.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data: result,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T>(
  url: string,
  body: Record<string, unknown>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      method: 'PATCH',
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result.error || result.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data: result,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T>(
  url: string,
  params?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    // Build URL with query parameters
    let fullUrl = url;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value);
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl = `${url}?${queryString}`;
      }
    }

    const response = await fetch(fullUrl, {
      ...defaultOptions,
      method: 'DELETE',
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: result.error || result.message || 'Request failed',
        status: response.status,
      };
    }

    return {
      data: result,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

/**
 * Upload files with progress tracking
 */
export async function apiUpload<T>(
  url: string,
  formData: FormData,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<T>> {
  try {
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        try {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              data: result,
              error: null,
              status: xhr.status,
            });
          } else {
            resolve({
              data: null,
              error: result.error || 'Upload failed',
              status: xhr.status,
            });
          }
        } catch {
          resolve({
            data: null,
            error: 'Invalid response',
            status: xhr.status,
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          data: null,
          error: 'Network error',
          status: 0,
        });
      });

      xhr.open('POST', url);
      xhr.withCredentials = true;
      xhr.send(formData);
    });
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Upload failed',
      status: 0,
    };
  }
}

// API Endpoints object for type-safe API calls
export const api = {
  // Auth
  auth: {
    login: (email: string, password: string, rememberMe?: boolean) =>
      apiPost('/api/auth/login', { email, password, rememberMe }),
    logout: () => apiPost('/api/auth/logout'),
    signup: (data: Record<string, unknown>) => apiPost('/api/auth/signup', data),
    check: () => apiGet('/api/auth/login'),
  },

  // Users
  users: {
    list: (params?: Record<string, string | number>) => apiGet('/api/users', params),
    get: (userId: string) => apiGet(`/api/users?userId=${userId}`),
    create: (data: Record<string, unknown>) => apiPost('/api/users', data),
    update: (data: Record<string, unknown>) => apiPut('/api/users', data),
    delete: (userId: string) => apiDelete(`/api/users?userId=${userId}`),
  },

  // Orders
  orders: {
    list: (params?: Record<string, string | number>) => apiGet('/api/orders', params),
    get: (orderId: string) => apiGet(`/api/orders?orderId=${orderId}`),
    create: (data: Record<string, unknown>) => apiPost('/api/orders', data),
    update: (data: Record<string, unknown>) => apiPut('/api/orders', data),
  },

  // Services
  services: {
    list: (params?: Record<string, string | number>) => apiGet('/api/services', params),
    get: (slug: string) => apiGet(`/api/services?slug=${slug}`),
    create: (data: Record<string, unknown>) => apiPost('/api/services', data),
    update: (data: Record<string, unknown>) => apiPut('/api/services', data),
    delete: (serviceId: string) => apiDelete(`/api/services?serviceId=${serviceId}`),
  },

  // Tasks
  tasks: {
    list: (params?: Record<string, string | number>) => apiGet('/api/tasks', params),
    get: (taskId: string) => apiGet(`/api/tasks?taskId=${taskId}`),
    update: (data: Record<string, unknown>) => apiPut('/api/tasks', data),
  },

  // Notifications
  notifications: {
    list: (params?: Record<string, string | number>) => apiGet('/api/notifications', params),
    markAsRead: (notificationId: string) => apiPut('/api/notifications', { notificationId }),
    markAllAsRead: () => apiPut('/api/notifications', { markAll: true }),
  },

  // Transactions
  transactions: {
    list: (params?: Record<string, string | number>) => apiGet('/api/transactions', params),
    create: (data: Record<string, unknown>) => apiPost('/api/transactions', data),
  },

  // Support Tickets
  tickets: {
    list: (params?: Record<string, string | number>) => apiGet('/api/tickets', params),
    get: (ticketId: string) => apiGet(`/api/tickets?ticketId=${ticketId}`),
    create: (data: Record<string, unknown>) => apiPost('/api/tickets', data),
    update: (data: Record<string, unknown>) => apiPut('/api/tickets', data),
  },

  // Reviews
  reviews: {
    list: (params?: Record<string, string | number>) => apiGet('/api/reviews', params),
    create: (data: Record<string, unknown>) => apiPost('/api/reviews', data),
    update: (data: Record<string, unknown>) => apiPut('/api/reviews', data),
  },

  // Statistics (Admin)
  statistics: {
    dashboard: () => apiGet('/api/admin/statistics?scope=dashboard'),
    analytics: (timeRange?: string) => apiGet('/api/admin/statistics', { scope: 'analytics', timeRange }),
    revenue: (timeRange?: string) => apiGet('/api/admin/statistics', { scope: 'revenue', timeRange }),
    performance: (department?: string) => apiGet('/api/admin/statistics', { scope: 'performance', department }),
  },

  // Settings
  settings: {
    get: () => apiGet('/api/settings/site'),
    update: (data: Record<string, unknown>) => apiPut('/api/settings/site', data),
  },

  // Assets/Files
  assets: {
    list: (params?: Record<string, string | number>) => apiGet('/api/assets', params),
    upload: (formData: FormData, onProgress?: (progress: number) => void) =>
      apiUpload('/api/upload', formData, onProgress),
    delete: (assetId: string) => apiDelete(`/api/assets?assetId=${assetId}`),
  },

  // Chat
  chat: {
    rooms: () => apiGet('/api/chat/rooms'),
    messages: (roomId: string, params?: Record<string, string | number>) =>
      apiGet(`/api/chat/messages`, { roomId, ...params }),
    sendMessage: (data: Record<string, unknown>) => apiPost('/api/chat/messages', data),
  },

  // Admin: CMS
  cms: {
    pages: {
      list: () => apiGet('/api/admin/cms/pages'),
      get: (slug: string) => apiGet(`/api/admin/cms/pages?slug=${slug}`),
      create: (data: Record<string, unknown>) => apiPost('/api/admin/cms/pages', data),
      update: (data: Record<string, unknown>) => apiPut('/api/admin/cms/pages', data),
      delete: (pageId: string) => apiDelete(`/api/admin/cms/pages?pageId=${pageId}`),
    },
    blog: {
      list: () => apiGet('/api/admin/cms/blog'),
      get: (slug: string) => apiGet(`/api/admin/cms/blog?slug=${slug}`),
      create: (data: Record<string, unknown>) => apiPost('/api/admin/cms/blog', data),
      update: (data: Record<string, unknown>) => apiPut('/api/admin/cms/blog', data),
      delete: (postId: string) => apiDelete(`/api/admin/cms/blog?postId=${postId}`),
    },
    faq: {
      list: () => apiGet('/api/admin/cms/faq'),
      create: (data: Record<string, unknown>) => apiPost('/api/admin/cms/faq', data),
      update: (data: Record<string, unknown>) => apiPut('/api/admin/cms/faq', data),
      delete: (faqId: string) => apiDelete(`/api/admin/cms/faq?faqId=${faqId}`),
    },
  },

  // Admin: Reviews Management
  adminReviews: {
    list: (params?: Record<string, string | number>) => apiGet('/api/admin/reviews', params),
    approve: (reviewId: string) => apiPut('/api/admin/reviews', { reviewId, status: 'APPROVED' }),
    reject: (reviewId: string, note?: string) => apiPut('/api/admin/reviews', { reviewId, status: 'REJECTED', note }),
    delete: (reviewId: string) => apiDelete(`/api/admin/reviews?reviewId=${reviewId}`),
  },

  // Admin: Testimonials
  testimonials: {
    list: () => apiGet('/api/admin/testimonials'),
    create: (data: Record<string, unknown>) => apiPost('/api/admin/testimonials', data),
    update: (data: Record<string, unknown>) => apiPut('/api/admin/testimonials', data),
    delete: (testimonialId: string) => apiDelete(`/api/admin/testimonials?testimonialId=${testimonialId}`),
  },

  // Admin: Features
  features: {
    list: () => apiGet('/api/admin/features'),
    update: (key: string, enabled: boolean) => apiPut('/api/admin/features', { key, enabled }),
  },

  // Admin: Settings
  adminSettings: {
    list: () => apiGet('/api/admin/settings'),
    update: (key: string, value: string) => apiPut('/api/admin/settings', { key, value }),
  },

  // Admin: CRUD (Generic)
  crud: {
    list: (entity: string, params?: Record<string, string | number>) =>
      apiGet('/api/admin/crud', { entity, ...params }),
    get: (entity: string, id: string) => apiGet('/api/admin/crud', { entity, id }),
    create: (entity: string, data: Record<string, unknown>) =>
      apiPost('/api/admin/crud', { entity, data }),
    update: (entity: string, id: string, data: Record<string, unknown>) =>
      apiPut('/api/admin/crud', { entity, id, data }),
    delete: (entity: string, id: string) => apiDelete('/api/admin/crud', { entity, id }),
  },

  // Contact Form
  contact: {
    submit: (data: Record<string, unknown>) => apiPost('/api/contact', data),
  },

  // Payment Gateways (Admin)
  paymentGateways: {
    list: (includeDisabled?: boolean) => 
      apiGet(`/api/admin/payment-gateways${includeDisabled ? '?includeDisabled=true' : ''}`),
    get: (id: string) => apiGet(`/api/admin/payment-gateways?id=${id}`),
    create: (data: Record<string, unknown>) => apiPost('/api/admin/payment-gateways', data),
    update: (data: Record<string, unknown>) => apiPut('/api/admin/payment-gateways', data),
    delete: (id: string) => apiDelete(`/api/admin/payment-gateways?id=${id}`),
  },

  // Payments (Client)
  payments: {
    getPayPalConfig: () => apiGet('/api/payments/paypal'),
    createPayPalOrder: (amount: number, currency?: string) => 
      apiPost('/api/payments/paypal', { action: 'create', amount, currency }),
    capturePayPalOrder: (orderId: string) => 
      apiPost('/api/payments/paypal', { action: 'capture', orderId }),
  },
};

export default api;
