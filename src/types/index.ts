export interface Provider {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  bio?: string;
  category: "Electrician" | "Plumber" | "Tutor" | "Carpenter" | "Mechanic";
  location: string;
  address?: string;
  hourlyRate?: number;
  experience?: number;
  services?: string[];
  workingHours?: {
    start: string;
    end: string;
    days: string[];
  };
  isVerified: boolean;
  rating?: number;
  totalReviews?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "provider" | "admin";
}

export interface Lead {
  _id: string;
  providerId: string;
  type: "call" | "whatsapp";
  timestamp: string;
}

export interface Booking {
  _id: string;
  providerId: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
