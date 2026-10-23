import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { Incident, User } from '../types/index.ts';
import {
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Server,
  Layers,
} from 'lucide-react';

interface IncidentsViewProps {
  user: User;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({ user }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [newSite, setNewSite] = useState<'INDUSTRIAL' | 'EDUCATION' | 'CONTROL_PLANE'>('INDUSTRIAL');
  const [newService, setNewService] = useState('Catalog API Ingest');
  const [newSummary, setNewSummary] = useState('');

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    try {
      await api.createIncident({
        title: newTitle,
        severity: newSeverity,
        affectedSite: newSite,
        affectedService: newService,
        summary: newSummary,
      });
      setShowNewModal(false);
      setNewTitle('');
      setNewSummary('');
      await loadIncidents();
    } catch (err: any) {
      alert('Failed to register incident: ' + err.message);
    }
  };

  const handleResolve = async (id: string) => {
    const rootCause = prompt('Enter root cause analysis:');
    if (rootCause === null) return;
    try {
      await api.updateIncident(id, {
        status: 'RESOLVED',
        rootCause,
        note: 'Incident closed and marked resolved by operations admin',
      });
      await loadIncidents();
    } catch (err: any) {
      alert('Error updating incident: ' + err.message);
    }
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse';
      case 'HIGH':
        return 'bg-orange-950 text-orange-400 border border-orange-800';
      case 'MEDIUM':
        return 'bg-amber-950 text-amber-400 border border-amber-800';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>Incident Triage & Service Health</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Independent fault isolation: Failure of Industrial platform does not degrade Education platform
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-1.5 text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Declare Incident</span>
        </button>
      </div>

      {/* Incidents List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Active & Historical Incidents ({incidents.length})
          </h2>
          <button
            onClick={loadIncidents}
            className="text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/60">
          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              Loading incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No active operational incidents reported. Both platforms operating nominally.
            </div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className="p-5 space-y-3 hover:bg-slate-800/20">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <span className="text-xs font-bold text-slate-100">{inc.title}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                        {inc.affectedSite}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{inc.summary}</p>
                  </div>

                  <div>
                    {inc.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleResolve(inc.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Resolve Incident
                      </button>
                    ) : (
                      <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full font-semibold">
                        RESOLVED
                      </span>
                    )}
                  </div>
                </div>

                {inc.rootCause && (
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                    <strong className="text-slate-300">Root Cause: </strong>
                    <span className="text-slate-400">{inc.rootCause}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-850 font-mono">
                  <span>ID: {inc.id} • Service: {inc.affectedService}</span>
                  <span>Created: {new Date(inc.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Incident Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateIncident}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4"
          >
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Declare Production Incident</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Industrial API Webhook Timeout"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Severity *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Affected System *
                  </label>
                  <select
                    value={newSite}
                    onChange={(e) => setNewSite(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="INDUSTRIAL">Silphor Industrial (silphor.com)</option>
                    <option value="EDUCATION">Silphor Education (silper.co.in)</option>
                    <option value="CONTROL_PLANE">AJ Control Plane</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Incident Summary & Symptoms *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe impact, observed error codes, and customer reach..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Register Incident
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
