import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  Sparkles,
  KeyRound,
  Wrench,
  UserCheck,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('customer1');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, switchDemoRole, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const authData = await login(username, password);
      redirectByRole(authData.role);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    try {
      const authData = await switchDemoRole(role);
      redirectByRole(authData.role);
    } catch (err) {
      setError(err.message || 'Quick login failed');
    }
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'ROLE_CUSTOMER':
        navigate('/customer/dashboard');
        break;
      case 'ROLE_AGENT':
        navigate('/agent/dashboard');
        break;
      case 'ROLE_SURVEYOR':
        navigate('/surveyor/dashboard');
        break;
      case 'ROLE_CLAIMS_OFFICER':
        navigate('/officer/dashboard');
        break;
      case 'ROLE_ADMIN':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/customer/dashboard');
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-teal-400 shadow-lg mb-4 ring-4 ring-slate-100">
          <Shield size={34} className="stroke-[2.5]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">AutoSure</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-mono">
            AI Powered
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Auto Accident Insurance Claim Management System
        </p>
        <div className="inline-flex items-center gap-1.5 text-[11px] text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mt-2 font-mono">
          <Database size={12} className="text-teal-600" /> Camunda 7 BPMN &bull; SQLite Persistence
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 text-sm border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                  placeholder="e.g. customer1 or john.doe@autoclaim.com"
                />
                <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pl-10 pr-10 text-sm border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition"
                  placeholder="Enter password"
                />
                <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                />
                <span className="font-medium text-slate-600">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="font-semibold text-teal-700 hover:text-teal-900 transition"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to AutoSure <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center text-xs text-slate-500 pt-1">
            New policyholder?{' '}
            <Link to="/register" className="font-bold text-teal-700 hover:text-teal-900">
              Register as a new policyholder
            </Link>
          </div>

          {/* Quick Demo Switcher (Mandated by Section 2: Role-based login) */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              1-Click Role-Based Quick Login
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_CUSTOMER')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  C
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-teal-700">Customer</div>
                  <div className="text-[10px] text-slate-400">Johnathan Doe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_AGENT')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  A
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-teal-700">Agent</div>
                  <div className="text-[10px] text-slate-400">Robert Vance</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_SURVEYOR')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  S
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-teal-700">Surveyor</div>
                  <div className="text-[10px] text-slate-400">David Miller</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ROLE_ADMIN')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  AD
                </div>
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-teal-700">Admin</div>
                  <div className="text-[10px] text-slate-400">Marcus Sterling</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound size={18} className="text-teal-600" /> Reset Your Password
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">Reset Link Dispatched</h4>
                <p className="text-xs text-slate-500">
                  Password reset instructions sent to <strong>{forgotEmail}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the email address tied to your AutoSure insurance profile. We will generate a secure reset link.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="e.g. john.doe@autoclaim.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;