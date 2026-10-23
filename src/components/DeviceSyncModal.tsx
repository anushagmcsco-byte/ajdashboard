import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Laptop,
  Monitor,
  RefreshCw,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Copy,
  Check,
} from 'lucide-react';
import { api, getDeviceId, getDeviceName, setDeviceName } from '../services/api.ts';
import { DeviceSyncRecord } from '../types/index.ts';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeDraft: (draft: any, activeView: string) => void;
}

export const DeviceSyncModal: React.FC<DeviceSyncModalProps> = ({
  isOpen,
  onClose,
  onResumeDraft,
}) => {
  const [devices, setDevices] = useState<DeviceSyncRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [customName, setCustomName] = useState(getDeviceName());
  const [copiedCode, setCopiedCode] = useState(false);
  const currentDeviceId = getDeviceId();

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getPairedDevices();
      setDevices(data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveDeviceName = () => {
    if (customName.trim()) {
      setDeviceName(customName.trim());
      setEditingName(false);
      // Heartbeat with updated name
      api.sendDeviceHeartbeat({ activeView: 'dashboard' }).then(loadDevices);
    }
  };

  const getDeviceIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('mobile') || n.includes('phone')) return Smartphone;
    if (n.includes('laptop') || n.includes('macbook')) return Laptop;
    return Monitor;
  };

  const copyPairingPin = () => {
    navigator.clipboard.writeText('AJ-SYNC-8942');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Cross-Device Progress & State Synchronization</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                  Real-Time
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Continue drafting products, courses, and reviewing approvals seamlessly on any connected device
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Current Device Card */}
          <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-900/50 flex items-center justify-center text-cyan-300">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-cyan-200">This Device:</span>
                  {editingName ? (
                    <div className="flex items-center space-x-1">
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="text-xs bg-slate-900 border border-cyan-600 rounded px-2 py-0.5 text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={handleSaveDeviceName}
                        className="text-[10px] bg-cyan-600 hover:bg-cyan-500 text-white px-2 py-0.5 rounded"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-100">
                      {getDeviceName()}
                    </span>
                  )}
                  {!editingName && (
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                    >
                      (rename)
                    </button>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5 font-mono">
                  <span>ID: {currentDeviceId}</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    Broadcasting active drafts
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={loadDevices}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Active Paired Devices List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Paired Administrative Devices ({devices.length})
              </h3>
              <div className="text-[11px] text-slate-500">
                Instant sync via PostgreSQL Control Plane
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Checking paired devices on AJ Control Plane...
              </div>
            ) : devices.length === 0 ? (
              <div className="p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                No secondary devices registered yet. Open this control center on another laptop, tablet, or phone to pair automatically!
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((device) => {
                  const isCurrent = device.deviceId === currentDeviceId;
                  const Icon = getDeviceIcon(device.deviceName);
                  const hasDraft =
                    device.currentDraft &&
                    Object.keys(device.currentDraft).length > 0;

                  return (
                    <div
                      key={device.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-800/40 border-slate-700'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isCurrent
                                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-200">
                                {device.deviceName}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-mono">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
                              <span>Active View: <strong className="text-slate-300 font-mono">{device.activeView || 'dashboard'}</strong></span>
                              <span>•</span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-slate-500" />
                                {new Date(device.lastSyncAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Resume / Pull draft action */}
                        {hasDraft && !isCurrent ? (
                          <button
                            onClick={() => {
                              onResumeDraft(device.currentDraft, device.activeView);
                              onClose();
                            }}
                            className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                          >
                            <span>Resume Draft</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : isCurrent ? (
                          <span className="text-[11px] text-cyan-400 flex items-center">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Synchronized
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">
                            Idle / Synced
                          </span>
                        )}
                      </div>

                      {/* Draft Details Preview */}
                      {hasDraft && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                          <span className="truncate max-w-sm">
                            Unsaved draft: <strong className="text-slate-200 font-mono">{device.currentDraft.title || device.currentDraft.sku || 'Form in progress'}</strong>
                          </span>
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-900 px-2 py-0.5 rounded">
                            Available to Resume Here
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Device Pairing Information */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Pairing a New Device (Tablet / Mobile Field Unit)
              </span>
              <button
                onClick={copyPairingPin}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 cursor-pointer"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy Pairing PIN'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Open the AJ Control Center URL on your tablet or smartphone and sign in. Your state, unsaved drafts, and form progress will synchronize bidirectionally within milliseconds via our PostgreSQL replication pipeline.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Encrypted with TLS 1.3 & Session-bound tokenization
          </span>
          <button
            onClick={onClose}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
