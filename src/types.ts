export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  isVerified: boolean;
  avatar?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  specialities?: string[];
  bio?: string;
  fees?: number;
  rating?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes?: string;
  doctorSignature?: string;
  createdAt: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  title: string;
  date: string;
  fileType: string;
  resultSummary: string;
  aiExplanation?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  patientId: string;
  doctorId: string;
  senderId: string;
  message: string;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  role: 'user' | 'model';
  message: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}
