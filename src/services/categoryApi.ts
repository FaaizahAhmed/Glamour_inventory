const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_BASE_URL}/categories`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.data;
};

export const createCategory = async (category: CreateCategoryData): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to create category');
  }
  const data = await response.json();
  return data.data;
};

export const updateCategory = async (id: string, category: Partial<CreateCategoryData>): Promise<Category> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(category),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to update category');
  }
  const data = await response.json();
  return data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to delete category');
  }
};
