import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Types representing MERN / MongoDB Collections
export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'patient' | 'doctor' | 'admin';
  isVerified: boolean;
  createdAt: string;
  avatar?: string;
  phone?: string;
  bloodGroup?: string;
  address?: string;
  specialities?: string[];
  bio?: string;
  fees?: number;
  rating?: number;
  availability?: {
    days: string[]; // ['Monday', 'Wednesday']
    slots: string[]; // ['09:00 AM', '10:00 AM']
  };
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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  users: User[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  reports: MedicalReport[];
  chats: ChatMessage[];
  aiConversations: AIConversation[];
  activityLogs: ActivityLog[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr_admin',
      name: 'Dr. Sarah Sterling (Admin)',
      email: 'admin@healthcare.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      isVerified: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 019-2834',
      address: 'Central Admin Office, Block A'
    },
    {
      id: 'usr_doc1',
      name: 'Dr. Alexander Mercer',
      email: 'doctor@healthcare.com',
      passwordHash: hashPassword('doctor123'),
      role: 'doctor',
      isVerified: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 392-1049',
      bloodGroup: 'O+',
      address: 'Suite 402, Cardiological Wing',
      specialities: ['Cardiologist', 'Internal Medicine'],
      bio: 'Board-certified cardiologist with over 12 years of experience specializing in preventive cardiology and cardiovascular diagnostics.',
      fees: 150,
      rating: 4.9,
      availability: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
      }
    },
    {
      id: 'usr_doc2',
      name: 'Dr. Elizabeth Vance',
      email: 'elizabeth.vance@healthcare.com',
      passwordHash: hashPassword('doctor123'),
      role: 'doctor',
      isVerified: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 482-9011',
      bloodGroup: 'A-',
      address: 'Suite 105, Pediatrics Wing',
      specialities: ['Pediatrician', 'Family Medicine'],
      bio: 'Dedicated family pediatrician focused on child development, immunizations, and comprehensive adolescent healthcare.',
      fees: 120,
      rating: 4.8,
      availability: {
        days: ['Monday', 'Wednesday', 'Friday'],
        slots: ['10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM']
      }
    },
    {
      id: 'usr_doc3',
      name: 'Dr. Marcus Vance (Pending)',
      email: 'marcus.vance@healthcare.com',
      passwordHash: hashPassword('doctor123'),
      role: 'doctor',
      isVerified: false,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 723-4522',
      specialities: ['Dermatologist'],
      bio: 'Experienced clinical dermatologist focusing on acne therapy, skin cancer screenings, and micro-graphic surgeries.',
      fees: 130,
      rating: 4.5,
      availability: {
        days: ['Tuesday', 'Thursday'],
        slots: ['09:00 AM', '10:30 AM', '02:00 PM']
      }
    },
    {
      id: 'usr_pat1',
      name: 'Alwin Jebaraj',
      email: 'patient@healthcare.com',
      passwordHash: hashPassword('patient123'),
      role: 'patient',
      isVerified: true,
      createdAt: new Date().toISOString(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      phone: '+1 (555) 987-6543',
      bloodGroup: 'B+',
      address: '742 Evergreen Terrace, Springfield'
    }
  ],
  appointments: [
    {
      id: 'apt_1',
      patientId: 'usr_pat1',
      patientName: 'Alwin Jebaraj',
      doctorId: 'usr_doc1',
      doctorName: 'Dr. Alexander Mercer',
      date: '2026-07-10',
      time: '10:00 AM',
      reason: 'Chronic chest discomfort and slight fatigue during cardio exercises.',
      status: 'accepted',
      createdAt: new Date().toISOString()
    }
  ],
  prescriptions: [
    {
      id: 'prc_1',
      appointmentId: 'apt_1',
      patientId: 'usr_pat1',
      patientName: 'Alwin Jebaraj',
      doctorId: 'usr_doc1',
      doctorName: 'Dr. Alexander Mercer',
      date: '2026-07-01',
      medicines: [
        {
          name: 'Amlodipine 5mg',
          dosage: '1 tablet',
          frequency: 'Once daily (Morning)',
          duration: '30 days'
        },
        {
          name: 'Coenzyme Q10 100mg',
          dosage: '1 capsule',
          frequency: 'Once daily with meals',
          duration: '60 days'
        }
      ],
      notes: 'Please monitor blood pressure daily at home. Avoid high caffeine intake and do not perform extreme cardio exercises until we receive the complete lab test reports.',
      doctorSignature: 'Dr. Alexander Mercer, MD',
      createdAt: new Date().toISOString()
    }
  ],
  reports: [
    {
      id: 'rpt_1',
      patientId: 'usr_pat1',
      title: 'Complete Blood Count (CBC) & Lipid Profile',
      date: '2026-07-02',
      fileType: 'Blood Test',
      resultSummary: 'Cholesterol: 245 mg/dL (High), LDL: 165 mg/dL (High), HDL: 42 mg/dL (Normal), Triglycerides: 190 mg/dL (Borderline High), HbA1c: 5.6% (Normal), WBC count: 7,200/mcL (Normal).',
      aiExplanation: 'The Complete Blood Count (CBC) is within perfect clinical limits, indicating no signs of anemia or active infection. However, your Lipid Profile indicates mild Hypercholesterolemia. Specifically, LDL (the bad cholesterol) is elevated, and Total Cholesterol is high. It is recommended to lower saturated fat intake, increase dietary fiber (oats, leafy greens), and consult Dr. Mercer regarding lifestyle adjustments or potential low-dose statin therapy.',
      createdAt: new Date().toISOString()
    }
  ],
  chats: [
    {
      id: 'msg_1',
      patientId: 'usr_pat1',
      doctorId: 'usr_doc1',
      senderId: 'usr_doc1',
      message: 'Hello Alwin, how have you been feeling since starting the amlodipine?',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'msg_2',
      patientId: 'usr_pat1',
      doctorId: 'usr_doc1',
      senderId: 'usr_pat1',
      message: 'Hello doctor, the chest discomfort has decreased, but I felt a bit dizzy on the first two mornings.',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'msg_3',
      patientId: 'usr_pat1',
      doctorId: 'usr_doc1',
      senderId: 'usr_doc1',
      message: 'Mild morning dizziness can happen during the first few days as your body adapts to lower blood pressure. Let us discuss this further in our next appointment or video consult.',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  aiConversations: [
    {
      id: 'aic_1',
      userId: 'usr_pat1',
      role: 'user',
      message: 'What are some heart-healthy foods I can include in my diet to lower LDL cholesterol?',
      timestamp: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 'aic_2',
      userId: 'usr_pat1',
      role: 'model',
      message: `Diet plays a crucial role in managing LDL ("bad") cholesterol. Here are several scientifically backed heart-healthy foods you can integrate into your meals:

1. **Oatmeal & Oat Bran**: Contain soluble fiber, which reduces the absorption of cholesterol into your bloodstream.
2. **Nuts (Almonds & Walnuts)**: High in polyunsaturated fatty acids and phytosterols which actively support arterial elasticity and health.
3. **Fatty Fish (Salmon, Mackerel)**: Rich in Omega-3 fatty acids, which reduce blood pressure and triglycerides.
4. **Olive Oil**: Extra virgin olive oil is loaded with monounsaturated fats and antioxidants that lower LDL while keeping HDL ("good") cholesterol steady.
5. **Legumes & Beans**: Highly rich in soluble fiber and protein, keeping you full and lowering lipids.

*Disclaimer: This information is for educational purposes. Please coordinate diet plans with your healthcare provider or cardiologist.*`,
      timestamp: new Date(Date.now() - 3600000 * 3 + 10000).toISOString()
    }
  ],
  activityLogs: [
    {
      id: 'log_1',
      userId: 'usr_admin',
      userEmail: 'admin@healthcare.com',
      action: 'SYSTEM_STARTUP',
      details: 'Healthcare database initialized with seed clinical data successfully.',
      timestamp: new Date().toISOString()
    }
  ]
};

// Simple Password Hash Utility
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function initializeDb() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
  }
}

export function readDb(): DatabaseSchema {
  try {
    initializeDb();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, returning default schema:', err);
    return DEFAULT_DB;
  }
}

export function writeDb(data: DatabaseSchema): void {
  try {
    initializeDb();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to database file:', err);
  }
}

// Model-like Helpers
export const db = {
  users: {
    findMany: () => readDb().users,
    findUnique: (predicate: (u: User) => boolean) => readDb().users.find(predicate),
    create: (user: Omit<User, 'id' | 'createdAt'>) => {
      const store = readDb();
      const newUser: User = {
        ...user,
        id: `usr_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString()
      };
      store.users.push(newUser);
      writeDb(store);
      return newUser;
    },
    update: (id: string, updates: Partial<Omit<User, 'id' | 'createdAt' | 'email' | 'passwordHash' | 'role'>>) => {
      const store = readDb();
      const idx = store.users.findIndex(u => u.id === id);
      if (idx === -1) return null;
      store.users[idx] = { ...store.users[idx], ...updates };
      writeDb(store);
      return store.users[idx];
    },
    verifyDoctor: (id: string, verify: boolean) => {
      const store = readDb();
      const idx = store.users.findIndex(u => u.id === id && u.role === 'doctor');
      if (idx === -1) return null;
      store.users[idx].isVerified = verify;
      writeDb(store);
      return store.users[idx];
    }
  },
  appointments: {
    findMany: (predicate?: (a: Appointment) => boolean) => {
      const list = readDb().appointments;
      return predicate ? list.filter(predicate) : list;
    },
    create: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
      const store = readDb();
      const newApt: Appointment = {
        ...apt,
        id: `apt_${crypto.randomUUID().slice(0, 8)}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      store.appointments.push(newApt);
      writeDb(store);
      return newApt;
    },
    updateStatus: (id: string, status: Appointment['status']) => {
      const store = readDb();
      const idx = store.appointments.findIndex(a => a.id === id);
      if (idx === -1) return null;
      store.appointments[idx].status = status;
      writeDb(store);
      return store.appointments[idx];
    }
  },
  prescriptions: {
    findMany: (predicate?: (p: Prescription) => boolean) => {
      const list = readDb().prescriptions;
      return predicate ? list.filter(predicate) : list;
    },
    create: (prc: Omit<Prescription, 'id' | 'createdAt'>) => {
      const store = readDb();
      const newPrc: Prescription = {
        ...prc,
        id: `prc_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString()
      };
      store.prescriptions.push(newPrc);
      writeDb(store);
      return newPrc;
    }
  },
  reports: {
    findMany: (predicate?: (r: MedicalReport) => boolean) => {
      const list = readDb().reports;
      return predicate ? list.filter(predicate) : list;
    },
    create: (rpt: Omit<MedicalReport, 'id' | 'createdAt'>) => {
      const store = readDb();
      const newRpt: MedicalReport = {
        ...rpt,
        id: `rpt_${crypto.randomUUID().slice(0, 8)}`,
        createdAt: new Date().toISOString()
      };
      store.reports.push(newRpt);
      writeDb(store);
      return newRpt;
    },
    updateExplanation: (id: string, explanation: string) => {
      const store = readDb();
      const idx = store.reports.findIndex(r => r.id === id);
      if (idx === -1) return null;
      store.reports[idx].aiExplanation = explanation;
      writeDb(store);
      return store.reports[idx];
    }
  },
  chats: {
    findMany: (predicate?: (c: ChatMessage) => boolean) => {
      const list = readDb().chats;
      return predicate ? list.filter(predicate) : list;
    },
    create: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const store = readDb();
      const newMsg: ChatMessage = {
        ...msg,
        id: `msg_${crypto.randomUUID().slice(0, 8)}`,
        timestamp: new Date().toISOString()
      };
      store.chats.push(newMsg);
      writeDb(store);
      return newMsg;
    }
  },
  aiConversations: {
    findMany: (predicate?: (c: AIConversation) => boolean) => {
      const list = readDb().aiConversations;
      return predicate ? list.filter(predicate) : list;
    },
    create: (userId: string, role: 'user' | 'model', message: string) => {
      const store = readDb();
      const newConv: AIConversation = {
        id: `aic_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        role,
        message,
        timestamp: new Date().toISOString()
      };
      store.aiConversations.push(newConv);
      writeDb(store);
      return newConv;
    },
    clear: (userId: string) => {
      const store = readDb();
      store.aiConversations = store.aiConversations.filter(c => c.userId !== userId);
      writeDb(store);
    }
  },
  activityLogs: {
    findMany: () => readDb().activityLogs,
    create: (userId: string, userEmail: string, action: string, details: string) => {
      const store = readDb();
      const newLog: ActivityLog = {
        id: `log_${crypto.randomUUID().slice(0, 8)}`,
        userId,
        userEmail,
        action,
        details,
        timestamp: new Date().toISOString()
      };
      store.activityLogs.unshift(newLog); // latest log first
      if (store.activityLogs.length > 100) {
        store.activityLogs.pop(); // limit log capacity
      }
      writeDb(store);
      return newLog;
    }
  }
};
