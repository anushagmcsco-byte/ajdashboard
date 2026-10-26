import React, { useState } from 'react';
import { api, setStoredToken, setDeviceName, getDeviceName } from '../services/api.ts';
import { User } from '../types/index.ts';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  KeyRound,
  ArrowRight,
  Server,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('anusha.gmcsco@gmail.com');
  const [password, setPassword] = useState('AJSuperAdmin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA State
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('123456');
  const [deviceName, setDeviceNameInput] = useState(getDeviceName());
  const [demoHint, setDemoHint] = useState<string | null>(null);

  const handleInitialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      if (res.mfaRequired) {
        setMfaStep(true);
        setDemoHint(res.demoTotpHint);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.verifyMfa({
        email,
        code: mfaCode,
        deviceName: deviceName.trim() || 'Workstation Hubli',
      });
      setStoredToken(res.token);
      setDeviceName(deviceName.trim() || 'Workstation Hubli');
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid MFA code. Enter 6 numeric digits.');
    } finally {
      setLoading(false);
    }
  };

  const selectDemoRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
    setMfaStep(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-xl shadow-cyan-500/20 text-white font-extrabold text-2xl tracking-wider mb-2">
            AJ
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 uppercase">
            AJ Enterprise Solutions
          </h1>
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-widest">
            Hubli Operations HQ
          </p>
          <div className="inline-block mt-1 bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full font-medium">
            Silphor Platform Control Center
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!mfaStep ? (
            /* Step 1: Username & Password */
            <form onSubmit={handleInitialLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@ajenterprises.hubli.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Control Password
                  </label>
                  <span className="text-[10px] text-slate-500">Argon2id Enforced</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer mt-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Verify Credentials & Continue to MFA</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: MFA Step */
            <form onSubmit={handleVerifyMfa} className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 space-y-1">
                <div className="font-semibold flex items-center">
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  MFA Challenge Required
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter the 6-digit TOTP authenticator code from your security token or hardware authenticator.
                </p>
                {demoHint && (
                  <p className="text-[10px] text-cyan-400 font-mono pt-1">
                    Demo Token Hint: {demoHint}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit Authenticator Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  required
                  placeholder="123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold text-cyan-400 tracking-widest placeholder-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Register Current Device (Multi-Device Sync)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceNameInput(e.target.value)}
                    required
                    placeholder="e.g. Workstation Hubli #1"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMfaStep(false)}
                  className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || mfaCode.length !== 6}
                  className="w-2/3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  {loading ? (
                    <span>Verifying...</span>
                  ) : (
                    <>
                      <span>Complete Login</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick-Fill Presets for Testing Roles */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Role Switcher Presets
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() =>
                  selectDemoRole('anusha.gmcsco@gmail.com', 'AJSuperAdmin@2026!')
                }
                className="text-[10px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-700 rounded-lg text-slate-300 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-emerald-400 truncate">Executive Admin</div>
                <div className="text-[9px] text-slate-400 truncate">anusha.gmcsco</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  selectDemoRole('admin@ajenterprises.hubli.in', 'AJSuperAdmin@2026!')
                }
                className="text-[10px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-700 rounded-lg text-slate-300 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-cyan-400 truncate">Super Admin</div>
                <div className="text-[9px] text-slate-400">Full Access</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  selectDemoRole('industrial.lead@ajenterprises.hubli.in', 'AJIndustrial@2026!')
                }
                className="text-[10px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-700 rounded-lg text-slate-300 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-indigo-400 truncate">Industrial</div>
                <div className="text-[9px] text-slate-400">silphor.com</div>
              </button>

              <button
                type="button"
                onClick={() =>
                  selectDemoRole('education.lead@ajenterprises.hubli.in', 'AJEducation@2026!')
                }
                className="text-[10px] p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-700 rounded-lg text-slate-300 text-left transition-all cursor-pointer"
              >
                <div className="font-bold text-amber-400 truncate">Education</div>
                <div className="text-[9px] text-slate-400">silper.co.in</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security Baseline Footer */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Strict RBAC • PostgreSQL Control Plane • Tamper-Evident Audit</span>
          </div>
          <div>AJ Enterprise Solutions, Hubli • Silphor Platform Control</div>
        </div>
      </div>
    </div>
  );
};
