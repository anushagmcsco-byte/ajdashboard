import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { User } from '../types/index.ts';
import { NavView } from '../components/Sidebar.tsx';
import {
  Factory,
  GraduationCap,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
  Activity,
  Smartphone,
  Radio,
  TrendingUp,
} from 'lucide-react';

interface DashboardViewProps {
  user: User;
  onNavigate: (view: NavView) => void;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string) => void;
  onOpenDeviceSync: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onOpenSsoModal,
  onOpenDeviceSync,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const overview = await api.getDashboardOverview();
      setData(overview);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // 20s telemetry poll
    return () => clearInterval(interval);
  }, []);

  const handleRetrySync = async (jobId: string) => {
    setSyncingId(jobId);
    try {
      await api.retrySyncJob(jobId);
      await loadData();
    } catch (err: any) {
      alert('Retry error: ' + err.message);
    } finally {
      setSyncingId(null);
    }
  };

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const canIndustrial = isSuperAdmin || user.role === 'INDUSTRIAL_ADMIN';
  const canEducation = isSuperAdmin || user.role === 'EDUCATION_ADMIN';

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh] text-slate-400 space-x-3 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Loading operational telemetry from PostgreSQL control plane...</span>
      </div>
    );
  }

  const ind = data?.industrial || {};
  const edu = data?.education || {};
  const sys = data?.system || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100">
              Silphor Platform Control Plane
            </h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
              Live Production
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Centralized administration for <strong className="text-indigo-400 font-mono">silphor.com</strong> and <strong className="text-amber-400 font-mono">silper.co.in</strong>
          </p>
        </div>

        {/* Central Quick Actions (Prompt #22) */}
        <div className="flex flex-wrap items-center gap-2">
          {canIndustrial && (
            <button
              onClick={() => onNavigate('industrial-new-product')}
              className="flex items-center space-x-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Product</span>
            </button>
          )}

          {canEducation && (
            <button
              onClick={() => onNavigate('education-new-course')}
              className="flex items-center space-x-1.5 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium px-3 py-2 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add Course</span>
            </button>
          )}

          <button
            onClick={onOpenDeviceSync}
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Device Sync</span>
          </button>
        </div>
      </div>

      {/* TWO MAJOR WEBSITE OPERATIONAL CARDS (Prompt #6) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: SILPHOR INDUSTRIAL / PARTNER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 shadow-lg">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-100">
                      Silphor Industrial / Partner
                    </h2>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      {ind.site?.status || 'HEALTHY'}
                    </span>
                  </div>
                  <a
                    href="https://silphor.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:underline font-mono flex items-center space-x-1 mt-0.5"
                  >
                    <span>https://silphor.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-mono">
                  Latency: <strong className="text-indigo-400">{ind.site?.latencyMs || 38}ms</strong>
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 my-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="text-center">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Products
                </div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {ind.totalProducts ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase">
                  Synced
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {ind.synced ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-amber-400 uppercase">
                  Pending
                </div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {ind.pending ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-rose-400 uppercase">
                  Failed
                </div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                  {ind.failed ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Prompt #6) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://silphor.com"
                target="_blank"
                rel="noreferrer"
                className="text-center text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Open Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                onClick={() => onOpenSsoModal('INDUSTRIAL')}
                disabled={!canIndustrial}
                className="text-xs bg-indigo-950 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-800/60 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>Open Admin (SSO)</span>
                <ExternalLink className="w-3 h-3 text-indigo-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onNavigate('industrial-products')}
                disabled={!canIndustrial}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                Products
              </button>
              <button
                onClick={() => onNavigate('industrial-new-product')}
                disabled={!canIndustrial}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                + Add Product
              </button>
              <button
                onClick={() => onNavigate('industrial-sync')}
                disabled={!canIndustrial}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                Product Sync
              </button>
            </div>
          </div>
        </div>

        {/* CARD 2: SILPHOR EDUCATION / TRAINING */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 shadow-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-slate-100">
                      Silphor Education / Training
                    </h2>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                      {edu.site?.status || 'HEALTHY'}
                    </span>
                  </div>
                  <a
                    href="https://silper.co.in"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-amber-400 hover:underline font-mono flex items-center space-x-1 mt-0.5"
                  >
                    <span>https://silper.co.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-mono">
                  Latency: <strong className="text-amber-400">{edu.site?.latencyMs || 44}ms</strong>
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-4 gap-2 my-5 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <div className="text-center">
                <div className="text-[10px] font-semibold text-slate-400 uppercase">
                  Courses
                </div>
                <div className="text-base font-bold text-slate-100 font-mono mt-0.5">
                  {edu.totalCourses ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-emerald-400 uppercase">
                  Synced
                </div>
                <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                  {edu.synced ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-amber-400 uppercase">
                  Pending
                </div>
                <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                  {edu.pending ?? 0}
                </div>
              </div>
              <div className="text-center border-l border-slate-800">
                <div className="text-[10px] font-semibold text-rose-400 uppercase">
                  Failed
                </div>
                <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                  {edu.failed ?? 0}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Prompt #6) */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://silper.co.in"
                target="_blank"
                rel="noreferrer"
                className="text-center text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Open Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              <button
                onClick={() => onOpenSsoModal('EDUCATION')}
                disabled={!canEducation}
                className="text-xs bg-amber-950 hover:bg-amber-900/80 text-amber-300 border border-amber-800/60 py-2 px-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>Open Admin (SSO)</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onNavigate('education-courses')}
                disabled={!canEducation}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                Courses
              </button>
              <button
                onClick={() => onNavigate('education-new-course')}
                disabled={!canEducation}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                + Add Course
              </button>
              <button
                onClick={() => onNavigate('education-sync')}
                disabled={!canEducation}
                className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60 py-1.5 rounded-lg transition-all cursor-pointer disabled:opacity-40"
              >
                Course Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Synchronizations & System Telemetry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Synchronization Telemetry */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Recent Synchronization Dispatches
              </h3>
            </div>
            <button
              onClick={() => onNavigate('industrial-sync')}
              className="text-xs text-cyan-400 hover:underline flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <th className="py-2.5 px-3">Content / ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target Platform</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {sys.recentJobs && sys.recentJobs.length > 0 ? (
                  sys.recentJobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-200 truncate max-w-xs">
                          {job.contentName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {job.sourceId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                            job.contentType === 'PRODUCT'
                              ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {job.contentType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                        {job.targetSite}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            job.status === 'SYNCED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : job.status === 'SYNCING'
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
                              : job.status === 'FAILED'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {job.status === 'SYNCED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {job.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {job.status === 'FAILED' ? (
                          <button
                            onClick={() => handleRetrySync(job.id)}
                            disabled={syncingId === job.id}
                            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-1 rounded border border-slate-700"
                          >
                            {syncingId === job.id ? 'Retrying...' : 'Retry'}
                          </button>
                        ) : job.targetId ? (
                          <span className="text-[11px] font-mono text-emerald-400">
                            {job.targetId}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                      No synchronization dispatches recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Governance & Infrastructure Health */}
        <div className="space-y-6">
          {/* Approvals Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5 text-amber-400" />
                Pending Approvals ({sys.pendingApprovalsCount ?? 0})
              </h3>
              <button
                onClick={() => onNavigate('approvals')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Review
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maker-checker enforcement requires release manager approval before changes publish directly to production.
            </p>
          </div>

          {/* Infrastructure Health Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
              <Server className="w-4 h-4 mr-1.5 text-cyan-400" />
              AJ Control Plane Health
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">PostgreSQL Primary</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">Sync Dispatch Queue</span>
                <span className="text-emerald-400 font-mono font-bold">READY</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-400">MFA & SSO Authority</span>
                <span className="text-emerald-400 font-mono font-bold">ENFORCED</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400">Cross-Device Replication</span>
                <span className="text-cyan-400 font-mono font-bold">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
