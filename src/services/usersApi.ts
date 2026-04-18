const API_BASE = 'http://localhost:5000/api';

function getToken(): string {
  return localStorage.getItem('auth_token') || '';
}

export interface UserRecord {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'moderator';
}

export async function fetchUsers(): Promise<UserRecord[]> {
  const res = await fetch(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch users');
  return data.data;
}

export async function createUser(payload: CreateUserData): Promise<UserRecord> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to create user');
  return data.data;
}

export async function updateUser(
  id: string,
  payload: { name?: string; email?: string; role?: 'admin' | 'moderator' }
): Promise<UserRecord> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to update user');
  return data.data;
}

export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to reset password');
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to delete user');
}
