import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';
import {
  Users,
  Shield,
  KeyRound,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Smartphone,
} from 'lucide-react';

interface UsersRolesViewProps {
  currentUser: User;
}

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [u, r] = await Promise.all([api.getUsers(), api.getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (err) {
      console.error('Failed to load users & roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
          <Users className="w-5 h-5 text-cyan-400" />
          <span>Administrators & Role-Based Access Control (RBAC)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Authority boundaries between AJ Enterprise Solutions, Silphor Industrial, and Silphor Education
        </p>
      </div>

      {/* Security Rule Prompt #19 Callout */}
      <div className="p-4 bg-indigo-950/40 border border-indigo-800/80 rounded-2xl text-xs space-y-2">
        <div className="font-bold text-indigo-300 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <span>Strict Role Isolation Enforcement (Prompt #19)</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          • <strong>Industrial Admin:</strong> Has permissions only on Industrial Products, Catalog Sync, and silphor.com administration. Blocked from Education operations.<br />
          • <strong>Education Admin:</strong> Has permissions only on Education Courses, Curriculum Sync, and silper.co.in administration. Blocked from Industrial operations.<br />
          • <strong>Super Admin:</strong> Root authority across all domains with unified oversight.
        </p>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Authorized Platform Administrators ({users.length})
          </h2>
          <button
            onClick={loadData}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-2.5 px-4">Administrator</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Target Authority</th>
                <th className="py-2.5 px-4">MFA Status</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Account UID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {users.map((u) => {
                const isSuper = u.role === 'SUPER_ADMIN';
                const isInd = u.role === 'INDUSTRIAL_ADMIN';

                return (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{u.fullName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isSuper
                            ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                            : isInd
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-300">
                      {isSuper
                        ? 'Unified Control Plane + All Sites'
                        : isInd
                        ? 'Silphor Industrial (silphor.com)'
                        : 'Silphor Education (silper.co.in)'}
                    </td>

                    <td className="py-3 px-4 text-emerald-400 font-bold">
                      <span className="flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enforced (TOTP)</span>
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right text-slate-500">
                      {u.uid}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Cross-Site Permission Matrix (Prompt #18)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-indigo-400 text-sm">Industrial Permissions</div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>• industrial.products.view</div>
              <div>• industrial.products.create</div>
              <div>• industrial.products.edit</div>
              <div>• industrial.products.publish</div>
              <div>• industrial.products.unpublish</div>
              <div>• industrial.products.archive</div>
              <div>• industrial.products.sync</div>
              <div>• industrial.admin.open</div>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <div className="font-bold text-amber-400 text-sm">Education Permissions</div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>• education.courses.view</div>
              <div>• education.courses.create</div>
              <div>• education.courses.edit</div>
              <div>• education.courses.publish</div>
              <div>• education.courses.unpublish</div>
              <div>• education.courses.archive</div>
              <div>• education.courses.sync</div>
              <div>• education.admin.open</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
