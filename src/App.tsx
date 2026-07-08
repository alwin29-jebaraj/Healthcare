import React, { useState, useEffect } from 'react';
import { User, Appointment, Prescription, MedicalReport, ChatMessage, AIConversation, ActivityLog } from './types';
import LandingPage from './components/LandingPage';
import RoleSwitcher from './components/RoleSwitcher';
import PatientPortal from './components/PatientPortal';
import DoctorPortal from './components/DoctorPortal';
import AdminPortal from './components/AdminPortal';
import { HeartPulse, LogOut, Loader2, Sparkles, AlertCircle, CheckCircle, X } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('healthcare_token'));
  const [user, setUser] = useState<User | null>(null);
  
  // Modals / Overlays
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'patient' | 'doctor'>('patient');
  const [regPhone, setRegPhone] = useState('');
  const [regSpeciality, setRegSpeciality] = useState('General Medicine');
  const [regBio, setRegBio] = useState('');
  const [regFees, setRegFees] = useState('100');

  // Application Data States
  const [doctors, setDoctors] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [aiConversations, setAiConversations] = useState<AIConversation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Admin Data States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [adminStats, setAdminStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    appointmentsStatus: { pending: 0, accepted: 0, completed: 0, cancelled: 0 }
  });
  const [adminLogs, setAdminLogs] = useState<ActivityLog[]>([]);

  // Page Load / Loading state
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [sysAlert, setSysAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Auto-fetch current session on mount
  useEffect(() => {
    if (token) {
      fetchSession();
    } else {
      setIsInitialLoad(false);
    }
  }, [token]);

  // Synchronize dynamic dashboards data whenever user role is updated
  useEffect(() => {
    if (user) {
      syncDashboardData();
    }
  }, [user]);

  // Alert dismisser
  const showAlert = (type: 'success' | 'error', message: string) => {
    setSysAlert({ type, message });
    setTimeout(() => {
      setSysAlert(null);
    }, 4500);
  };

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Clear stale session
        handleLogout();
      }
    } catch (err) {
      console.error('Session validation failed:', err);
    } finally {
      setIsInitialLoad(false);
    }
  };

  const syncDashboardData = async () => {
    if (!token || !user) return;
    try {
      // 1. Fetch common appointments and prescriptions
      const [aptRes, prcRes] = await Promise.all([
        fetch('/api/appointments', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/prescriptions', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (aptRes.ok) {
        const aptData = await aptRes.json();
        setAppointments(aptData.appointments);
      }
      if (prcRes.ok) {
        const prcData = await prcRes.json();
        setPrescriptions(prcData.prescriptions);
      }

      // 2. Fetch role-specific catalogs
      if (user.role === 'patient') {
        const [docRes, rptRes, aiRes] = await Promise.all([
          fetch('/api/doctors'),
          fetch('/api/reports', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/ai/history', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (docRes.ok) {
          const docData = await docRes.json();
          setDoctors(docData.doctors);
        }
        if (rptRes.ok) {
          const rptData = await rptRes.json();
          setReports(rptData.reports);
        }
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiConversations(aiData.conversations);
        }

        // Fetch peer-to-peer chats for patient
        const appointmentsList: Appointment[] = await aptRes.json().then(d => d.appointments).catch(() => []);
        const connectedDoctors = Array.from(new Set(appointmentsList.map(a => a.doctorId)));
        if (connectedDoctors.length > 0) {
          const messagesPromises = connectedDoctors.map(docId => 
            fetch(`/api/chats?doctorId=${docId}&patientId=${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : { messages: [] })
          );
          const results = await Promise.all(messagesPromises);
          const combinedMessages = results.flatMap(r => r.messages);
          setChatMessages(combinedMessages);
        }

      } else if (user.role === 'doctor') {
        const [rptRes] = await Promise.all([
          fetch('/api/reports', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (rptRes.ok) {
          const rptData = await rptRes.json();
          setReports(rptData.reports);
        }

        // Fetch chat logs associated with doctor
        const apts = appointments;
        const patientIds = Array.from(new Set(apts.map(a => a.patientId)));
        if (patientIds.length > 0) {
          const chatPromises = patientIds.map(patId => 
            fetch(`/api/chats?doctorId=${user.id}&patientId=${patId}`, { headers: { 'Authorization': `Bearer ${token}` } })
              .then(r => r.ok ? r.json() : { messages: [] })
          );
          const results = await Promise.all(chatPromises);
          setChatMessages(results.flatMap(r => r.messages));
        }

      } else if (user.role === 'admin') {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setAdminStats(statsData.stats);
          setAdminLogs(statsData.logs);
        }
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setAllUsers(usersData.users);
        }
      }

    } catch (err) {
      console.error('Failed to sync clinical workspace databases:', err);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('healthcare_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowLogin(false);
        setAuthEmail('');
        setAuthPassword('');
        showAlert('success', 'Logged in successfully! Welcome to your workstation.');
      } else {
        setAuthError(data.error || 'Login credentials failed. Check and retry.');
      }
    } catch (err) {
      setAuthError('Connection error contacting healthcare backend server.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        phone: regPhone,
        specialities: regRole === 'doctor' ? [regSpeciality] : undefined,
        bio: regRole === 'doctor' ? regBio : undefined,
        fees: regRole === 'doctor' ? regFees : undefined
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Registration successful! Please log in below.');
        setShowRegister(false);
        setShowLogin(true);
        setAuthEmail(regEmail);
        setAuthPassword(regPassword);
        
        // Reset state
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegPhone('');
        setRegBio('');
      } else {
        setAuthError(data.error || 'Registration failed. Try other credentials.');
      }
    } catch (err) {
      setAuthError('Error communicating with clinical server registrations.');
    }
  };

  const handleQuickDemoLogin = async (email: string, role: string) => {
    setAuthError(null);
    const passwordMap: Record<string, string> = {
      'patient@healthcare.com': 'patient123',
      'doctor@healthcare.com': 'doctor123',
      'admin@healthcare.com': 'admin123'
    };
    const password = passwordMap[email] || 'doctor123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('healthcare_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setShowLogin(false);
        setShowRegister(false);
        showAlert('success', `Logged in automatically as ${data.user.name} (${role.toUpperCase()}).`);
      } else {
        showAlert('error', data.error || 'Demo login session initialization failed.');
      }
    } catch (err) {
      showAlert('error', 'Server down. Unable to login.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('healthcare_token');
    setToken(null);
    setUser(null);
    setDoctors([]);
    setAppointments([]);
    setPrescriptions([]);
    setReports([]);
    setAiConversations([]);
    setChatMessages([]);
    showAlert('success', 'Logged out of clinical workstations safely.');
  };

  // Appointments
  const handleBookAppointment = async (doctorId: string, date: string, time: string, reason: string) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ doctorId, date, time, reason })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Consultation booked successfully! Waiting for physician approval.');
        syncDashboardData();
      } else {
        showAlert('error', data.error || 'Failed to submit booking.');
      }
    } catch (err) {
      showAlert('error', 'Network failure booking consultation.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (res.ok) {
        showAlert('success', 'Consultation has been cancelled.');
        syncDashboardData();
      } else {
        showAlert('error', 'Failed to cancel appointment.');
      }
    } catch (err) {
      showAlert('error', 'Network error.');
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showAlert('success', `Appointment set to status: ${status.toUpperCase()}`);
        syncDashboardData();
      } else {
        showAlert('error', 'Failed to update consultation status.');
      }
    } catch (err) {
      showAlert('error', 'Network error updating consultation status.');
    }
  };

  // Prescriptions
  const handleWritePrescription = async (appointmentId: string, patientId: string, medicines: Prescription['medicines'], notes: string) => {
    try {
      const res = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId, patientId, medicines, notes })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', 'Digital prescription issued and case closed successfully.');
        syncDashboardData();
      } else {
        showAlert('error', data.error || 'Failed to dispatch prescription.');
      }
    } catch (err) {
      showAlert('error', 'Network failure.');
    }
  };

  // Lab Reports
  const handleUploadReport = async (title: string, fileType: string, resultSummary: string) => {
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, fileType, resultSummary })
      });
      if (res.ok) {
        showAlert('success', 'Lab findings and biochemical numbers saved to clinical databases.');
        syncDashboardData();
      } else {
        showAlert('error', 'Failed to upload reports.');
      }
    } catch (err) {
      showAlert('error', 'Network error uploading report.');
    }
  };

  const handleAnalyzeReport = async (reportId: string) => {
    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reportId })
      });
      if (res.ok) {
        showAlert('success', 'Pathology analysis parsed by Clinical AI successfully.');
        syncDashboardData();
      } else {
        showAlert('error', 'Clinical AI was unable to parse reports.');
      }
    } catch (err) {
      showAlert('error', 'AI network parsing offline.');
    }
  };

  // AI Assistant Chatbot
  const handleSendMessageToAI = async (message: string) => {
    // Optimistic patient update
    const tempId = Math.random().toString();
    setAiConversations(prev => [...prev, { id: tempId, userId: user!.id, role: 'user', message, timestamp: new Date().toISOString() }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      if (res.ok) {
        const data = await res.json();
        // Append model response
        setAiConversations(prev => prev.filter(c => c.id !== tempId).concat([
          { id: Math.random().toString(), userId: user!.id, role: 'user', message, timestamp: new Date().toISOString() },
          data.message
        ]));
      } else {
        showAlert('error', 'AI Assistant was unable to process message.');
      }
    } catch (err) {
      showAlert('error', 'AI Server offline.');
    }
  };

  const handleClearAIHistory = async () => {
    try {
      const res = await fetch('/api/ai/history', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAiConversations([]);
        showAlert('success', 'AI Conversation history successfully wiped.');
      }
    } catch (err) {
      showAlert('error', 'Wipe failed.');
    }
  };

  // Peer-to-Peer messaging
  const handleSendChatMessage = async (targetId: string, message: string) => {
    if (!user) return;
    const isDoc = user.role === 'doctor';
    const patientId = isDoc ? targetId : user.id;
    const doctorId = isDoc ? user.id : targetId;

    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patientId, doctorId, message })
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
      }
    } catch (err) {
      showAlert('error', 'Chat messaging offline.');
    }
  };

  // Update Profile
  const handleUpdateProfile = async (updates: Partial<User>) => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        showAlert('success', 'Profile information updated successfully!');
      }
    } catch (err) {
      showAlert('error', 'Failed to save profile.');
    }
  };

  // Admin verifies doctor
  const handleVerifyDoctor = async (doctorId: string, verify: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${doctorId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ verify })
      });
      const data = await res.json();
      if (res.ok) {
        showAlert('success', `Physician verification updated successfully.`);
        syncDashboardData();
      } else {
        showAlert('error', 'Failed to verify doctor credentials.');
      }
    } catch (err) {
      showAlert('error', 'Network error verifying credentials.');
    }
  };

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-500 font-mono text-xs">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="font-sans font-bold text-slate-800 uppercase tracking-wider">Verifying Clinical Workstation Credentials...</p>
        <p className="mt-1">Connecting to HIPAA-compliant local secure storage</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dev role Switcher */}
      <RoleSwitcher 
        onQuickLogin={handleQuickDemoLogin}
        currentRole={user?.role}
        currentUserName={user?.name}
      />

      {/* Global Alerts Indicator */}
      {sysAlert && (
        <div className="fixed top-20 right-6 z-50">
          <div className={`flex items-center gap-2.5 px-4.5 py-3 rounded-lg shadow-md border text-xs font-semibold ${
            sysAlert.type === 'success' 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {sysAlert.type === 'success' ? <CheckCircle className="w-4 h-4 text-blue-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{sysAlert.message}</span>
          </div>
        </div>
      )}

      {/* Main navigation header when logged in */}
      {user && (
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-[48px] z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 tracking-tight text-sm uppercase">Health AI</span>
                <span className="block text-[8px] text-blue-600 font-mono font-bold tracking-widest uppercase">Workspace Management</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 hover:bg-slate-100 px-3.5 py-2 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-400" /> Disconnect Workspace
            </button>
          </div>
        </header>
      )}

      {/* 1. PORTALS FOR LOGGED IN USERS */}
      {user ? (
        <>
          {user.role === 'patient' && (
            <PatientPortal
              user={user}
              doctors={doctors}
              appointments={appointments}
              prescriptions={prescriptions}
              reports={reports}
              onBookAppointment={handleBookAppointment}
              onCancelAppointment={handleCancelAppointment}
              onUploadReport={handleUploadReport}
              onAnalyzeReport={handleAnalyzeReport}
              onSendMessageToAI={handleSendMessageToAI}
              aiConversations={aiConversations}
              onClearAIHistory={handleClearAIHistory}
              chatMessages={chatMessages}
              onSendChatMessage={handleSendChatMessage}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {user.role === 'doctor' && (
            <DoctorPortal
              user={user}
              appointments={appointments}
              prescriptions={prescriptions}
              reports={reports}
              chatMessages={chatMessages}
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              onWritePrescription={handleWritePrescription}
              onSendChatMessage={handleSendChatMessage}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {user.role === 'admin' && (
            <AdminPortal
              user={user}
              users={allUsers}
              stats={adminStats}
              logs={adminLogs}
              onVerifyDoctor={handleVerifyDoctor}
            />
          )}
        </>
      ) : (
        /* 2. LANDING PAGE FOR GUESTS */
        <LandingPage 
          onLoginClick={() => {
            setAuthError(null);
            setShowLogin(true);
          }}
          onRegisterClick={() => {
            setAuthError(null);
            setShowRegister(true);
          }}
        />
      )}

      {/* Login Overlay Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-md p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowLogin(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg w-12 h-12 mx-auto flex items-center justify-center border border-blue-100">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wide">Sign In to Workstation</h3>
              <p className="text-xs text-slate-500">Access patient logs, doctor availability, or hospital parameters.</p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs font-semibold text-slate-600">
              <div>
                <label className="block mb-1.5 text-slate-500">Clinical Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="e.g. physician@healthcare.com"
                  className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-slate-500">Workspace Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg cursor-pointer shadow-sm transition-all text-xs uppercase tracking-wide"
              >
                Establish Secure Session
              </button>

              <p className="text-center text-slate-500 text-[11px] font-normal pt-2">
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                  }}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Register Here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Register Overlay Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-lg p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 scrollbar-thin max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRegister(false)} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg w-12 h-12 mx-auto flex items-center justify-center border border-blue-100">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 uppercase tracking-wide">Create Healthcare Account</h3>
              <p className="text-xs text-slate-500">Sign up to coordinate appointments and utilize smart pathological AI tools.</p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-xs font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-slate-500">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Alwin Jebaraj"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500">Clinical Role Type</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as 'patient' | 'doctor')}
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                  >
                    <option value="patient">Patient seeking consultation</option>
                    <option value="doctor">Medical Practitioner / Specialist</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-500">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@healthcare.com"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-500">Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1 text-slate-500">Workspace Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                  />
                </div>
              </div>

              {regRole === 'doctor' && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Professional Practitioner Details</p>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-500">Primary Specialty</label>
                      <select
                        value={regSpeciality}
                        onChange={(e) => setRegSpeciality(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
                      >
                        <option value="Cardiologist">Cardiologist</option>
                        <option value="Pediatrician">Pediatrician</option>
                        <option value="Dermatologist">Dermatologist</option>
                        <option value="Neurologist">Neurologist</option>
                        <option value="General Practitioner">General Practitioner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-500">Consultation Fee ($)</label>
                      <input
                        type="number"
                        value={regFees}
                        onChange={(e) => setRegFees(e.target.value)}
                        className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-500">Bio & Credentials Overview</label>
                    <textarea
                      rows={2}
                      value={regBio}
                      onChange={(e) => setRegBio(e.target.value)}
                      placeholder="Specialist medical background, licensing reference..."
                      className="w-full border border-slate-200 bg-white rounded-lg px-4 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none font-normal"
                    ></textarea>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg cursor-pointer shadow-sm transition-all text-xs uppercase tracking-wide"
              >
                Register Medical Account
              </button>

              <p className="text-center text-slate-500 text-[11px] font-normal pt-2">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                  }}
                  className="text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  Log In Here
                </button>
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

