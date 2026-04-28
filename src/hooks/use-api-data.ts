'use client';

import { useState, useEffect, useCallback } from 'react';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: Record<string, unknown>;
  onError?: (error: string) => void;
}

async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(endpoint, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const errorMsg = errorData.error || `Request failed (${res.status})`;
      options.onError?.(errorMsg);
      return { error: errorMsg, loading: false };
    }

    const data = await res.json();
    return { data, loading: false };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Network error';
    options.onError?.(errorMsg);
    return { error: errorMsg, loading: false };
  }
}

// ============================================
// CLIENT API HOOKS
// ============================================

export function useClientOrders(pagination: PaginationParams = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<{
    total: number;
    hasMore: boolean;
  }>({ total: 0, hasMore: false });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    if (pagination.limit) params.set('limit', String(pagination.limit));
    if (pagination.offset) params.set('offset', String(pagination.offset));
    
    const result = await apiFetch<{
      orders: Order[];
      pagination: { total: number; hasMore: boolean };
    }>(`/api/orders?${params.toString()}`);
    
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOrders(result.data.orders || []);
      setPaginationData({
        total: result.data.pagination?.total || 0,
        hasMore: result.data.pagination?.hasMore || false,
      });
    }
    setLoading(false);
  }, [pagination.limit, pagination.offset]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, loading, error, pagination: paginationData, refetch: fetchOrders };
}

export function useClientTransactions(pagination: PaginationParams = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (pagination.limit) params.set('limit', String(pagination.limit));
      
      const result = await apiFetch<{ transactions: Transaction[] }>(
        `/api/transactions?${params.toString()}`
      );
      
      if (result.data?.transactions) {
        setTransactions(result.data.transactions);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [pagination.limit]);

  return { transactions, loading, error };
}

export function useClientTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      const result = await apiFetch<{ tickets: SupportTicket[] }>('/api/tickets');
      
      if (result.data?.tickets) {
        setTickets(result.data.tickets);
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  return { tickets, loading, error };
}

export function useClientMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const result = await apiFetch<{ messages: Message[] }>('/api/chat/messages');
      
      if (result.data?.messages) {
        setMessages(result.data.messages);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  return { messages, loading, error };
}

export function useClientAssets() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      const result = await apiFetch<{ assets: Asset[] }>('/api/assets');
      
      if (result.data?.assets) {
        setAssets(result.data.assets);
      }
      setLoading(false);
    };

    fetchAssets();
  }, []);

  return { assets, loading, error };
}

// ============================================
// ADMIN API HOOKS
// ============================================

export function useAdminStats() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const result = await apiFetch<Record<string, unknown>>('/api/admin/statistics');
      
      if (result.data) {
        setStats(result.data);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useAdminUsers(pagination: PaginationParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (pagination.limit) params.set('limit', String(pagination.limit));
      
      const result = await apiFetch<{ users: User[] }>(
        `/api/users?${params.toString()}`
      );
      
      if (result.data?.users) {
        setUsers(result.data.users);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [pagination.limit]);

  return { users, loading, error };
}

export function useAdminOrders(pagination: PaginationParams = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (pagination.limit) params.set('limit', String(pagination.limit));
      
      const result = await apiFetch<{ orders: Order[] }>(
        `/api/orders?${params.toString()}`
      );
      
      if (result.data?.orders) {
        setOrders(result.data.orders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [pagination.limit]);

  return { orders, loading, error };
}

export function useAdminReviews(pagination: PaginationParams = {}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const result = await apiFetch<{ reviews: Review[] }>('/api/admin/reviews');
      
      if (result.data?.reviews) {
        setReviews(result.data.reviews);
      }
      setLoading(false);
    };

    fetchReviews();
  }, []);

  return { reviews, loading, error };
}

// ============================================
// QA API HOOKS
// ============================================

export function useQATasks(pagination: PaginationParams = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (pagination.limit) params.set('limit', String(pagination.limit));
      
      const result = await apiFetch<{ tasks: Task[] }>(
        `/api/qa?${params.toString()}`
      );
      
      if (result.data?.tasks) {
        setTasks(result.data.tasks);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [pagination.limit]);

  return { tasks, loading, error };
}

// ============================================
// EDITOR API HOOKS
// ============================================

export function useEditorTasks(pagination: PaginationParams = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (pagination.limit) params.set('limit', String(pagination.limit));
      
      const result = await apiFetch<{ tasks: Task[] }>(
        `/api/tasks?status=IN_PROGRESS&${params.toString()}`
      );
      
      if (result.data?.tasks) {
        setTasks(result.data.tasks);
      }
      setLoading(false);
    };

    fetchTasks();
  }, [pagination.limit]);

  return { tasks, loading, error };
}

export function useEditorPayouts() {
  const [payouts, setPayouts] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      setLoading(true);
      const result = await apiFetch<{ transactions: Transaction[] }>(
        '/api/transactions?type=PAYOUT'
      );
      
      if (result.data?.transactions) {
        setPayouts(result.data.transactions);
      }
      setLoading(false);
    };

    fetchPayouts();
  }, []);

  return { payouts, loading, error };
}

// ============================================
// SHARED HOOKS
// ============================================

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const result = await apiFetch<{ services: Service[] }>('/api/services');
      
      if (result.data?.services) {
        setServices(result.data.services);
      }
      setLoading(false);
    };

    fetchServices();
  }, []);

  return { services, loading, error };
}

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const result = await apiFetch<{ user: User }>('/api/auth/me');
      
      if (result.data?.user) {
        setUser(result.data.user);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return { user, loading };
}

// ============================================
// TYPES (matching database/schema)
// ============================================

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'QA' | 'COMPLETED' | 'REVISION';
  createdAt: string;
  updatedAt: string;
  quantity?: number;
  priority?: string;
  price?: number;
  description?: string;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
  description?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
  messages?: { id: string; senderId: string; senderName: string; message: string; createdAt: string }[];
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface Asset {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  price: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
}

export default {
  useClientOrders,
  useClientTransactions,
  useClientTickets,
  useClientMessages,
  useClientAssets,
  useAdminStats,
  useAdminUsers,
  useAdminOrders,
  useAdminReviews,
  useQATasks,
  useEditorTasks,
  useEditorPayouts,
  useServices,
  useCurrentUser,
};