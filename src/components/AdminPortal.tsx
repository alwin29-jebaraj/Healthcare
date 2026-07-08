import React from 'react';
import { User, ActivityLog } from '../types';
import { 
  ShieldCheck, Users, Stethoscope, FileText, CheckCircle2, XCircle, Clock, 
  Terminal, ShieldAlert, BadgeInfo, HelpCircle, Activity, Heart, Star, Check, X
} from 'lucide-react';

interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  appointmentsStatus: {
    pending: number;
    accepted: number;
    completed: number;
    cancelled: number;
  };
}

interface AdminPortalProps {
  user: User;
  users: User[];
  stats: AdminStats;
  logs: ActivityLog[];
  onVerifyDoctor: (id: string, verify: boolean) => Promise<void>;
}

export default function AdminPortal({
  user,
  users,
  stats,
  logs,
  onVerifyDoctor
}: AdminPortalProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-lg p-6 shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-lg shadow-sm border border-blue-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Clinical Administration Control Room</h2>
            <p className="text-xs text-slate-400 font-mono">Operator ID: {user.id} — Role: {user.role.toUpperCase()} (Superuser)</p>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px] bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-lg">
          <div className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-blue-400 animate-pulse" /> SYSTEM ONLINE</div>
          <div className="text-slate-400">Ledger Security: AES-256</div>
        </div>
      </div>

      {/* Hospital Metrics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Patients</span>
            <Users className="w-5 h-5 text-blue-600 bg-blue-50/50 p-1 rounded-md border border-blue-100" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalPatients}</p>
          <span className="text-[10px] text-slate-500 font-mono">Registered healthcare seekers</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Medical Practitioners</span>
            <Stethoscope className="w-5 h-5 text-blue-600 bg-blue-50/50 p-1 rounded-md border border-blue-100" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalDoctors}</p>
          <span className="text-[10px] text-slate-500 font-mono">Specialists & family MDs</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Verification Backlog</span>
            <ShieldAlert className="w-5 h-5 text-amber-500 bg-amber-50 p-1 rounded-md border border-amber-100" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.pendingDoctors}</p>
          <span className="text-[10px] text-amber-600 font-bold font-sans">Actionable registration audits</span>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Facility Bookings</span>
            <FileText className="w-5 h-5 text-blue-600 bg-blue-50/50 p-1 rounded-md border border-blue-100" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalAppointments}</p>
          <span className="text-[10px] text-slate-500 font-mono">Total clinical consultations booked</span>
        </div>
      </div>

      {/* Appointment breakdown sub-widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="text-center">
          <p className="text-xs text-slate-500 font-mono">PENDING APPROVAL</p>
          <p className="text-lg font-bold text-amber-600 font-mono">{stats.appointmentsStatus.pending}</p>
        </div>
        <div className="text-center border-l border-slate-200">
          <p className="text-xs text-slate-500 font-mono">CONFIRMED ACTIVE</p>
          <p className="text-lg font-bold text-blue-600 font-mono">{stats.appointmentsStatus.accepted}</p>
        </div>
        <div className="text-center border-l border-slate-200">
          <p className="text-xs text-slate-500 font-mono">COMPLETED/CLOSED</p>
          <p className="text-lg font-bold text-blue-600 font-mono">{stats.appointmentsStatus.completed}</p>
        </div>
        <div className="text-center border-l border-slate-200">
          <p className="text-xs text-slate-500 font-mono">CANCELLED CASES</p>
          <p className="text-lg font-bold text-slate-500 font-mono">{stats.appointmentsStatus.cancelled}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Doctor Verification Workstation (2 Cols span on large screens) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Doctor Verification Board */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Medical Board Verification & Auditing
              </h3>
              <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold uppercase border border-blue-100">Backlog: {stats.pendingDoctors}</span>
            </div>
            
            <p className="text-xs text-slate-500">
              Audit registering physicians, verify medical licensure, and grant prescriptions/telehealth channels authorization.
            </p>

            {users.filter(u => u.role === 'doctor').length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No doctor registries currently logged in the facility catalog.</p>
            ) : (
              <div className="space-y-3.5">
                {users.filter(u => u.role === 'doctor').map(doc => (
                  <div key={doc.id} className="p-4 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20 hover:border-slate-300 transition-all">
                    <div className="flex items-start gap-3">
                      <img src={doc.avatar} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-800">{doc.name}</p>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border ${
                            doc.isVerified ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {doc.isVerified ? 'VERIFIED' : 'PENDING CREDENTIALS'}
                          </span>
                        </div>
                        <p className="text-[10px] text-blue-700 font-bold font-mono mt-0.5">{doc.specialities?.join(', ')}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-md mt-1">{doc.bio}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!doc.isVerified ? (
                        <button
                          onClick={() => onVerifyDoctor(doc.id, true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 shadow-sm uppercase tracking-wider"
                        >
                          <Check className="w-3.5 h-3.5" /> Verify Credentials
                        </button>
                      ) : (
                        <button
                          onClick={() => onVerifyDoctor(doc.id, false)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1 uppercase tracking-wider"
                        >
                          <X className="w-3.5 h-3.5" /> Revoke Verification
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Management Catalog */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 uppercase tracking-wide">
              <Users className="w-4 h-4 text-blue-600" /> Hospital Core Ledger (User Accounts)
            </h3>

            <div className="overflow-x-auto text-xs text-slate-600">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-mono text-[9px] uppercase font-bold">
                    <th className="pb-2.5">User Details</th>
                    <th className="pb-2.5">Email Address</th>
                    <th className="pb-2.5">Role</th>
                    <th className="pb-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 font-bold text-slate-800">{u.name}</td>
                      <td className="py-2.5 font-mono">{u.email}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase border ${
                          u.role === 'admin' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                          u.role === 'doctor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-[10px] text-slate-500 font-mono">Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Live Operational Logs */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-950 text-slate-200 p-6 rounded-lg shadow-lg border border-slate-800 space-y-4 flex flex-col h-[550px]">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3">
              <h4 className="font-mono text-xs font-bold text-blue-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 animate-pulse" /> Facility Audit Ledger
              </h4>
              <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono px-2 py-0.5 rounded-full font-bold">LIVE STREAM</span>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto space-y-3.5 font-mono text-[10px] leading-relaxed scrollbar-thin">
              {logs.length === 0 ? (
                <p className="text-slate-500 text-center py-12">No hospital logs registered yet.</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border-b border-slate-900 pb-2 space-y-1">
                    <div className="flex justify-between items-center text-slate-500 text-[8px]">
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-blue-400 font-bold">{log.action}</span>
                    </div>
                    <p className="text-slate-300"><span className="text-slate-500">&gt;</span> {log.details}</p>
                    <p className="text-[9px] text-slate-500">Operator: {log.userEmail}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[9px] text-slate-500 font-mono">
              <span>Total audit records: {logs.length}</span>
              <span className="animate-pulse text-blue-400 font-bold">● ONLINE</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
