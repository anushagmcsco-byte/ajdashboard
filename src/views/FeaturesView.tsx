import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { FeaturePolicy, User } from '../types/index.ts';
import {
  SlidersHorizontal,
  Factory,
  GraduationCap,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
} from 'lucide-react';

interface FeaturesViewProps {
  user: User;
}

export const FeaturesView: React.FC<FeaturesViewProps> = ({ user }) => {
  const [features, setFeatures] = useState<FeaturePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'INDUSTRIAL' | 'EDUCATION'>('INDUSTRIAL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadFeatures = async () => {
    try {
      const data = await api.getFeatures();
      setFeatures(data);
    } catch (err) {
      console.error('Failed to load feature policies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const handleStateChange = async (id: number, newState: string) => {
    setUpdatingId(id);
    try {
      await api.updateFeatureState(id, newState);
      await loadFeatures();
    } catch (err: any) {
      alert('Feature policy update failed: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const states = ['ON', 'PILOT', 'INTERNAL', 'READ_ONLY', 'MAINTENANCE', 'OFF'];

  const filtered = features.filter((f) => f.siteCode === activeTab);

  const getStateBadge = (state: string) => {
    switch (state) {
      case 'ON':
        return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'PILOT':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      case 'INTERNAL':
        return 'bg-indigo-950 text-indigo-400 border-indigo-800';
      case 'READ_ONLY':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'MAINTENANCE':
        return 'bg-orange-950 text-orange-400 border-orange-800';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
            <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
            <span>Feature Policies & Dynamic Activation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational capability controls for Silphor Industrial (silphor.com) and Silphor Education (silper.co.in)
          </p>
        </div>

        <button
          onClick={loadFeatures}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center space-x-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('INDUSTRIAL')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'INDUSTRIAL'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Factory className="w-4 h-4 text-indigo-400" />
          <span>Industrial Platform Features (12)</span>
        </button>

        <button
          onClick={() => setActiveTab('EDUCATION')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'EDUCATION'
              ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Education Platform Features (22)</span>
        </button>
      </div>

      {/* Features Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase bg-slate-950/40">
                <th className="py-3 px-4">Feature Name & Key</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Current State</th>
                <th className="py-3 px-4">Updated By</th>
                <th className="py-3 px-4 text-right">Switch State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading feature policies...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No features configured for this platform.
                  </td>
                </tr>
              ) : (
                filtered.map((feature) => (
                  <tr key={feature.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-200">{feature.featureName}</div>
                      <div className="text-[10px] text-cyan-400 font-mono">
                        {feature.featureKey}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-sm">
                      {feature.description}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStateBadge(
                          feature.state
                        )}`}
                      >
                        {feature.state}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {feature.updatedBy}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <select
                        value={feature.state}
                        onChange={(e) => handleStateChange(feature.id, e.target.value)}
                        disabled={updatingId === feature.id}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                      >
                        {states.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
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
