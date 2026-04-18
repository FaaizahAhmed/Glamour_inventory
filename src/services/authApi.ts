import { User } from '../contexts/AuthContext';

const API_URL = 'http://localhost:5000/api/auth';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
  };
  error?: string;
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Login user
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Update user profile
export const updateProfile = async (data: UpdateProfileData): Promise<ProfileResponse> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update profile');
    }

    return result;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Logout failed');
    }

    return result;
  } catch (error) {
    throw error;
  }
};
