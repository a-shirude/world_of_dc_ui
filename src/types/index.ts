// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId?: string;
  mobileNumber?: string; // For citizens
  createdAt: string;
  updatedAt: string;
}

export interface Citizen {
  id: string;
  mobileNumber: string;
  name: string;
  email?: string;
  address?: string;
  aadharNumber?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  CUSTOMER = 'CUSTOMER',
  OFFICER = 'OFFICER',
  DISTRICT_COMMISSIONER = 'DISTRICT_COMMISSIONER',
  ADDITIONAL_DISTRICT_COMMISSIONER = 'ADDITIONAL_DISTRICT_COMMISSIONER',
  BLOCK_DEVELOPMENT_OFFICER = 'BLOCK_DEVELOPMENT_OFFICER',
  GRAM_PANCHAYAT_OFFICER = 'GRAM_PANCHAYAT_OFFICER'
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OfficerLoginCredentials {
  employeeId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Registration and OTP types for citizen signup flow
 
export interface RegisterData {
  mobileNumber: string;
  name: string;
  email?: string;
  address?: string;
  aadharNumber?: string;
}

// Officer types
export interface OfficerSignupData {
  employeeId: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: string;
  role: string;
  password: string;
}

export interface Officer {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OfficerUpdateData {
  name: string;
  email: string;
  mobileNumber: string;
  designation: string;
  department: string;
}

// Complaint Types
export interface Complaint {
  id: string;
  complaintNumber: string;
  citizenId: string;
  subject: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  location?: string;
  assignedToId?: string;
  assignedById?: string;
  assignmentRemarks?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  documents?: ComplaintDocument[];
  history?: ComplaintHistory[];
}

export interface ComplaintDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ComplaintHistory {
  id: string;
  complaintNumber: string;
  status: ComplaintStatus;
  remarks?: string;
  updatedBy: string;
  updatedAt: string;
}

export enum ComplaintCategory {
  WATER_SUPPLY = 'WATER_SUPPLY',
  ELECTRICITY = 'ELECTRICITY',
  ROADS_INFRASTRUCTURE = 'ROADS_INFRASTRUCTURE',
  HEALTH_SERVICES = 'HEALTH_SERVICES',
  EDUCATION = 'EDUCATION',
  SANITATION = 'SANITATION',
  PUBLIC_DISTRIBUTION_SYSTEM = 'PUBLIC_DISTRIBUTION_SYSTEM',
  REVENUE_SERVICES = 'REVENUE_SERVICES',
  POLICE_SERVICES = 'POLICE_SERVICES',
  CORRUPTION = 'CORRUPTION',
  ENVIRONMENTAL_ISSUES = 'ENVIRONMENTAL_ISSUES',
  AGRICULTURE = 'AGRICULTURE',
  PENSION_SERVICES = 'PENSION_SERVICES',
  BIRTH_DEATH_CERTIFICATE = 'BIRTH_DEATH_CERTIFICATE',
  OTHER = 'OTHER'
}

export enum ComplaintStatus {
  SUBMITTED = 'SUBMITTED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface CreateComplaintData {
  mobileNumber: string;
  subject: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  location?: string;
  files?: FileList;
}

export interface UpdateComplaintData {
  subject?: string;
  description?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assignedToId?: string;
  assignmentRemarks?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
