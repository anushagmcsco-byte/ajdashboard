import React from 'react';
import { User } from '../types/index.ts';
import {
  ShieldCheck,
  Laptop,
  Smartphone,
  ExternalLink,
  LogOut,
  RefreshCw,
  Server,
  Layers,
} from 'lucide-react';
import { getDeviceName } from '../services/api.ts';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onOpenDeviceSync: () => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION') => void;
  deviceSyncCount?: number;
  lastSyncTime?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onOpenDeviceSync,
  onOpenSsoModal,
  deviceSyncCount = 1,
  lastSyncTime,
}) => {
  const currentDeviceName = getDeviceName();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Brand & Organization Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl tracking-wider">
            AJ
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-100 text-sm tracking-wide uppercase">
                AJ Enterprise Solutions
              </span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full font-semibold uppercase">
                Hubli HQ
              </span>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Silphor Platform Control Center
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-2 ml-4 pl-4 border-l border-slate-800">
          <div className="flex items-center text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2" />
            PostgreSQL Primary Active
          </div>
        </div>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center space-x-3">
        {/* Multi-Device Sync Indicator */}
        <button
          onClick={onOpenDeviceSync}
          className="flex items-center space-x-2 text-xs bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 px-3 py-1.5 rounded-lg transition-all cursor-pointer group"
          title="Click to view all paired devices and synchronize drafts"
        >
          <div className="flex items-center text-cyan-400">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-medium text-slate-200">Device Sync</span>
          </div>
          <span className="bg-cyan-950 text-cyan-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
            {currentDeviceName}
          </span>
          <span className="text-[10px] text-slate-400">
            ({deviceSyncCount} active)
          </span>
        </button>

        {/* Quick External SSO Triggers */}
        <div className="hidden sm:flex items-center space-x-2">
          <button
            onClick={() => onOpenSsoModal('INDUSTRIAL')}
            className="flex items-center space-x-1.5 text-xs bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <span>Industrial Admin</span>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </button>

          <button
            onClick={() => onOpenSsoModal('EDUCATION')}
            className="flex items-center space-x-1.5 text-xs bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <span>Education Admin</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </button>
        </div>

        {/* User Profile & Role */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-800">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-200">
              {user.fullName}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-tight">
              {user.role}
            </div>
          </div>

          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-xs">
            {user.fullName.substring(0, 2).toUpperCase()}
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            title="Secure Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
