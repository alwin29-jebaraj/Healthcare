import React, { useState } from 'react';
import { User, Appointment, Prescription, MedicalReport, ChatMessage, AIConversation } from '../types';
import { 
  Heart, Activity, Thermometer, Brain, Sparkles, Send, Upload, Trash2, Calendar, FileText, Pill, 
  Syringe, ShieldAlert, HeartPulse, UserCheck, Video, Phone, MessageSquare, Clock, MapPin, Download, Save, RefreshCw, X
} from 'lucide-react';

interface PatientPortalProps {
  user: User;
  doctors: User[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  reports: MedicalReport[];
  onBookAppointment: (doctorId: string, date: string, time: string, reason: string) => Promise<void>;
  onCancelAppointment: (id: string) => Promise<void>;
  onUploadReport: (title: string, fileType: string, resultSummary: string) => Promise<void>;
  onAnalyzeReport: (id: string) => Promise<void>;
  onSendMessageToAI: (msg: string) => Promise<void>;
  aiConversations: AIConversation[];
  onClearAIHistory: () => void;
  chatMessages: ChatMessage[];
  onSendChatMessage: (doctorId: string, msg: string) => Promise<void>;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

export default function PatientPortal({
  user,
  doctors,
  appointments,
  prescriptions,
  reports,
  onBookAppointment,
  onCancelAppointment,
  onUploadReport,
  onAnalyzeReport,
  onSendMessageToAI,
  aiConversations,
  onClearAIHistory,
  chatMessages,
  onSendChatMessage,
  onUpdateProfile
}: PatientPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'booking' | 'ai_assistant' | 'reports' | 'prescriptions' | 'chat_doctor' | 'profile'>('overview');
  
  // States for forms
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookReason, setBookReason] = useState('');
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const [rptTitle, setRptTitle] = useState('');
  const [rptType, setRptType] = useState('Blood Test');
  const [rptSummary, setRptSummary] = useState('');
  const [isReportUploading, setIsReportUploading] = useState(false);
  const [analyzingReportId, setAnalyzingReportId] = useState<string | null>(null);

  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [activeDoctorChatId, setActiveDoctorChatId] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Profile Form States
  const [profName, setProfName] = useState(user.name);
  const [profPhone, setProfPhone] = useState(user.phone || '');
  const [profBlood, setProfBlood] = useState(user.bloodGroup || 'O+');
  const [profAddress, setProfAddress] = useState(user.address || '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Medicine Reminders Mock State
  const [medicines, setMedicines] = useState([
    { id: '1', name: 'Amlodipine 5mg', dosage: '1 tablet', time: '08:00 AM', completed: false },
    { id: '2', name: 'Atorvastatin 10mg', dosage: '1 tablet', time: '09:00 PM', completed: true },
    { id: '3', name: 'Multivitamins', dosage: '1 capsule', time: '01:00 PM', completed: false }
  ]);

  // Video Consultation simulation state
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [videoDoctor, setVideoDoctor] = useState<User | null>(null);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDoctorId || !bookDate || !bookTime || !bookReason) return;
    setIsBookingLoading(true);
    try {
      await onBookAppointment(bookDoctorId, bookDate, bookTime, bookReason);
      setBookDoctorId('');
      setBookDate('');
      setBookTime('');
      setBookReason('');
      setActiveTab('overview');
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleReportUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rptTitle || !rptSummary) return;
    setIsReportUploading(true);
    try {
      await onUploadReport(rptTitle, rptType, rptSummary);
      setRptTitle('');
      setRptSummary('');
    } finally {
      setIsReportUploading(false);
    }
  };

  const handleReportAnalysis = async (id: string) => {
    setAnalyzingReportId(id);
    try {
      await onAnalyzeReport(id);
    } finally {
      setAnalyzingReportId(null);
    }
  };

  const handleSendAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput('');
    setIsAiLoading(true);
    try {
      await onSendMessageToAI(msg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeDoctorChatId) return;
    const msg = chatInput;
    setChatInput('');
    await onSendChatMessage(activeDoctorChatId, msg);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      await onUpdateProfile({
        name: profName,
        phone: profPhone,
        bloodGroup: profBlood,
        address: profAddress
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const toggleMedicine = (id: string) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const startVideoConsult = (doc: User) => {
    setVideoDoctor(doc);
    setIsVideoActive(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Simulation Video Room modal */}
      {isVideoActive && videoDoctor && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400 animate-pulse" /> Live Telehealth Room
              </span>
              <button 
                onClick={() => setIsVideoActive(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="aspect-video bg-slate-950 relative flex flex-col items-center justify-center">
              <img 
                src={videoDoctor.avatar} 
                alt={videoDoctor.name} 
                className="w-24 h-24 rounded-full border-4 border-blue-500 shadow-md object-cover mb-3"
              />
              <p className="text-lg font-bold">{videoDoctor.name}</p>
              <p className="text-xs text-slate-400 font-mono tracking-wider">{videoDoctor.specialities?.join(', ')}</p>
              
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono font-bold text-blue-400 flex items-center gap-1.5 border border-blue-500/20">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                TELEHEALTH CONNECTION SECURE (1080P)
              </div>

              {/* Sub-camera view (Patient side) */}
              <div className="absolute bottom-4 right-4 w-28 aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold">You (Self-view)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 flex justify-center gap-4">
              <button 
                onClick={() => setIsVideoActive(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow"
              >
                End Consultation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                alt={user.name} 
                className="w-12 h-12 rounded-full border border-slate-200 object-cover"
              />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                  Patient Portal
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 font-mono">
              <div>Blood Group: <strong className="text-slate-800">{user.bloodGroup || 'Unset'}</strong></div>
              <div>Blood Sugar: <strong className="text-slate-800">Normal</strong></div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" /> Health Overview
            </button>
            
            <button
              onClick={() => setActiveTab('booking')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'booking' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </button>

            <button
              onClick={() => setActiveTab('ai_assistant')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'ai_assistant' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Brain className="w-4 h-4" /> AI Clinical Assistant
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'reports' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" /> Lab Reports & AI Analyzer
            </button>

            <button
              onClick={() => setActiveTab('prescriptions')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'prescriptions' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" /> Saved Prescriptions
            </button>

            <button
              onClick={() => setActiveTab('chat_doctor')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'chat_doctor' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Consult with Doctors
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Profile Workstation
            </button>
          </nav>

          <div className="bg-red-50 border border-red-100 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase font-mono">
              <ShieldAlert className="w-4 h-4 animate-bounce" /> Emergency Center
            </div>
            <p className="text-[11px] text-red-600 leading-normal">
              Need immediate help? Call the clinical team at <strong>+1 (800) 555-0199</strong> or tap below to summon help.
            </p>
            <button 
              onClick={() => alert('Sending live GPS coordinates to Emergency Medical Services.')}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer transition-all uppercase tracking-wider"
            >
              SOS Call Dispatch
            </button>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="md:col-span-3 space-y-6">
          
          {/* 1. HEALTH OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Heart Rate</p>
                    <p className="text-2xl font-bold text-slate-900">72 bpm</p>
                    <span className="text-[10px] text-blue-600 font-medium">Optimal Status</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">BP Level</p>
                    <p className="text-2xl font-bold text-slate-900">120/80</p>
                    <span className="text-[10px] text-blue-600 font-medium">Optimal Status</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-amber-50 text-amber-600 p-3 rounded-lg border border-amber-100">
                    <Thermometer className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Body Temp</p>
                    <p className="text-2xl font-bold text-slate-900">98.4 °F</p>
                    <span className="text-[10px] text-blue-600 font-medium">Optimal Status</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-purple-50 text-purple-600 p-3 rounded-lg border border-purple-100">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Blood Sugar</p>
                    <p className="text-2xl font-bold text-slate-900">95 mg/dL</p>
                    <span className="text-[10px] text-blue-600 font-medium">Optimal Status</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                
                {/* Medicine reminders card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Pill className="w-4 h-4 text-blue-500" /> Prescribed Daily Medications
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">TODAY</span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {medicines.map(m => (
                      <div 
                        key={m.id} 
                        className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                          m.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            checked={m.completed}
                            onChange={() => toggleMedicine(m.id)}
                            className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                          />
                          <div>
                            <p className={`text-xs font-semibold text-slate-800 ${m.completed ? 'line-through' : ''}`}>{m.name}</p>
                            <p className="text-[10px] text-slate-500">{m.dosage} — {m.time}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          m.completed ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {m.completed ? 'TAKEN' : 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vaccines card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Syringe className="w-4 h-4 text-blue-500" /> Vaccination & Immunization Schedules
                  </h3>
                  
                  <div className="space-y-2.5 font-mono text-[11px]">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-sans font-bold text-slate-800">Covid-19 Booster v4</p>
                        <p className="text-slate-500 text-[10px]">Last Immunization: March 12, 22</p>
                      </div>
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded uppercase border border-blue-100">IMMUNE</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-sans font-bold text-slate-800">Influenza (Flu Shot)</p>
                        <p className="text-slate-500 text-[10px]">Next Scheduled: Oct 15, 26</p>
                      </div>
                      <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded uppercase border border-amber-100">UPCOMING</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appointments Log inside Overview */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" /> Consultations & Appointments Status
                </h3>

                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">You have no booked appointments. Click "Book Appointment" to find a physician.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase font-bold">
                          <th className="pb-2.5">Physician</th>
                          <th className="pb-2.5">Date & Time</th>
                          <th className="pb-2.5">Reason</th>
                          <th className="pb-2.5">Status</th>
                          <th className="pb-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50/50">
                            <td className="py-3 font-semibold text-slate-800">{a.doctorName}</td>
                            <td className="py-3 font-mono">{a.date} — {a.time}</td>
                            <td className="py-3 max-w-xs truncate">{a.reason}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                                a.status === 'accepted' ? 'bg-blue-50 text-blue-600' :
                                a.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                a.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {a.status === 'pending' && (
                                <button
                                  onClick={() => onCancelAppointment(a.id)}
                                  className="text-red-600 hover:text-red-800 font-bold cursor-pointer hover:underline"
                                >
                                  Cancel
                                </button>
                              )}
                              {a.status === 'accepted' && (
                                <span className="text-slate-400 text-[10px]">Confirmed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. BOOK APPOINTMENT PANEL */}
          {activeTab === 'booking' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Schedule a Clinical Consultation</h3>
                <p className="text-xs text-slate-500 mt-1">Select a verified specialist and choose your preferred slot.</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Specialist Doctor</label>
                    <select
                      value={bookDoctorId}
                      onChange={(e) => setBookDoctorId(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">-- Choose verified specialist --</option>
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name} — {d.specialities?.join(', ')} (Consultation fee: ${d.fees})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Date</label>
                      <input
                        type="date"
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Time</label>
                      <select
                        value={bookTime}
                        onChange={(e) => setBookTime(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">-- Slot --</option>
                        <option value="09:00 AM">09:00 AM</option>
                        <option value="10:00 AM">10:00 AM</option>
                        <option value="11:00 AM">11:00 AM</option>
                        <option value="02:00 PM">02:00 PM</option>
                        <option value="03:00 PM">03:00 PM</option>
                        <option value="04:00 PM">04:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Clinical Symptoms / Reasons for Consultation</label>
                  <textarea
                    rows={4}
                    value={bookReason}
                    onChange={(e) => setBookReason(e.target.value)}
                    required
                    placeholder="Describe your chest discomfort, breathing difficulties, cough or other physical parameters..."
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isBookingLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-3 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                  {isBookingLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Committing schedule...
                    </>
                  ) : (
                    'Confirm Consultation Booking'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* 3. AI HEALTH ASSISTANT PANEL */}
          {activeTab === 'ai_assistant' && (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[550px]">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm border border-blue-500/20">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Clinical Assistant Co-Pilot</h4>
                    <span className="block text-[9px] text-blue-700 font-mono font-bold tracking-widest uppercase">Powered by Gemini 3.5 Flash</span>
                  </div>
                </div>

                <button
                  onClick={onClearAIHistory}
                  className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear History
                </button>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 leading-normal">
                    <strong>Medical Disclaimer</strong>: Clinical feedback is provided as an informative co-pilot. For severe physical pain, sudden chest tightening, or breathing failures, please coordinate with emergency hospital support immediately.
                  </p>
                </div>

                {aiConversations.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-blue-400 mx-auto animate-pulse" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">How can I support your wellness today?</p>
                    <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                      Describe physical symptoms, ask about dietary modifications, understand clinical diseases, or request cholesterol action plans.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 font-sans text-xs">
                    {aiConversations.map(c => (
                      <div key={c.id} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-4 rounded-lg max-w-lg leading-relaxed ${
                          c.role === 'user' 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'bg-slate-50 border border-slate-200 text-slate-800 space-y-2 font-mono whitespace-pre-wrap'
                        }`}>
                          {c.message}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 font-mono text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> Analyzing metrics and formulating response...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendAi} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Enter medical symptoms, ask for diet tips..."
                  required
                  className="flex-1 border border-slate-200 bg-white rounded-lg px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* 4. LAB REPORTS & AI ANALYZER PANEL */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Upload Clinical Lab Findings</h3>
                  <p className="text-xs text-slate-500 mt-1">Upload blood markers, lipid indicators, thyroid scans, or general metabolic results.</p>
                </div>

                <form onSubmit={handleReportUpload} className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Report Title</label>
                      <input
                        type="text"
                        value={rptTitle}
                        onChange={(e) => setRptTitle(e.target.value)}
                        required
                        placeholder="e.g. Lipids Panel & Liver Enzymes"
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Test Category</label>
                      <select
                        value={rptType}
                        onChange={(e) => setRptType(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Blood Test">Complete Blood Count (CBC)</option>
                        <option value="Lipid Profile">Lipid & Cholesterol Profile</option>
                        <option value="Thyroid Scan">Thyroid Panel (TSH, T4)</option>
                        <option value="Metabolic Panel">Comprehensive Metabolic Panel (CMP)</option>
                        <option value="Cardio Check">Cardiovascular Markers</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Result Summary / Findings Transcript</label>
                    <textarea
                      rows={3}
                      value={rptSummary}
                      onChange={(e) => setRptSummary(e.target.value)}
                      required
                      placeholder="Input numbers, levels, or general findings text (e.g., LDL: 165 mg/dL, Total Cholesterol: 245 mg/dL, HbA1c: 5.6%)"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isReportUploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2 uppercase tracking-wide"
                  >
                    {isReportUploading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving report...
                      </>
                    ) : (
                      'Save to Health Records'
                    )}
                  </button>
                </form>
              </div>

              {/* Uploaded records list with AI analysis */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" /> Historic Medical & Lab Archives
                </h3>

                {reports.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">No laboratory reports uploaded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {reports.map(r => (
                      <div key={r.id} className="p-5 border border-slate-200 rounded-lg space-y-3.5 hover:border-blue-500 transition-all bg-slate-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold uppercase border border-blue-100">{r.fileType}</span>
                            <h4 className="font-bold text-slate-800 text-sm mt-1">{r.title}</h4>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">Recorded: {r.date} — File Ref: {r.id}</p>
                          </div>
                          
                          <button
                            onClick={() => handleReportAnalysis(r.id)}
                            disabled={analyzingReportId === r.id}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] px-3.5 py-2 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-center"
                          >
                            {analyzingReportId === r.id ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Clinical AI Parsing...
                              </>
                            ) : (
                              <>
                                <Brain className="w-3.5 h-3.5 text-blue-400" /> Explain Lab Report with AI
                              </>
                            )}
                          </button>
                        </div>

                        <div className="text-xs text-slate-600 bg-white p-3.5 rounded-lg border border-slate-200">
                          <p className="text-slate-400 font-mono text-[9px] uppercase font-bold mb-1">Lab Transcript findings:</p>
                          <p className="font-medium text-slate-800">{r.resultSummary}</p>
                        </div>

                        {r.aiExplanation && (
                          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 space-y-2">
                            <p className="text-blue-700 font-mono text-[9px] uppercase font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Co-Pilot Pathological Explanation:
                            </p>
                            <div className="text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                              {r.aiExplanation}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. SAVED PRESCRIPTIONS PANEL */}
          {activeTab === 'prescriptions' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Physician Digital Prescriptions</h3>
              <p className="text-xs text-slate-500">Official digital prescriptions issued by consulting doctors following clinical evaluations.</p>

              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No digital prescriptions saved to your profile yet.</p>
              ) : (
                <div className="space-y-6">
                  {prescriptions.map(p => (
                    <div key={p.id} className="p-6 border border-slate-200 rounded-lg shadow-sm hover:border-blue-500 transition-all bg-white relative overflow-hidden">
                      {/* Decorative sidebar color */}
                      <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600"></div>
                      
                      <div className="flex justify-between items-start border-b border-slate-200 pb-4 ml-2">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Prescription Form</h4>
                          <p className="text-[10px] text-slate-400 font-mono">Date Issued: {p.date} — Form ID: {p.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 text-xs">{p.doctorName}</p>
                          <p className="text-[9px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono font-bold inline-block mt-0.5 border border-blue-100">VERIFIED PRACTITIONER</p>
                        </div>
                      </div>

                      <div className="mt-4 ml-2 space-y-4">
                        <div className="space-y-2.5">
                          <p className="text-[10px] font-mono text-slate-400 uppercase font-bold">Medicines & Dosages:</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {p.medicines.map((med, index) => (
                              <div key={index} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                                <p className="font-bold text-xs text-slate-800">{med.name}</p>
                                <p className="text-[10px] text-slate-600 font-mono">Dosage: {med.dosage}</p>
                                <p className="text-[10px] text-slate-500 font-mono">Schedule: {med.frequency}</p>
                                <p className="text-[9px] text-slate-400 font-mono">Duration: {med.duration}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {p.notes && (
                          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
                            <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wide text-[10px]">Clinical Instructions & Notes:</span>
                            <p className="text-slate-600 leading-relaxed font-sans">{p.notes}</p>
                          </div>
                        )}

                        {p.doctorSignature && (
                          <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-mono">Physician Digital Signature Code: <strong>{p.id.toUpperCase()}</strong></span>
                            <div className="text-right">
                              <p className="font-sans italic text-slate-800 font-semibold">{p.doctorSignature}</p>
                              <p className="text-[9px] text-slate-400 font-mono">MD Registration Council</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. CONSULT WITH DOCTORS PANEL */}
          {activeTab === 'chat_doctor' && (
            <div className="grid md:grid-cols-3 gap-6">
              
              {/* Doctor List */}
              <div className="md:col-span-1 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  <UserCheck className="w-4 h-4 text-blue-500" /> Active Physicians
                </h4>
                
                <div className="space-y-2">
                  {doctors.length === 0 ? (
                    <p className="text-xs text-slate-500">No verified doctors available in the system currently.</p>
                  ) : (
                    doctors.map(doc => (
                      <div 
                        key={doc.id}
                        onClick={() => {
                          setActiveDoctorChatId(doc.id);
                        }}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          activeDoctorChatId === doc.id ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-slate-100" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                            <p className="text-[9px] text-slate-500 font-mono">{doc.specialities?.join(', ')}</p>
                          </div>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-sm animate-pulse shrink-0"></span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat room */}
              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
                {activeDoctorChatId ? (
                  <>
                    {(() => {
                      const activeDoc = doctors.find(d => d.id === activeDoctorChatId);
                      const activeMessages = chatMessages.filter(m => 
                        (m.doctorId === activeDoctorChatId && m.patientId === user.id)
                      );

                      if (!activeDoc) return <div className="p-6 text-center text-xs text-slate-500">Select a physician to begin tele-consultation.</div>;

                      return (
                        <>
                          {/* Chat Header */}
                          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={activeDoc.avatar} alt={activeDoc.name} className="w-9 h-9 rounded-full object-cover" />
                              <div>
                                <h4 className="font-bold text-slate-800 text-xs">{activeDoc.name}</h4>
                                <span className="block text-[9px] text-blue-600 font-mono font-bold uppercase">Ready for consultation</span>
                              </div>
                            </div>

                            <button
                              onClick={() => startVideoConsult(activeDoc)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 uppercase tracking-wide"
                            >
                              <Video className="w-3.5 h-3.5" /> Start Video
                            </button>
                          </div>

                          {/* Chat Messages */}
                          <div className="flex-1 p-6 overflow-y-auto space-y-3 font-sans text-xs">
                            {activeMessages.length === 0 ? (
                              <p className="text-center py-16 text-slate-400 text-[11px]">No diagnostic text messages yet. Send a query to Dr. {activeDoc.name.split(' ').pop()}.</p>
                            ) : (
                              activeMessages.map(m => (
                                <div key={m.id} className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`p-3 rounded-lg max-w-sm ${
                                    m.senderId === user.id ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-800 border border-slate-100'
                                  }`}>
                                    <p className="leading-relaxed">{m.message}</p>
                                    <span className="block text-[8px] opacity-70 text-right mt-1 font-mono">
                                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Chat Input */}
                          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={`Type diagnostic query to ${activeDoc.name}...`}
                              required
                              className="flex-1 border border-slate-200 bg-white rounded-lg px-4 py-3 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                            <button
                              type="submit"
                              disabled={!chatInput.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg cursor-pointer transition-all disabled:opacity-50"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </form>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                    <MessageSquare className="w-10 h-10 text-blue-300 animate-bounce" />
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Select a Physician</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      Consult with Board-verified hospital specialists over secure peer-to-peer text chat or instantly boot up an interactive telehealth video call.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. PROFILE WORKSTATION PANEL */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Personal Demographic Card</h3>
                <p className="text-xs text-slate-500 mt-1">Manage physical parameters, emergency location addresses, and phone contacts.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      value={profName}
                      onChange={(e) => setProfName(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
                    <select
                      value={profBlood}
                      onChange={(e) => setProfBlood(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="A+">A Positive (A+)</option>
                      <option value="A-">A Negative (A-)</option>
                      <option value="B+">B Positive (B+)</option>
                      <option value="B-">B Negative (B-)</option>
                      <option value="AB+">AB Positive (AB+)</option>
                      <option value="AB-">AB Negative (AB-)</option>
                      <option value="O+">O Positive (O+)</option>
                      <option value="O-">O Negative (O-)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Home Address (Emergency dispatch locus)</label>
                    <input
                      type="text"
                      value={profAddress}
                      onChange={(e) => setProfAddress(e.target.value)}
                      placeholder="Street, City, State, ZIP"
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                  {isProfileSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Profile Details
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
