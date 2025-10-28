import api from './api';
import { 
  Complaint, 
  CreateComplaintData, 
  UpdateComplaintData, 
  PaginatedResponse,
  ComplaintStatus,
  ComplaintPriority,
  ComplaintCategory,
  ApiResponse,
  ComplaintHistory,
  ComplaintDocument
} from '../types';

export const complaintService = {
  async getComplaints(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Complaint>> {
    const response = await api.get<PaginatedResponse<Complaint>>(`/complaints?page=${page}&limit=${limit}`);
    return response.data;
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const response = await api.get<Complaint>(`/complaints/${id}`);
    return response.data;
  },

  async createComplaint(data: FormData): Promise<ApiResponse<{ complaintNumber: string; complaintId: string; status: string }>> {
    const response = await api.post<ApiResponse<{ complaintNumber: string; complaintId: string; status: string }>>('/complaints/create', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateComplaint(id: string, data: UpdateComplaintData): Promise<Complaint> {
    const response = await api.put<Complaint>(`/complaints/${id}`, data);
    return response.data;
  },

  async deleteComplaint(id: string): Promise<void> {
    await api.delete(`/complaints/${id}`);
  },

  async getComplaintsByCitizen(mobileNumber: string): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints/citizen/${mobileNumber}`);
    return response.data.data;
  },

  async trackComplaint(complaintNumber: string): Promise<ApiResponse<{ complaint: Complaint; history: ComplaintHistory[]; documents: ComplaintDocument[] }>> {
    const response = await api.get<ApiResponse<{ complaint: Complaint; history: ComplaintHistory[]; documents: ComplaintDocument[] }>>(`/complaints/track/${complaintNumber}`);
    return response.data;
  },

  async getComplaintsByOfficer(officerId: string): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints?createdBy=${officerId}`);
    return response.data.data;
  },

  async getMyComplaints(): Promise<Complaint[]> {
    // This will automatically use the current officer's ID from the backend
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints');
    return response.data.data;
  },

  async getComplaintsByStatus(status: ComplaintStatus): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints?status=${status}`);
    return response.data.data;
  },

  async getComplaintsByCategory(category: ComplaintCategory): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>(`/complaints?category=${category}`);
    return response.data.data;
  },

  async getAllComplaints(): Promise<Complaint[]> {
    const response = await api.get<ApiResponse<Complaint[]>>('/complaints');
    return response.data.data;
  },
};
