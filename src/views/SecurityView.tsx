import React from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  Layers,
  Database,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';

export const SecurityView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span>Control Plane Cybersecurity & Enterprise Architecture</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Zero-trust administration standards for AJ Enterprise Solutions and managed Silphor environments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Database className="w-6 h-6" />
            <h2 className="text-sm font-bold text-slate-100">Isolated Database Topology</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            AJ Control Center retains its authoritative state exclusively in its dedicated PostgreSQL database. Silphor Industrial and Silphor Education databases are never accessed directly from the browser or cross-pollinated, guaranteeing separation of control plane metadata from transactional customer records.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3 text-indigo-400">
            <KeyRound className="w-6 h-6" />
            <h2 className="text-sm font-bold text-slate-100">Single-Use SSO Handoff (Prompt #17)</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Administrative transitions into <code className="text-indigo-400 font-mono">silphor.com/admin</code> or <code className="text-amber-400 font-mono">silper.co.in/admin</code> occur via signed, short-lived (300-second) single-use tokens. Master passwords and permanent bearer tokens are never exposed in query strings or transmitted across networks.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3 text-emerald-400">
            <Smartphone className="w-6 h-6" />
            <h2 className="text-sm font-bold text-slate-100">Cross-Device Progress Replication</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Unsaved product specs, training curricula drafts, and active view states are synchronized in real time across paired devices through authenticated heartbeat channels, allowing administrators to transition between workstations and mobile units seamlessly.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3 text-amber-400">
            <Lock className="w-6 h-6" />
            <h2 className="text-sm font-bold text-slate-100">Separation of Duties & Audit Trail</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Maker-checker approval policies enforce that release managers independently verify content before synchronization to live platforms. Every administrative touchpoint generates an immutable audit record with correlation IDs and timestamps.
          </p>
        </div>
      </div>
    </div>
  );
};
