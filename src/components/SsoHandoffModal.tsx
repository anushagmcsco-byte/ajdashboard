import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface SsoHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSite: 'INDUSTRIAL' | 'EDUCATION';
  deepLinkUrl?: string;
  itemTitle?: string;
}

export const SsoHandoffModal: React.FC<SsoHandoffModalProps> = ({
  isOpen,
  onClose,
  targetSite,
  deepLinkUrl,
  itemTitle,
}) => {
  const [loading, setLoading] = useState(false);
  const [handoffData, setHandoffData] = useState<{
    token: string;
    redirectUrl: string;
    expiresIn: number;
    targetSiteUrl: string;
  } | null>(null);
  const [countdown, setCountdown] = useState(300);
  const [error, setError] = useState<string | null>(null);

  const siteName =
    targetSite === 'INDUSTRIAL'
      ? 'Silphor Industrial / Partner Platform'
      : 'Silphor Education / Training Platform';

  const defaultUrl =
    targetSite === 'INDUSTRIAL'
      ? 'https://silphor.com/admin'
      : 'https://silper.co.in/admin';

  const effectiveRedirectUrl = deepLinkUrl || defaultUrl;

  const generateTicket = async () => {
    setLoading(true);
    setError(null);
    try {
      if (targetSite === 'INDUSTRIAL') {
        const res = await api.startIndustrialSso(effectiveRedirectUrl);
        setHandoffData({
          token: res.handoffToken,
          redirectUrl: res.redirectUrl,
          expiresIn: res.expiresInSeconds,
          targetSiteUrl: res.targetSite,
        });
      } else {
        const res = await api.startEducationSso(effectiveRedirectUrl);
        setHandoffData({
          token: res.handoffToken,
          redirectUrl: res.redirectUrl,
          expiresIn: res.expiresInSeconds,
          targetSiteUrl: res.targetSite,
        });
      }
      setCountdown(300);
    } catch (err: any) {
      setError(err.message || 'Failed to generate SSO ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateTicket();
    } else {
      setHandoffData(null);
    }
  }, [isOpen, targetSite, deepLinkUrl]);

  useEffect(() => {
    if (!handoffData || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [handoffData, countdown]);

  if (!isOpen) return null;

  const openTarget = () => {
    if (handoffData?.redirectUrl) {
      window.open(handoffData.redirectUrl, '_blank', 'noopener,noreferrer');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                targetSite === 'INDUSTRIAL'
                  ? 'bg-indigo-950 text-indigo-400 border border-indigo-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Secure SSO Handoff Bridge</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                  OIDC / Token Handoff
                </span>
              </h2>
              <p className="text-xs text-slate-400">{siteName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error ? (
            <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">SSO Authentication Handoff Error</div>
                <div>{error}</div>
              </div>
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <KeyRound className="w-8 h-8 animate-bounce mx-auto mb-2 text-cyan-400" />
              Generating signed, audience-restricted one-time handoff ticket...
            </div>
          ) : (
            <>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target System:</span>
                  <span className="font-bold text-slate-200">{siteName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Target URL:</span>
                  <span className="font-mono text-cyan-400 text-[11px] truncate max-w-xs">
                    {effectiveRedirectUrl}
                  </span>
                </div>
                {itemTitle && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Synchronized Item:</span>
                    <span className="font-semibold text-slate-200 truncate max-w-xs">
                      {itemTitle}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    One-time Token Expiry:
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.floor(countdown / 60)}:
                    {(countdown % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Security Boundary Clarification (Prompt #17 & #35) */}
              <div className="p-3.5 bg-blue-950/30 border border-blue-900/60 rounded-xl text-[11px] text-blue-300 space-y-1">
                <div className="font-semibold flex items-center text-blue-200">
                  <Lock className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  Zero-Knowledge Architectural Boundary
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Your AJ administrative credentials and master password are never transmitted or shared with external platforms. A cryptographically signed, single-use ticket will authenticate your session on the target admin portal.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-3 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={openTarget}
            disabled={loading || !handoffData}
            className={`flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-lg text-white transition-all cursor-pointer shadow-lg ${
              targetSite === 'INDUSTRIAL'
                ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
            }`}
          >
            <span>Launch External Admin</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
