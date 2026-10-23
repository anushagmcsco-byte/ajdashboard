import React from 'react';
import { User } from '../types/index.ts';
import {
  LayoutDashboard,
  Globe,
  Factory,
  Package,
  PlusCircle,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Smartphone,
  SlidersHorizontal,
  CheckSquare,
  AlertTriangle,
  History,
  Users,
  ShieldCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'managed-websites'
  | 'industrial-products'
  | 'industrial-new-product'
  | 'industrial-sync'
  | 'education-courses'
  | 'education-new-course'
  | 'education-sync'
  | 'device-sync'
  | 'integrations'
  | 'approvals'
  | 'features'
  | 'incidents'
  | 'audit'
  | 'users-roles'
  | 'security';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  user: User;
  pendingApprovalsCount?: number;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  user,
  pendingApprovalsCount = 0,
  activeIncidentsCount = 0,
}) => {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isIndustrialAdmin = isSuperAdmin || user.role === 'INDUSTRIAL_ADMIN';
  const isEducationAdmin = isSuperAdmin || user.role === 'EDUCATION_ADMIN';

  const navItem = (
    view: NavView,
    label: string,
    Icon: React.ElementType,
    badge?: number | string,
    badgeColor = 'bg-slate-800 text-slate-300'
  ) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onNavigate(view)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          isActive
            ? 'bg-cyan-500/15 text-cyan-400 font-semibold border-l-2 border-cyan-400 pl-2.5'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span className="truncate">{label}</span>
        </div>
        {badge !== undefined && badge !== 0 && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0 ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Core Operations */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Control Plane
          </div>
          <div className="space-y-1">
            {navItem('dashboard', 'Central Dashboard', LayoutDashboard)}
            {navItem('managed-websites', 'Managed Websites', Globe)}
          </div>
        </div>

        {/* Industrial Section */}
        {isIndustrialAdmin && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Factory className="w-3 h-3 mr-1.5 text-indigo-400" />
                Silphor Industrial
              </span>
              <span className="text-[9px] text-slate-500 font-mono">silphor.com</span>
            </div>
            <div className="space-y-1">
              {navItem('industrial-products', 'Industrial Products', Package)}
              {navItem('industrial-new-product', '+ Add Product', PlusCircle)}
              {navItem('industrial-sync', 'Product Synchronization', RefreshCw)}
            </div>
          </div>
        )}

        {/* Education Section */}
        {isEducationAdmin && (
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <GraduationCap className="w-3 h-3 mr-1.5 text-amber-400" />
                Silphor Education
              </span>
              <span className="text-[9px] text-slate-500 font-mono">silper.co.in</span>
            </div>
            <div className="space-y-1">
              {navItem('education-courses', 'Education Courses', BookOpen)}
              {navItem('education-new-course', '+ Add Course', PlusCircle)}
              {navItem('education-sync', 'Course Synchronization', RefreshCw)}
            </div>
          </div>
        )}

        {/* Multi-Device Synchronization */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Cross-Device Workspace
          </div>
          <div className="space-y-1">
            {navItem('device-sync', 'Multi-Device State Sync', Smartphone, 'Live', 'bg-cyan-950 text-cyan-400 border border-cyan-800/80')}
          </div>
        </div>

        {/* Governance & Operations */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Governance & Ops
          </div>
          <div className="space-y-1">
            {navItem(
              'approvals',
              'Approvals & Requests',
              CheckSquare,
              pendingApprovalsCount,
              pendingApprovalsCount > 0 ? 'bg-amber-950 text-amber-400 border border-amber-800' : undefined
            )}
            {navItem('integrations', 'Integration Health', Radio)}
            {navItem('features', 'Feature Policies', SlidersHorizontal)}
            {navItem(
              'incidents',
              'Incident Management',
              AlertTriangle,
              activeIncidentsCount,
              activeIncidentsCount > 0 ? 'bg-rose-950 text-rose-400 border border-rose-800' : undefined
            )}
            {navItem('audit', 'Audit Log & History', History)}
          </div>
        </div>

        {/* Security & Access */}
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Administration
          </div>
          <div className="space-y-1">
            {navItem('users-roles', 'Users & RBAC', Users)}
            {navItem('security', 'Security Architecture', ShieldCheck)}
          </div>
        </div>
      </div>

      {/* Target Platforms Quick Links */}
      <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/40 text-[11px] text-slate-400 space-y-2">
        <div className="text-[10px] uppercase font-bold text-slate-500">
          Managed Target URLs
        </div>
        <a
          href="https://silphor.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-indigo-400 hover:text-indigo-300 py-0.5 truncate"
        >
          <span className="truncate">Industrial: silphor.com</span>
          <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
        </a>
        <a
          href="https://silper.co.in"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-amber-400 hover:text-amber-300 py-0.5 truncate"
        >
          <span className="truncate">Education: silper.co.in</span>
          <ExternalLink className="w-3 h-3 shrink-0 ml-1" />
        </a>
      </div>
    </aside>
  );
};
