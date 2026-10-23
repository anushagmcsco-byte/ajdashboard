import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { SyncJob, SyncMapping, User } from '../types/index.ts';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Layers,
  Factory,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface SyncDashboardViewProps {
  user: User;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION', deepLink?: string, title?: string) => void;
  defaultSiteFilter?: 'ALL' | 'INDUSTRIAL' | 'EDUCATION';
}

export const SyncDashboardView: React.FC<SyncDashboardViewProps> = ({
  user,
  onOpenSsoModal,
  defaultSiteFilter = 'ALL',
}) => {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [mappings, setMappings] = useState<SyncMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [siteFilter, setSiteFilter] = useState<'ALL' | 'INDUSTRIAL' | 'EDUCATION'>(defaultSiteFilter);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await api.getSyncJobs();
      setJobs(data.jobs);
      setMappings(data.mappings);
    } catch (err) {
      console.error('Failed to load sync telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await api.retrySyncJob(jobId);
      await loadData();
    } catch (err: any) {
      alert('Retry failed: ' + err.message);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredJobs = siteFilter === 'ALL' ? jobs : jobs.filter((j) => j.targetSite === siteFilter);
  const filteredMappings = siteFilter === 'ALL' ? mappings : mappings.filter((m) => m.targetSite === siteFilter);

  // Stats calculation
  const indJobs = jobs.filter((j) => j.targetSite === 'INDUSTRIAL');
  const eduJobs = jobs.filter((j) => j.targetSite === 'EDUCATION');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" />
              <span>Synchronization Engine & Telemetry</span>
            </h1>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              Idempotent Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time synchronization queue, permanent external target IDs, and automated failure retries
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          >
            <option value="ALL">All Platforms</option>
            <option value="INDUSTRIAL">Industrial (silphor.com)</option>
            <option value="EDUCATION">Education (silper.co.in)</option>
          </select>

          <button
            onClick={loadData}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronization Summary Counters (Prompt #23) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Industrial Platform Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Factory className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Industrial Products Sync (silphor.com)
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Total Jobs</div>
              <div className="text-sm font-bold font-mono text-slate-200">{indJobs.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400">Synced</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {indJobs.filter((j) => j.status === 'SYNCED').length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400">Syncing</div>
              <div className="text-sm font-bold font-mono text-cyan-400">
                {indJobs.filter((j) => j.status === 'SYNCING').length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-rose-400">Failed</div>
              <div className="text-sm font-bold font-mono text-rose-400">
                {indJobs.filter((j) => j.status === 'FAILED').length}
              </div>
            </div>
          </div>
        </div>

        {/* Education Platform Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Education Courses Sync (silper.co.in)
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] text-slate-400">Total Jobs</div>
              <div className="text-sm font-bold font-mono text-slate-200">{eduJobs.length}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400">Synced</div>
              <div className="text-sm font-bold font-mono text-emerald-400">
                {eduJobs.filter((j) => j.status === 'SYNCED').length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-cyan-400">Syncing</div>
              <div className="text-sm font-bold font-mono text-cyan-400">
                {eduJobs.filter((j) => j.status === 'SYNCING').length}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-rose-400">Failed</div>
              <div className="text-sm font-bold font-mono text-rose-400">
                {eduJobs.filter((j) => j.status === 'FAILED').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Jobs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Real-Time Synchronization Jobs Queue
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            {filteredJobs.length} dispatches registered
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-2.5 px-4">Job ID & Content</th>
                <th className="py-2.5 px-4">Target Site</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Authoritative Target ID</th>
                <th className="py-2.5 px-4">Attempts</th>
                <th className="py-2.5 px-4">Last Sync</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No active synchronization jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{job.contentName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {job.id} • Source: {job.sourceId}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                      {job.targetSite} ({job.targetUrl})
                    </td>

                    <td className="py-3 px-4">
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

                    <td className="py-3 px-4 font-mono text-[11px]">
                      {job.targetId ? (
                        <span className="text-emerald-400 font-bold">{job.targetId}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {job.attemptCount} / {job.maxAttempts}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {job.lastSuccessfulSyncAt
                        ? new Date(job.lastSuccessfulSyncAt).toLocaleTimeString()
                        : 'Pending'}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {job.status === 'FAILED' ? (
                        <button
                          onClick={() => handleRetry(job.id)}
                          disabled={retryingId === job.id}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2.5 py-1 rounded border border-slate-700 cursor-pointer disabled:opacity-50"
                        >
                          {retryingId === job.id ? 'Retrying...' : 'Retry'}
                        </button>
                      ) : job.targetId ? (
                        <button
                          onClick={() =>
                            onOpenSsoModal(
                              job.targetSite,
                              job.targetSite === 'INDUSTRIAL'
                                ? `https://silphor.com/admin/products/${job.targetId}`
                                : `https://silper.co.in/admin/courses/${job.targetId}`,
                              job.contentName
                            )
                          }
                          className="text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 px-2.5 py-1 rounded border border-slate-700 flex items-center space-x-1 ml-auto cursor-pointer"
                        >
                          <span>Open Admin</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </button>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permanent Target ID Mappings Table (Prompt #27 & #28) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Permanent Target Website Mappings (PostgreSQL sync_mappings)</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Deterministic bidirectional link between AJ Source ID and authoritative target platform IDs
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">
            {filteredMappings.length} Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-2.5 px-4">AJ Source ID</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Target Website</th>
                <th className="py-2.5 px-4">Authoritative Target ID</th>
                <th className="py-2.5 px-4">Sync Version</th>
                <th className="py-2.5 px-4">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredMappings.map((map) => (
                <tr key={map.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-200">{map.sourceId}</td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        map.sourceType === 'PRODUCT'
                          ? 'bg-indigo-950 text-indigo-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {map.sourceType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-300">{map.targetSiteUrl}</td>
                  <td className="py-2.5 px-4 font-bold text-emerald-400">{map.targetId}</td>
                  <td className="py-2.5 px-4 text-slate-300">v{map.syncVersion}</td>
                  <td className="py-2.5 px-4 text-slate-400">
                    {new Date(map.lastSuccessfulSync).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
