import api from './api';
import { LoginCredentials, AuthResponse, User, RegisterData } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/refresh');
    return response.data;
  },

  // Send OTP to mobile number (create otp)
  async sendOtp(mobileNumber: string): Promise<void> {
    await api.post('/citizen/send-otp', { mobileNumber });
  },
  // Verify OTP for a mobile number
  async verifyOtp(mobileNumber: string, otp: string): Promise<void> {
    await api.post('/citizen/verify-otp', { mobileNumber, otp });
  },
  // Register a citizen after OTP verification
  async register(data: RegisterData): Promise<void> {
    await api.post('/citizen/register', data);
  },
};
