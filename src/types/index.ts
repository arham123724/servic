export interface Provider {
  _id: string;
  name: string;
  phone: string;
  bio?: string;
  category: "Electrician" | "Plumber" | "Tutor" | "Carpenter" | "Mechanic";
  location: string;
  isVerified: boolean;
  createdAt: string;
}

export interface Lead {
  _id: string;
  providerId: string;
  type: "call" | "whatsapp";
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
