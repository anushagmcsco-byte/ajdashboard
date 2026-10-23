import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ManagedSite, User } from '../types/index.ts';
import {
  Globe,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Sliders,
  Shield,
  Layers,
  KeyRound,
} from 'lucide-react';

interface ManagedWebsitesViewProps {
  user: User;
  onOpenSsoModal: (site: 'INDUSTRIAL' | 'EDUCATION') => void;
  onNavigateSync: (site: 'INDUSTRIAL' | 'EDUCATION') => void;
}

export const ManagedWebsitesView: React.FC<ManagedWebsitesViewProps> = ({
  user,
  onOpenSsoModal,
  onNavigateSync,
}) => {
  const [sites, setSites] = useState<ManagedSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingCode, setTestingCode] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, any>>({});
  const [editingSite, setEditingSite] = useState<ManagedSite | null>(null);
  const [configApiUrl, setConfigApiUrl] = useState('');
  const [configAdminUrl, setConfigAdminUrl] = useState('');

  const loadSites = async () => {
    try {
      const data = await api.getManagedWebsites();
      setSites(data);
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleTestConnection = async (siteCode: 'INDUSTRIAL' | 'EDUCATION') => {
    setTestingCode(siteCode);
    try {
      let res;
      if (siteCode === 'INDUSTRIAL') {
        res = await api.testIndustrialHealth();
      } else {
        res = await api.testEducationHealth();
      }
      setTestResult((prev) => ({ ...prev, [siteCode]: res }));
      await loadSites();
    } catch (err: any) {
      alert(`Test probe failed: ${err.message}`);
    } finally {
      setTestingCode(null);
    }
  };

  const openConfigModal = (site: ManagedSite) => {
    setEditingSite(site);
    setConfigApiUrl(site.apiUrl);
    setConfigAdminUrl(site.adminUrl);
  };

  const handleSaveConfig = async () => {
    if (!editingSite) return;
    try {
      await api.updateIntegrationConfig(editingSite.code, {
        apiUrl: configApiUrl,
        adminUrl: configAdminUrl,
      });
      setEditingSite(null);
      await loadSites();
    } catch (err: any) {
      alert('Failed to update config: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
        Loading Managed Website Registry from AJ Control Plane...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span>Managed Website Registry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Authoritative registry and endpoint configuration for Silphor external platforms
          </p>
        </div>

        <button
          onClick={loadSites}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Website Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sites.map((site) => {
          const isIndustrial = site.code === 'INDUSTRIAL';
          const test = testResult[site.code];

          return (
            <div
              key={site.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          isIndustrial
                            ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {site.code}
                      </span>
                      <h2 className="text-base font-bold text-slate-100">
                        {site.name}
                      </h2>
                    </div>
                    <a
                      href={site.publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:underline font-mono flex items-center space-x-1 mt-1"
                    >
                      <span>{site.publicUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    {site.status}
                  </span>
                </div>

                {/* Details Table */}
                <div className="mt-5 space-y-2 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Environment:</span>
                    <span className="font-mono text-emerald-400 font-semibold">Production (Live)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target API Endpoint:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-xs">{site.apiUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Health Probe:</span>
                    <span className="font-mono text-slate-300 text-[11px] truncate max-w-xs">{site.healthEndpoint}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">API Key Fingerprint:</span>
                    <span className="font-mono text-slate-400 text-[11px]">{site.apiKeyMasked}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Version:</span>
                    <span className="font-mono text-cyan-400">{site.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Observed Latency:</span>
                    <span className="font-mono text-emerald-400 font-bold">{site.latencyMs} ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Administrative Owner:</span>
                    <span className="text-slate-300">{site.owner}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Last Health Check:</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(site.lastHealthCheck).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Last Test Diagnostic Result Banner */}
                {test && (
                  <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-[11px] text-emerald-300 flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      Probe verified: {test.status} ({test.latencyMs}ms)
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Auth: {test.authentication}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons (Prompt #7) */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                <a
                  href={site.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1"
                >
                  <span>Open Website</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <button
                  onClick={() => onOpenSsoModal(site.code)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 cursor-pointer ${
                    isIndustrial
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 hover:bg-indigo-900'
                      : 'bg-amber-950 text-amber-300 border border-amber-800 hover:bg-amber-900'
                  }`}
                >
                  <span>Open Admin (SSO)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => handleTestConnection(site.code)}
                  disabled={testingCode === site.code}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-3.5 h-3.5 ${testingCode === site.code ? 'animate-spin' : ''}`} />
                  <span>{testingCode === site.code ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <button
                  onClick={() => onNavigateSync(site.code)}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Sync Hub
                </button>

                <button
                  onClick={() => openConfigModal(site)}
                  className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 px-3 py-1.5 rounded-lg flex items-center space-x-1 cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Endpoint Configuration Modal */}
      {editingSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Configure Integration Endpoints: {editingSite.name}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Authoritative API Base URL
                </label>
                <input
                  type="url"
                  value={configApiUrl}
                  onChange={(e) => setConfigApiUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Administrative Portal URL
                </label>
                <input
                  type="url"
                  value={configAdminUrl}
                  onChange={(e) => setConfigAdminUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingSite(null)}
                className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="text-xs bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-lg"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
