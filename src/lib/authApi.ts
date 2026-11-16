import type { DemoUser, OtpPurpose, ResendServiceStatus, UserAddress } from '../types/store';

export interface SendOtpPayload {
  email: string;
  purpose: OtpPurpose;
  fullName?: string;
  phone?: string;
  password?: string;
}

export interface SendOtpResponse {
  sent: boolean;
  provider: 'resend' | 'sandbox-preview';
  emailId?: string;
  previewCode?: string;
  cooldownSeconds: number;
  warning?: string;
}

export interface AuthResponse {
  authenticated: boolean;
  user: DemoUser | null;
}

export interface AuthStatusResponse extends ResendServiceStatus {
  authenticated: boolean;
  user: DemoUser | null;
}

const rawApiBase = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';
export const API_BASE_URL = rawApiBase.replace(/\/+$/, '');

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildApiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data.error || `خطای سرور (${res.status})`);
  }
  return data;
}

export const authApi = {
  async getStatus(): Promise<AuthStatusResponse> {
    return requestJson<AuthStatusResponse>('/api/auth/status');
  },

  async getMe(): Promise<AuthResponse> {
    return requestJson<AuthResponse>('/api/auth/me');
  },

  async sendOtp(payload: SendOtpPayload): Promise<SendOtpResponse> {
    return requestJson<SendOtpResponse>('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async verifyOtp(payload: {
    email: string;
    purpose: OtpPurpose;
    code: string;
    newPassword?: string;
  }): Promise<AuthResponse> {
    return requestJson<AuthResponse>('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async loginWithPassword(payload: { email: string; password: string }): Promise<AuthResponse> {
    return requestJson<AuthResponse>('/api/auth/login-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async logout(allDevices = false): Promise<void> {
    await requestJson<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ allDevices }),
    });
  },

  async updateProfile(payload: {
    fullName: string;
    phone: string;
    nationalId?: string;
    birthDate?: string;
    newsletterOptIn?: boolean;
  }): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  async changePassword(payload: {
    currentPassword?: string;
    newPassword: string;
  }): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async addAddress(payload: Omit<UserAddress, 'id'>): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>('/api/auth/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async updateAddress(id: string, payload: Omit<UserAddress, 'id'>): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>(`/api/auth/addresses/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  async setDefaultAddress(id: string): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>(`/api/auth/addresses/${encodeURIComponent(id)}/default`, {
      method: 'POST',
    });
  },

  async deleteAddress(id: string): Promise<{ user: DemoUser }> {
    return requestJson<{ user: DemoUser }>(`/api/auth/addresses/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async notifyOrderPlaced(payload: {
    orderCode: string;
    totalFormatted: string;
    itemsCount: number;
  }): Promise<void> {
    await fetch(buildApiUrl('/api/orders/notify'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  },
};
