import React from 'react';
import { ShieldAlert, User, Key, Activity } from 'lucide-react';

interface RoleSwitcherProps {
  onQuickLogin: (email: string, role: string) => void;
  currentRole?: string;
  currentUserName?: string;
}

export default function RoleSwitcher({ onQuickLogin, currentRole, currentUserName }: RoleSwitcherProps) {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-cyan-500/10 text-cyan-400 p-1 rounded-md">
            <Activity className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <span className="font-bold text-slate-100">AI Healthcare Sandbox</span>
            <span className="text-slate-400 hidden sm:inline ml-1.5 border-l border-slate-700 pl-1.5">
              Rapid presentation panel to easily evaluate user role views
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 font-medium mr-1">Demo Logins:</span>
          
          <button
            onClick={() => onQuickLogin('patient@healthcare.com', 'patient')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'patient'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Patient (Alwin)
          </button>

          <button
            onClick={() => onQuickLogin('doctor@healthcare.com', 'doctor')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'doctor'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Doctor (Dr. Mercer)
          </button>

          <button
            onClick={() => onQuickLogin('admin@healthcare.com', 'admin')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentRole === 'admin'
                ? 'bg-slate-700 text-white shadow-sm border border-slate-600'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Hospital Admin
          </button>
        </div>

        {currentUserName && (
          <div className="flex items-center gap-2 bg-slate-800/80 px-2.5 py-1 rounded text-slate-300 font-mono text-[11px] border border-slate-700">
            <span className="text-slate-400">Logged in as:</span>
            <span className="text-white font-semibold">{currentUserName}</span>
            <span className="capitalize px-1.5 py-0.5 rounded bg-slate-700 text-[10px] text-cyan-300 font-bold">
              {currentRole}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
