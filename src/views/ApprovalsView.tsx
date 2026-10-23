import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ChangeRequest, User } from '../types/index.ts';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  RefreshCw,
  UserCheck,
  FileText,
} from 'lucide-react';

interface ApprovalsViewProps {
  user: User;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({ user }) => {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedCr, setSelectedCr] = useState<ChangeRequest | null>(null);

  const loadRequests = async () => {
    try {
      const data = await api.getChangeRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to load change requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (cr: ChangeRequest) => {
    if (cr.requesterId === user.uid && user.role !== 'SUPER_ADMIN') {
      alert('Separation of Duties violation: A change cannot be approved by the person who requested it.');
      return;
    }

    setActingId(cr.id);
    try {
      await api.approveChangeRequest(cr.id, reviewNotes || 'Approved by release manager');
      await loadRequests();
      setSelectedCr(null);
      setReviewNotes('');
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setActingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const historyRequests = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>Change Requests & Approvals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Maker-checker approval workflow enforcing separation of duties before publication to live production
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Separation of Duties Rule Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-900/60 rounded-xl text-xs text-amber-300 flex items-start space-x-3">
        <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Production Governance Policy:</span> The user who authored the product or course change is strictly barred from approving their own request. Approvals require an independent Release Manager or Super Administrator.
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Pending Approval Queue ({pendingRequests.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Loading change requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No pending change requests awaiting approval. All catalogs are up to date!
            </div>
          ) : (
            pendingRequests.map((cr) => {
              const isOwnRequest = cr.requesterId === user.uid;

              return (
                <div key={cr.id} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-800/20">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold">
                        {cr.type}
                      </span>
                      <h3 className="text-sm font-bold text-slate-100">{cr.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400">{cr.changeSummary}</p>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-3 font-mono">
                      <span>Requested by: <strong className="text-slate-300">{cr.requesterName}</strong></span>
                      <span>•</span>
                      <span>Target: {cr.referenceId}</span>
                      <span>•</span>
                      <span>{new Date(cr.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleApprove(cr)}
                      disabled={actingId === cr.id || (isOwnRequest && user.role !== 'SUPER_ADMIN')}
                      className={`text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-md ${
                        isOwnRequest && user.role !== 'SUPER_ADMIN'
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 cursor-pointer'
                      }`}
                      title={isOwnRequest && user.role !== 'SUPER_ADMIN' ? 'Maker-Checker violation: Cannot self-approve' : 'Approve change'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isOwnRequest && user.role !== 'SUPER_ADMIN' ? 'Cannot Self-Approve' : 'Approve & Release'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Audit History of Change Approvals */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Resolved Change History
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-2.5 px-4">Change ID</th>
                <th className="py-2.5 px-4">Title & Type</th>
                <th className="py-2.5 px-4">Requester</th>
                <th className="py-2.5 px-4">Approver</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Resolved Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {historyRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                    No historical change requests resolved yet.
                  </td>
                </tr>
              ) : (
                historyRequests.map((cr) => (
                  <tr key={cr.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-bold text-slate-200">{cr.id}</td>
                    <td className="py-3 px-4 font-sans">
                      <div className="font-semibold text-slate-200">{cr.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cr.type}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{cr.requesterName}</td>
                    <td className="py-3 px-4 text-emerald-400">{cr.approverName || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                        {cr.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {cr.resolvedAt ? new Date(cr.resolvedAt).toLocaleDateString() : '—'}
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
