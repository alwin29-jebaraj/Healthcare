import React, { useState } from 'react';
import { User, Appointment, Prescription, MedicalReport, ChatMessage } from '../types';
import { 
  Stethoscope, Calendar, ClipboardList, Wallet, Sparkles, MessageSquare, Video, Send, 
  Check, X, Pill, FileText, UserCheck, ShieldAlert, Award, Star, RefreshCw, Save, Clock
} from 'lucide-react';

interface DoctorPortalProps {
  user: User;
  appointments: Appointment[];
  prescriptions: Prescription[];
  reports: MedicalReport[];
  chatMessages: ChatMessage[];
  onUpdateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  onWritePrescription: (appointmentId: string, patientId: string, medicines: Prescription['medicines'], notes: string) => Promise<void>;
  onSendChatMessage: (patientId: string, message: string) => Promise<void>;
  onUpdateProfile: (updates: Partial<User>) => Promise<void>;
}

export default function DoctorPortal({
  user,
  appointments,
  prescriptions,
  reports,
  chatMessages,
  onUpdateAppointmentStatus,
  onWritePrescription,
  onSendChatMessage,
  onUpdateProfile
}: DoctorPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'prescribe' | 'records' | 'chat' | 'profile'>('overview');
  
  // For prescribing
  const [prescribeAptId, setPrescribeAptId] = useState('');
  const [prescribePatId, setPrescribePatId] = useState('');
  const [prescribePatName, setPrescribePatName] = useState('');
  const [medsList, setMedsList] = useState<{ name: string; dosage: string; frequency: string; duration: string; }[]>([
    { name: '', dosage: '', frequency: '', duration: '' }
  ]);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isPrescribingLoading, setIsPrescribingLoading] = useState(false);

  // Profile states
  const [docName, setDocName] = useState(user.name);
  const [docBio, setDocBio] = useState(user.bio || '');
  const [docFees, setDocFees] = useState(user.fees || 100);
  const [docPhone, setDocPhone] = useState(user.phone || '');
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  // Peer Chat states
  const [activePatientChatId, setActivePatientChatId] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Video Consultation simulation
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [videoPatientName, setVideoPatientName] = useState('');

  const addMedRow = () => {
    setMedsList(prev => [...prev, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const removeMedRow = (idx: number) => {
    setMedsList(prev => prev.filter((_, i) => i !== idx));
  };

  const updateMedRow = (idx: number, field: string, val: string) => {
    setMedsList(prev => prev.map((med, i) => i === idx ? { ...med, [field]: val } : med));
  };

  const handleSendPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prescribeAptId || !prescribePatId) return;
    
    // Filter out empty rows
    const medicines = medsList.filter(m => m.name.trim() !== '');
    if (medicines.length === 0) {
      alert('Please include at least one medicine in the prescription form.');
      return;
    }

    setIsPrescribingLoading(true);
    try {
      await onWritePrescription(prescribeAptId, prescribePatId, medicines, prescriptionNotes);
      setPrescribeAptId('');
      setPrescribePatId('');
      setPrescribePatName('');
      setMedsList([{ name: '', dosage: '', frequency: '', duration: '' }]);
      setPrescriptionNotes('');
      setActiveTab('overview');
    } finally {
      setIsPrescribingLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activePatientChatId) return;
    const msg = chatInput;
    setChatInput('');
    await onSendChatMessage(activePatientChatId, msg);
  };

  const startPrescribing = (apt: Appointment) => {
    setPrescribeAptId(apt.id);
    setPrescribePatId(apt.patientId);
    setPrescribePatName(apt.patientName);
    setActiveTab('prescribe');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    try {
      await onUpdateProfile({
        name: docName,
        bio: docBio,
        fees: Number(docFees),
        phone: docPhone
      });
    } finally {
      setIsProfileSaving(false);
    }
  };

  const startVideoConsult = (patName: string) => {
    setVideoPatientName(patName);
    setIsVideoActive(true);
  };

  // Unique patient list for the Chat tab based on consultations
  const patientsInConsultation = Array.from(
    new Map(appointments.map(a => [a.patientId, { id: a.patientId, name: a.patientName }])).values()
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Simulation Video Room modal */}
      {isVideoActive && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-lg w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400 animate-pulse" /> Telehealth Video Consultation Locus
              </span>
              <button onClick={() => setIsVideoActive(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="aspect-video bg-slate-950 relative flex flex-col items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-cyan-500 shadow-md flex items-center justify-center mb-3">
                <span className="text-2xl font-bold font-sans text-cyan-400">{videoPatientName.charAt(0)}</span>
              </div>
              <p className="text-lg font-bold">{videoPatientName}</p>
              <p className="text-xs text-slate-400 font-mono tracking-wider">SECURE PATIENT TELEHEALTH DOWNLINK</p>
              
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 border border-cyan-500/20">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                MD SYMMETRIC DECRYPTION LIVE (1080P)
              </div>

              {/* Sub-camera view (Doctor side) */}
              <div className="absolute bottom-4 right-4 w-28 aspect-video bg-slate-800 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center shadow-lg">
                <span className="text-[10px] text-slate-400 font-bold">You (Clinician Feed)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 flex justify-center gap-4">
              <button 
                onClick={() => setIsVideoActive(false)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow"
              >
                Terminate Video Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verification Warning for doctors who are not verified yet */}
      {!user.isVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-start gap-3.5 mb-8">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900 uppercase tracking-wide">Verification Pending</h4>
            <p className="text-xs text-amber-700 mt-1">
              Your clinician profile is currently undergoing credential auditing by the Hospital Admin. You can review appointments, but writing prescriptions and hosting telehealth video channels will become active once your registration is verified.
            </p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-3">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-slate-200 object-cover" />
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{user.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-mono uppercase bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                    Doctor Portal
                  </span>
                  {user.isVerified && (
                    <span className="bg-blue-600 text-white rounded-full p-0.5" title="Verified Professional border border-blue-500/20">
                      <UserCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-2 text-xs text-slate-500 font-mono">
              <div className="flex items-center gap-1"><Award className="w-3.5 h-3.5 text-blue-500" /> Specialist</div>
              <div className="text-right text-slate-800 font-bold max-w-[80px] truncate">{user.specialities?.join(', ')}</div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'overview' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Doctor Workspace
            </button>

            <button
              onClick={() => setActiveTab('prescribe')}
              disabled={!user.isVerified}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                !user.isVerified ? 'opacity-55 cursor-not-allowed' : ''
              } ${
                activeTab === 'prescribe' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Pill className="w-4 h-4" /> Issue Prescription
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'records' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Patient Lab Records
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'chat' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Consultation Chat
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium text-sm transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Star className="w-4 h-4" /> Availability & Bio
            </button>
          </nav>
        </div>

        {/* Dynamic Panels */}
        <div className="md:col-span-3 space-y-6">
          
          {/* 1. DOCTOR WORKSPACE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Earnings & Cases Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Earnings Dashboard</p>
                    <p className="text-2xl font-bold text-slate-900">
                      ${prescriptions.filter(p => p.doctorId === user.id).length * (user.fees || 100)}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">Based on completed cases</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-50 text-blue-600 p-3 rounded-lg border border-blue-100">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Patients Handled</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {appointments.filter(a => a.status === 'completed').length}
                    </p>
                    <span className="text-[10px] text-blue-600 font-medium font-sans">Active Clinical Impact</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-amber-50 text-amber-50/80 p-3 rounded-lg border border-amber-100">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Practitioner Rating</p>
                    <p className="text-2xl font-bold text-slate-900">{user.rating || '4.9'}</p>
                    <span className="text-[10px] text-slate-500 font-mono">Patient review audit</span>
                  </div>
                </div>
              </div>

              {/* Consultation Scheduling Board */}
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Calendar className="w-4 h-4 text-blue-500" /> Active Patients Consultations Board
                </h3>

                {appointments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No appointment bookings have been routed to your portal yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase font-bold">
                          <th className="pb-2.5">Patient Demographic</th>
                          <th className="pb-2.5">Date & Time Slot</th>
                          <th className="pb-2.5">Clinical Indication</th>
                          <th className="pb-2.5">Current Status</th>
                          <th className="pb-2.5 text-right">Decisions / Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.map(a => (
                          <tr key={a.id} className="hover:bg-slate-50/30">
                            <td className="py-3 font-semibold text-slate-800">{a.patientName}</td>
                            <td className="py-3 font-mono">{a.date} at {a.time}</td>
                            <td className="py-3 max-w-xs truncate">{a.reason}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                                a.status === 'accepted' ? 'bg-blue-50 text-blue-600' :
                                a.status === 'completed' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                                a.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {a.status}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-1">
                              {a.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => onUpdateAppointmentStatus(a.id, 'accepted')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => onUpdateAppointmentStatus(a.id, 'rejected')}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-all uppercase tracking-wider"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}

                              {a.status === 'accepted' && (
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => startVideoConsult(a.patientName)}
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider"
                                  >
                                    <Video className="w-3 h-3" /> Telehealth Call
                                  </button>
                                  <button
                                    onClick={() => startPrescribing(a)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 transition-all uppercase tracking-wider"
                                  >
                                    <Pill className="w-3 h-3" /> Prescribe
                                  </button>
                                </div>
                              )}

                              {a.status === 'completed' && (
                                <span className="text-slate-400 text-[10px] font-mono">Case Closed</span>
                              )}
                              {a.status === 'cancelled' && (
                                <span className="text-red-400 text-[10px] font-mono">Cancelled</span>
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

          {/* 2. WRITE PRESCRIPTION PANEL */}
          {activeTab === 'prescribe' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Draft Digital Prescription</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Drafting prescription for Patient: <strong className="text-blue-600 font-bold">{prescribePatName || 'No patient selected'}</strong>
                </p>
              </div>

              {!prescribeAptId ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-xs font-semibold">Please select a patient from your "Doctor Workspace" dashboard, click "Prescribe", and the form will open here.</p>
                </div>
              ) : (
                <form onSubmit={handleSendPrescription} className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-600 uppercase font-mono tracking-wide">Prescription Formulation Matrix</span>
                      <button
                        type="button"
                        onClick={addMedRow}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                      >
                        + Add Medicine Row
                      </button>
                    </div>

                    {medsList.map((row, index) => (
                      <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 bg-slate-50 rounded-lg relative border border-slate-200">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Medicine Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Amlodipine 5mg"
                            value={row.name}
                            onChange={(e) => updateMedRow(index, 'name', e.target.value)}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Dosage Format</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 1 tablet"
                            value={row.dosage}
                            onChange={(e) => updateMedRow(index, 'dosage', e.target.value)}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">Schedule Frequency</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Once daily (Morning)"
                            value={row.frequency}
                            onChange={(e) => updateMedRow(index, 'frequency', e.target.value)}
                            className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Duration</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 30 days"
                              value={row.duration}
                              onChange={(e) => updateMedRow(index, 'duration', e.target.value)}
                              className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                            />
                          </div>
                          {medsList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeMedRow(index)}
                              className="text-red-600 hover:text-red-800 p-1.5 mt-5 cursor-pointer font-bold text-xs"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Special Dietary or Lifestyle Instructions</label>
                    <textarea
                      rows={3}
                      value={prescriptionNotes}
                      onChange={(e) => setPrescriptionNotes(e.target.value)}
                      placeholder="e.g. Rest, reduce sodium intake, monitor pulse rate daily at home before medication..."
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>

                  <div className="border-t border-slate-200 pt-4 flex justify-between items-center bg-slate-50/50 p-4 rounded-lg border">
                    <span className="text-[10px] font-mono text-slate-400">Practitioner Digitally Signing as: <strong>{user.name}</strong></span>
                    <button
                      type="submit"
                      disabled={isPrescribingLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-6 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2 uppercase tracking-wide"
                    >
                      {isPrescribingLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Signing...
                        </>
                      ) : (
                        'Dispatch Certified Prescription'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 3. PATIENT RECORDS REVIEW */}
          {activeTab === 'records' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-blue-500" /> Patient Laboratory History Database
              </h3>
              <p className="text-xs text-slate-500 mt-1">View diagnostic scans, complete blood panels, and pathoglogical explanations of registered hospital patients.</p>

              {reports.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">No patient clinical reports exist in the facility ledger.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map(r => (
                    <div key={r.id} className="p-4 border border-slate-200 rounded-lg space-y-3 bg-slate-50/30">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div>
                          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase border border-blue-100">{r.fileType}</span>
                          <h4 className="font-bold text-slate-800 text-xs mt-1">{r.title}</h4>
                          <p className="text-[9px] text-slate-400 font-mono">Recorded Date: {r.date} — Ref: {r.id}</p>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs font-mono">
                        <span className="text-slate-400 text-[9px] font-bold block mb-1">Lab findings transcript:</span>
                        <p className="text-slate-800 font-medium">{r.resultSummary}</p>
                      </div>

                      {r.aiExplanation && (
                        <div className="bg-blue-50/40 p-3.5 rounded-lg border border-blue-100 space-y-1 text-xs">
                          <span className="text-blue-700 font-bold block font-mono text-[9px] uppercase">Pathological Co-pilot Analysis:</span>
                          <p className="text-slate-700 font-mono leading-relaxed whitespace-pre-wrap">{r.aiExplanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. CONSULTATION CHAT PANEL */}
          {activeTab === 'chat' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide">
                  Active Patients
                </h4>
                
                <div className="space-y-2">
                  {patientsInConsultation.length === 0 ? (
                    <p className="text-xs text-slate-500">No active patient bookings linked to your profile.</p>
                  ) : (
                    patientsInConsultation.map(pat => (
                      <div 
                        key={pat.id}
                        onClick={() => setActivePatientChatId(pat.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          activePatientChatId === pat.id ? 'bg-blue-50/50 border-blue-500' : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs uppercase">
                            {pat.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{pat.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">ID: {pat.id}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat room */}
              <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
                {activePatientChatId ? (
                  <>
                    {(() => {
                      const activePat = patientsInConsultation.find(p => p.id === activePatientChatId);
                      const activeMessages = chatMessages.filter(m => 
                        (m.patientId === activePatientChatId && m.doctorId === user.id)
                      );

                      if (!activePat) return <div className="p-6 text-center text-xs text-slate-500">Select a patient to begin consulting.</div>;

                      return (
                        <>
                          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs">{activePat.name}</h4>
                              <span className="block text-[9px] text-slate-400 font-mono">Patient Tele-consultation</span>
                            </div>

                            <button
                              onClick={() => startVideoConsult(activePat.name)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 uppercase tracking-wider"
                            >
                              <Video className="w-3.5 h-3.5" /> Start Video
                            </button>
                          </div>

                          <div className="flex-1 p-6 overflow-y-auto space-y-3 font-sans text-xs">
                            {activeMessages.length === 0 ? (
                              <p className="text-center py-16 text-slate-400 text-[11px]">No diagnostic messages with {activePat.name} yet.</p>
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

                          <form onSubmit={handleSendChat} className="p-4 border-t border-slate-200 bg-slate-50/50 flex gap-2">
                            <input
                              type="text"
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder={`Type professional medical response to ${activePat.name}...`}
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
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Select Patient Conversation</p>
                    <p className="text-[10px] text-slate-400 max-w-xs">
                      Consult with patients over secure text or instantly boot up a high-definition telehealth video call.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. BIO & AVAILABILITY TAB */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Practitioner Details Workstation</h3>
                <p className="text-xs text-slate-500 mt-1">Manage public profile descriptions, consultation pricing metrics, and clinical phone contacts.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Clinician Name</label>
                    <input
                      type="text"
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fees ($)</label>
                    <input
                      type="number"
                      value={docFees}
                      onChange={(e) => setDocFees(Number(e.target.value))}
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Professional Bio / Academic Background</label>
                    <textarea
                      rows={4}
                      value={docBio}
                      onChange={(e) => setDocBio(e.target.value)}
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProfileSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                  {isProfileSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Professional Availability
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
