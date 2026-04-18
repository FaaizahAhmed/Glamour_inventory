const API_BASE_URL = 'http://localhost:5000/api';

const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface InventoryItem {
  _id?: string;
  name: string;
  brand?: string;
  category: { _id: string; name: string; color: string; icon: string } | string;
  sku?: string;
  quantity: number;
  min_stock_level?: number;
  unit_price: number;
  total_value?: number;
  supplier?: { _id: string; name: string; contact_person?: string; email?: string } | string | null;
  createdBy?: {
    _id: string;
    name: string;
    username: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch inventory items');
  return data.data;
};

export const fetchInventoryItem = async (id: string): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch inventory item');
  return data.data;
};

export const createInventoryItem = async (item: Omit<InventoryItem, '_id'>): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to create inventory item');
  return data.data;
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(item),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to update inventory item');
  return data.data;
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete inventory item');
  }
};

export const fetchDashboardStats = async (): Promise<{
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  uniqueItems: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/inventory/stats/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dashboard stats');
  return data.data;
};
