import React from 'react';
import { Activity, BrainCircuit, ShieldAlert, Users, CalendarDays, CheckCircle2, HeartPulse, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export default function LandingPage({ onLoginClick, onRegisterClick }: LandingPageProps) {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 flex flex-col justify-between font-sans">
      {/* Hero section */}
      <div className="bg-white border-b border-slate-200">
        <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-900 tracking-tight uppercase">Health AI</span>
              <span className="block text-[10px] text-blue-600 font-mono font-bold tracking-widest uppercase">Clinical Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 cursor-pointer transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onRegisterClick}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg cursor-pointer shadow-sm transition-all"
            >
              Join Platform
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-xs font-semibold border border-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span>Clinical AI Co-Pilot & Patient Portals</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-none">
              Transforming <span className="text-blue-600">Health</span> and Care with Intelligence.
            </h1>
            
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg">
              A comprehensive clinical workstation enabling patients to securely coordinate appointments, store lab reports, and consult with Board-certified physicians and a state-of-the-art Clinical AI Assistant.
            </p>

            {/* Medical Disclaimer */}
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 max-w-lg">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Safety & Clinical Notice</p>
                <p className="text-[11px] text-amber-700 leading-normal mt-0.5">
                  AI diagnostic advice is intended solely for educational synthesis. This system does not replace direct professional medical diagnosis, emergency medical care, or medication administration under physical physician review.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onRegisterClick}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-lg flex items-center gap-2 cursor-pointer transition-all shadow-md group"
              >
                Register New Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onLoginClick}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3.5 rounded-lg cursor-pointer transition-all shadow-sm"
              >
                Go to Portals
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-3xl filter blur-3xl opacity-30 -z-10"></div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-blue-500" /> Clinical AI Workstation
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>
              </div>

              <div className="space-y-4 font-mono text-xs text-slate-600">
                <div className="bg-slate-50 p-3.5 rounded-md border border-slate-200">
                  <p className="text-slate-400 text-[10px] mb-1 font-bold">PATIENT INPUT:</p>
                  <p className="font-semibold text-slate-800">"Slight chronic headache for 4 days with elevated fatigue levels."</p>
                </div>
                
                <div className="bg-blue-50/50 p-3.5 rounded-md border border-blue-100 space-y-2">
                  <p className="text-blue-700 text-[10px] font-bold uppercase">Clinical AI Deep Analysis:</p>
                  <p className="text-slate-800 leading-relaxed font-sans">
                    **Suspected Differentials**: Tension Headache (Dehydration), Sinus Congestion. <br />
                    **Recommended Specialist**: Primary Care General Practitioner (GP) <br />
                    **Lifestyle Advice**: Drink &gt;2.5L water daily, minimize cognitive screen time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <p className="text-lg font-bold text-slate-900">100%</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Secure HIPAA-Ready</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200">
                  <p className="text-lg font-bold text-slate-900">&lt; 3 sec</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">AI Diagnostic Response</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Features Crafted for Dynamic Operations</h2>
          <p className="text-slate-600">Three dedicated portals coordinating medical data, physicians, and automated AI assistance.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Patient Self-Service</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Book consultations, upload and store lab reports, manage recurring medication timetables, and access instant symptom checking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center border border-blue-100">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Doctor Workstations</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Accept patient consultations, write digital prescriptions, review AI-summarized medical records, and host secure video/chat calls.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center border border-blue-100">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900">Hospital Administration</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Verify credentials of registering medical practitioners, browse real-time clinical audit logs, and monitor general facility analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
          <p className="font-semibold text-slate-200">AI-Powered Smart Healthcare Management System — FYP Project</p>
          <p>© 2026 Smart Healthcare Systems. Provided under Apache-2.0 License. All server endpoints integrated securely with Gemini.</p>
        </div>
      </footer>
    </div>
  );
}
