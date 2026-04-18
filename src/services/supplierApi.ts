const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface Supplier {
  _id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSupplierData {
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export const fetchSuppliers = async (): Promise<Supplier[]> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch suppliers');
  const data = await response.json();
  return data.data;
};

export const createSupplier = async (supplier: CreateSupplierData): Promise<Supplier> => {
  const response = await fetch(`${API_BASE_URL}/suppliers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create supplier');
  }
  const data = await response.json();
  return data.data;
};

export const updateSupplier = async (id: string, supplier: Partial<CreateSupplierData>): Promise<Supplier> => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(supplier),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update supplier');
  }
  const data = await response.json();
  return data.data;
};

export const deleteSupplier = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete supplier');
  }
};
