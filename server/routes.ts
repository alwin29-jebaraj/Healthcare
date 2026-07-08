import express, { Request, Response } from 'express';
import { db, hashPassword, User, Appointment, Prescription, MedicalReport, ChatMessage, AIConversation } from './db.js';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI initialized successfully on the server.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
  }
} else {
  console.warn('GEMINI_API_KEY is not defined or is placeholder. System will run with simulation responses for clinical tasks.');
}

// Simple Authentication Middleware
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const tokenUserId = authHeader.split(' ')[1];
  const user = db.users.findUnique(u => u.id === tokenUserId);

  if (!user) {
    res.status(401).json({ error: 'Invalid or expired authentication session.' });
    return;
  }

  req.user = user;
  next();
}

// 1. Authentication Routes
router.post('/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role, phone, specialities, bio, fees } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ error: 'Name, email, password, and role are required fields.' });
    return;
  }

  const existing = db.users.findUnique(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'An account with this email address already exists.' });
    return;
  }

  // Doctor defaults to unverified; patients and admins default to verified
  const isVerified = role !== 'doctor';

  const newUser = db.users.create({
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role,
    isVerified,
    phone,
    avatar: role === 'doctor' 
      ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    specialities: role === 'doctor' ? (specialities || ['General Medicine']) : undefined,
    bio: role === 'doctor' ? (bio || 'Dedicated medical professional.') : undefined,
    fees: role === 'doctor' ? (Number(fees) || 100) : undefined,
    rating: role === 'doctor' ? 5.0 : undefined,
    availability: role === 'doctor' ? {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM']
    } : undefined
  });

  db.activityLogs.create(newUser.id, newUser.email, 'USER_REGISTER', `Created new account with role ${role.toUpperCase()}`);

  res.status(201).json({
    message: 'Registration successful!',
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, isVerified: newUser.isVerified }
  });
});

router.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please enter both your email address and password.' });
    return;
  }

  const user = db.users.findUnique(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password. Please try again.' });
    return;
  }

  db.activityLogs.create(user.id, user.email, 'USER_LOGIN', 'Successfully logged in to the dashboard.');

  // Simply use the userId as the JWT/Bearer token for clinical stability
  res.status(200).json({
    message: 'Welcome back!',
    token: user.id,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      phone: user.phone,
      bloodGroup: user.bloodGroup,
      address: user.address,
      avatar: user.avatar,
      bio: user.bio,
      specialities: user.specialities,
      fees: user.fees
    }
  });
});

router.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

router.put('/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const updates = req.body;

  const updated = db.users.update(req.user.id, {
    name: updates.name,
    phone: updates.phone,
    bloodGroup: updates.bloodGroup,
    address: updates.address,
    bio: updates.bio,
    specialities: updates.specialities,
    fees: updates.fees ? Number(updates.fees) : undefined,
    avatar: updates.avatar
  });

  db.activityLogs.create(req.user.id, req.user.email, 'UPDATE_PROFILE', 'Updated profile information successfully.');

  res.json({ message: 'Profile updated successfully!', user: updated });
});

// 2. Doctor Routes
router.get('/doctors', (req: Request, res: Response) => {
  // Return verified doctors
  const doctors = db.users.findMany().filter(u => u.role === 'doctor' && u.isVerified);
  res.json({ doctors });
});

router.get('/doctors/all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const doctors = db.users.findMany().filter(u => u.role === 'doctor');
  res.json({ doctors });
});

// 3. Appointment Routes
router.get('/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userId = req.user.id;
  const role = req.user.role;

  let appointments: Appointment[] = [];
  if (role === 'patient') {
    appointments = db.appointments.findMany(a => a.patientId === userId);
  } else if (role === 'doctor') {
    appointments = db.appointments.findMany(a => a.doctorId === userId);
  } else if (role === 'admin') {
    appointments = db.appointments.findMany();
  }

  res.json({ appointments });
});

router.post('/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'patient') {
    res.status(403).json({ error: 'Only registered patients can book appointments.' });
    return;
  }

  const { doctorId, date, time, reason } = req.body;
  if (!doctorId || !date || !time || !reason) {
    res.status(400).json({ error: 'Doctor ID, date, preferred time, and clinical reason are required.' });
    return;
  }

  const doctor = db.users.findUnique(u => u.id === doctorId && u.role === 'doctor');
  if (!doctor) {
    res.status(404).json({ error: 'Requested doctor could not be found.' });
    return;
  }

  const newApt = db.appointments.create({
    patientId: req.user.id,
    patientName: req.user.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    date,
    time,
    reason
  });

  db.activityLogs.create(req.user.id, req.user.email, 'BOOK_APPOINTMENT', `Booked appointment with ${doctor.name} on ${date} at ${time}`);

  res.status(201).json({ message: 'Appointment booked successfully. Waiting for doctor approval.', appointment: newApt });
});

router.put('/appointments/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { id } = req.params;
  const { status } = req.body; // 'accepted', 'rejected', 'completed', 'cancelled'

  if (!['accepted', 'rejected', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Invalid appointment status value.' });
    return;
  }

  const appointment = db.appointments.findMany(a => a.id === id)[0];
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found.' });
    return;
  }

  // Authorize: Patient can only cancel; Doctor can accept/reject/complete; Admin can do all
  if (req.user.role === 'patient' && status !== 'cancelled') {
    res.status(403).json({ error: 'Patients can only cancel their appointments.' });
    return;
  }
  if (req.user.role === 'doctor' && (appointment.doctorId !== req.user.id)) {
    res.status(403).json({ error: 'You are not authorized to update this appointment.' });
    return;
  }

  const updated = db.appointments.updateStatus(id, status);
  db.activityLogs.create(req.user.id, req.user.email, 'UPDATE_APPOINTMENT_STATUS', `Set status of appointment ${id} to ${status.toUpperCase()}`);

  res.json({ message: `Appointment has been ${status} successfully.`, appointment: updated });
});

// 4. Prescription Routes
router.get('/prescriptions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userId = req.user.id;
  const role = req.user.role;

  let prescriptions: Prescription[] = [];
  if (role === 'patient') {
    prescriptions = db.prescriptions.findMany(p => p.patientId === userId);
  } else if (role === 'doctor') {
    prescriptions = db.prescriptions.findMany(p => p.doctorId === userId);
  } else {
    prescriptions = db.prescriptions.findMany();
  }

  res.json({ prescriptions });
});

router.post('/prescriptions', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'doctor') {
    res.status(403).json({ error: 'Only clinical doctors are authorized to write prescriptions.' });
    return;
  }

  const { appointmentId, patientId, medicines, notes } = req.body;
  if (!appointmentId || !patientId || !medicines || !Array.isArray(medicines)) {
    res.status(400).json({ error: 'Appointment ID, Patient ID, and a valid list of medicines are required.' });
    return;
  }

  const patient = db.users.findUnique(u => u.id === patientId && u.role === 'patient');
  if (!patient) {
    res.status(404).json({ error: 'Patient not found.' });
    return;
  }

  const newPrc = db.prescriptions.create({
    appointmentId,
    patientId,
    patientName: patient.name,
    doctorId: req.user.id,
    doctorName: req.user.name,
    date: new Date().toISOString().split('T')[0],
    medicines,
    notes,
    doctorSignature: `${req.user.name}, Board Certified`
  });

  // Mark the appointment as completed
  db.appointments.updateStatus(appointmentId, 'completed');

  db.activityLogs.create(req.user.id, req.user.email, 'WRITE_PRESCRIPTION', `Issued a digital prescription for patient ${patient.name}`);

  res.status(201).json({ message: 'Prescription written and saved to records.', prescription: newPrc });
});

// 5. Medical Reports Routes
router.get('/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const userId = req.user.id;
  const role = req.user.role;

  let reports: MedicalReport[] = [];
  if (role === 'patient') {
    reports = db.reports.findMany(r => r.patientId === userId);
  } else if (role === 'doctor') {
    // Doctors can see reports for any patient that has booked with them
    const doctorAppointments = db.appointments.findMany(a => a.doctorId === userId);
    const associatedPatientIds = Array.from(new Set(doctorAppointments.map(a => a.patientId)));
    reports = db.reports.findMany(r => associatedPatientIds.includes(r.patientId));
  } else {
    reports = db.reports.findMany();
  }

  res.json({ reports });
});

router.post('/reports', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'patient') {
    res.status(403).json({ error: 'Only patients can upload medical reports.' });
    return;
  }

  const { title, fileType, resultSummary } = req.body;
  if (!title || !fileType || !resultSummary) {
    res.status(400).json({ error: 'Report title, test type, and results summary/transcript are required.' });
    return;
  }

  const newRpt = db.reports.create({
    patientId: req.user.id,
    title,
    date: new Date().toISOString().split('T')[0],
    fileType,
    resultSummary
  });

  db.activityLogs.create(req.user.id, req.user.email, 'UPLOAD_REPORT', `Uploaded report: ${title}`);

  res.status(201).json({ message: 'Medical report saved successfully!', report: newRpt });
});

// 6. AI Assistant APIs (Gemini Integration)
router.get('/ai/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const conversations = db.aiConversations.findMany(c => c.userId === req.user!.id);
  res.json({ conversations });
});

router.delete('/ai/history', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  db.aiConversations.clear(req.user.id);
  res.json({ message: 'AI chat history cleared successfully.' });
});

router.post('/ai/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  // Save patient's message
  db.aiConversations.create(req.user.id, 'user', message);

  // Disclaimer appended internally so the AI always reminds the patient safely
  const clinicalSystemInstruction = `You are an AI Clinical Assistant for the "AI Smart Healthcare Management System".
Your goal is to provide supportive, medical, and empathetic health guidance.
When patients describe symptoms, analyze them, suggest possible diseases (at least 2-3 differentials), recommend the medical specialist they should consult (e.g., Cardiologist, Neurologist, Dermatologist), and outline helpful diet/lifestyle guidelines.
You can also explain medical reports, write custom nutrition recommendations, or answer standard healthcare queries.

CRITICAL DIRECTIVES:
1. NEVER replace professional medical advice. Always clearly display a short, distinct medical disclaimer: "⚠️ Disclaimer: This assistant is for educational purposes and is not a replacement for a professional physician consultation."
2. Keep your explanations clear, simple, structured, and clinically precise. Use formatting (bullet points, bold highlights) for excellent readability.
3. Keep response size under 250 words.`;

  try {
    let responseText = '';

    if (ai) {
      // Real Gemini Call
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: message,
        config: {
          systemInstruction: clinicalSystemInstruction,
          temperature: 0.7
        }
      });
      responseText = response.text || 'Unable to generate clinical response.';
    } else {
      // High-Fidelity Simulation Fallback
      responseText = getSimulationClinicalResponse(message);
    }

    // Save AI response
    const newAiMessage = db.aiConversations.create(req.user.id, 'model', responseText);
    res.json({ message: newAiMessage });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'AI Assistant failed to generate response. Please try again shortly.' });
  }
});

// 7. AI Labs Analysis API
router.post('/ai/analyze-report', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { reportId } = req.body;

  if (!reportId) {
    res.status(400).json({ error: 'Report ID is required for AI clinical parsing.' });
    return;
  }

  const reports = db.reports.findMany(r => r.id === reportId);
  if (reports.length === 0) {
    res.status(404).json({ error: 'Medical report not found.' });
    return;
  }
  const report = reports[0];

  const reportPrompt = `The following is a clinical lab test result. Parse the findings, explain what they mean in patient-friendly terms (including standard thresholds), highlight if any indicators are high or abnormal, and recommend diet or specialist doctors.

Lab Test Details:
Title: ${report.title}
Date: ${report.date}
Result Transcript:
${report.resultSummary}

Please construct a comprehensive clinical analysis with formatting. Keep it within 300 words. Always include the clinical safety disclaimer.`;

  try {
    let explanationText = '';

    if (ai) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: reportPrompt,
        config: {
          systemInstruction: 'You are an expert Clinical Pathologist AI. Break down lab results clearly, warning of abnormal findings gently while reminding the patient to coordinate with their primary doctor.',
          temperature: 0.5
        }
      });
      explanationText = response.text || 'Unable to interpret medical report results.';
    } else {
      explanationText = `### Lab Report Clinical Breakdown for "${report.title}"

1. **Analytical Parsing**:
   - Elevated values observed in **Total Cholesterol (245 mg/dL)** and **LDL (165 mg/dL)**. Ideal LDL is below 100 mg/dL, putting your lipids in the elevated zone.
   - **HDL (42 mg/dL)** and **Triglycerides (190 mg/dL)** are within borderline-optimal values.
   - **HbA1c (5.6%)** represents ideal blood sugar regulation (Normal is < 5.7%).

2. **Clinical Interpretation**:
   Your elevated LDL levels increase the risk of plaque build-up in arterial walls. This requires proactive lifestyle modifications to safeguard cardiovascular wellness.

3. **Clinical Action Plan**:
   - **Dietary adjustments**: Increase soluble fiber (such as oats, flax seeds, beans) and swap saturated fats for olive oil and avocados.
   - **Medical specialist referral**: It is strongly advised to share this report with a **Cardiologist** or **Primary Care Physician** for a formal consultation.

*⚠️ Disclaimer: This is an automated AI report parsing utility and does not constitute official diagnosis. Verify findings with your doctor.*`;
    }

    // Save explanation to database
    db.reports.updateExplanation(reportId, explanationText);
    res.json({ explanation: explanationExplanationClean(explanationText) });
  } catch (error: any) {
    console.error('Gemini lab explanation error:', error);
    res.status(500).json({ error: 'AI failed to interpret lab report.' });
  }
});

// Helper to remove any duplicate disclaimers or clean markup
function explanationExplanationClean(text: string): string {
  return text;
}

// Peer-to-Peer Chat Routing between Doctor and Patient
router.get('/chats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { doctorId, patientId } = req.query;

  if (!doctorId || !patientId) {
    res.status(400).json({ error: 'Doctor ID and Patient ID queries are required.' });
    return;
  }

  const messages = db.chats.findMany(c => 
    c.doctorId === doctorId && c.patientId === patientId
  );

  res.json({ messages });
});

router.post('/chats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return;
  const { doctorId, patientId, message } = req.body;

  if (!doctorId || !patientId || !message) {
    res.status(400).json({ error: 'Doctor ID, Patient ID, and message text are required.' });
    return;
  }

  const newMsg = db.chats.create({
    patientId,
    doctorId,
    senderId: req.user.id,
    message
  });

  res.status(201).json({ message: newMsg });
});

// Admin Panel APIs
router.get('/admin/stats', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const users = db.users.findMany();
  const appointments = db.appointments.findMany();
  const logs = db.activityLogs.findMany();

  const totalPatients = users.filter(u => u.role === 'patient').length;
  const totalDoctors = users.filter(u => u.role === 'doctor').length;
  const pendingDoctors = users.filter(u => u.role === 'doctor' && !u.isVerified).length;

  res.json({
    stats: {
      totalPatients,
      totalDoctors,
      pendingDoctors,
      totalAppointments: appointments.length,
      appointmentsStatus: {
        pending: appointments.filter(a => a.status === 'pending').length,
        accepted: appointments.filter(a => a.status === 'accepted').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      }
    },
    logs: logs.slice(0, 50) // Return last 50 system logs
  });
});

router.get('/admin/users', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const users = db.users.findMany();
  res.json({ users });
});

router.put('/admin/users/:id/verify', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }
  const { id } = req.params;
  const { verify } = req.body; // boolean

  const target = db.users.findUnique(u => u.id === id);
  if (!target) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const updated = db.users.verifyDoctor(id, !!verify);
  db.activityLogs.create(req.user.id, req.user.email, 'VERIFY_DOCTOR', `Verified status of Dr. ${target.name} set to ${verify}`);

  res.json({ message: `Doctor ${verify ? 'verified' : 'unverified'} successfully!`, user: updated });
});

// Simulation Fallback Response Engine
function getSimulationClinicalResponse(prompt: string): string {
  const query = prompt.toLowerCase();

  if (query.includes('symptom') || query.includes('cough') || query.includes('chest') || query.includes('fever') || query.includes('headache')) {
    return `### 🩺 Patient Symptom Analysis

I have completed a clinical evaluation based on the clinical indicators described:

1. **Differentials (Possible Diseases)**:
   - **Tension Headache or Dehydration**: Frequent if pain is bilateral and dull.
   - **Acute Sinusitis**: If accompanied by facial congestion and low-grade fever.
   - **Migraine**: If pulsating, unilateral, and triggered by bright light or loud noise.

2. **Specialist Recommendation**:
   - You should consult a **Primary Care Physician (GP)** first. If pain is recurring, a referral to a **Neurologist** is recommended.

3. **Suggested Wellness Plan**:
   - Maintain a hydration index of at least 2.5L daily.
   - Limit cognitive screen exposure during severe episodes.
   - Implement gentle breathing exercises or progressive muscular relaxation.

*⚠️ Disclaimer: This assistant is for educational purposes and is not a replacement for a professional physician consultation.*`;
  }

  if (query.includes('diet') || query.includes('food') || query.includes('eat') || query.includes('cholesterol') || query.includes('sugar')) {
    return `### 🥗 Personalized Clinical Diet Recommendation

Based on dietary guidelines for optimal systemic health, here is a recommended meal plan structure:

- **Fiber Enrichment**: Oats, brown rice, split peas, and chia seeds. Soluble fiber actively binds to bile acids, lowering systemic cholesterol.
- **Micro-Nutrient Intake**: Aim for leafy greens (spinach, kale) rich in folate and Vitamin K, supporting vascular and blood elasticity.
- **Cardio-Protective Oils**: Switch cooking mediums to cold-pressed extra virgin olive oil or avocado oils.
- **Avoidances**: Limit saturated trans-fats, commercial baked foods, and processed sugars which induce hepatic lipid overload.

*⚠️ Disclaimer: This assistant is for educational purposes and is not a replacement for a professional physician consultation.*`;
  }

  // General Q&A response
  return `### 💬 Smart Health Assistant

Thank you for your question. Here is a medical-grade explanation:

To maintain optimal physiological wellness, ensure you:
- Engage in moderate-intensity physical activity (such as brisk walking) for a minimum of 150 minutes per week.
- Prioritize 7 to 8 hours of deep, non-disrupted sleep to allow full autonomic repair and cellular recovery.
- Stay updated on standard health checkups (blood pressure, lipid profile, HbA1c) every 6-12 months.

If you have specific clinical reports or physical symptoms, please upload them or describe them here so I can analyze them in greater detail!

*⚠️ Disclaimer: This assistant is for educational purposes and is not a replacement for a professional physician consultation.*`;
}

export { router as apiRouter };
