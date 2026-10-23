import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { AuditEvent, User } from '../types/index.ts';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

interface AuditViewProps {
  user: User;
}

export const AuditView: React.FC<AuditViewProps> = ({ user }) => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');

  const loadAudit = async () => {
    try {
      const data = await api.getAuditEvents({
        action: actionFilter || undefined,
        targetType: targetFilter || undefined,
        limit: 100,
      });
      setEvents(data);
    } catch (err) {
      console.error('Failed to load audit events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [actionFilter, targetFilter]);

  const exportAuditJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aj-audit-trail-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <History className="w-5 h-5 text-cyan-400" />
            <span>Cryptographic Audit Trail & Compliance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable operation history recorded in PostgreSQL for all administrative and synchronization events
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportAuditJson}
            className="flex items-center space-x-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail (JSON)</span>
          </button>

          <button
            onClick={loadAudit}
            className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-2.5 px-4">Event ID / Timestamp</th>
                <th className="py-2.5 px-4">Actor & Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Target</th>
                <th className="py-2.5 px-4">Operation Summary</th>
                <th className="py-2.5 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    Loading audit trail from database...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-cyan-400 font-bold">{evt.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(evt.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{evt.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{evt.actorRole}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="bg-slate-950 text-cyan-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                        {evt.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <div>{evt.targetType}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{evt.targetId}</div>
                    </td>

                    <td className="py-3 px-4 font-sans text-slate-300 max-w-md">
                      {evt.summary}
                    </td>

                    <td className="py-3 px-4">
                      {evt.result === 'SUCCESS' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          SUCCESS
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800 px-2 py-0.5 rounded-full font-bold">
                          FAILED
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
