import React from 'react';
import { useAuth } from '../context/authContext';
import { Shield, RefreshCw, LogOut, CheckCircle } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, logout, switchDemoRole } = useAuth();

  const getRoleDisplay = (role) => {
    switch (role) {
      case 'ROLE_CUSTOMER':
        return { label: 'Policyholder', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ROLE_AGENT':
        return { label: 'Field Agent', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'ROLE_SURVEYOR':
        return { label: 'Certified Surveyor', color: 'bg-teal-100 text-teal-800 border-teal-300' };
      case 'ROLE_CLAIMS_OFFICER':
        return { label: 'Claims Officer', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
      case 'ROLE_ADMIN':
        return { label: 'System Admin', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'User', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  const roleInfo = getRoleDisplay(user?.role);

  return (
    <header className="topbar bg-white border-b border-slate-200">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-teal-400 shadow-sm">
          <Shield size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight">
              AutoSure
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-mono">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-500">Auto Accident Insurance Claim Management Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* 1-Click Role Switcher for Seamless Review */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 px-2 flex items-center gap-1">
            <RefreshCw size={12} /> Switch Demo Role:
          </span>
          <button
            onClick={() => switchDemoRole('ROLE_CUSTOMER')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              user?.role === 'ROLE_CUSTOMER'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => switchDemoRole('ROLE_AGENT')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              user?.role === 'ROLE_AGENT'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Agent
          </button>
          <button
            onClick={() => switchDemoRole('ROLE_SURVEYOR')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              user?.role === 'ROLE_SURVEYOR'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Surveyor
          </button>
          <button
            onClick={() => switchDemoRole('ROLE_CLAIMS_OFFICER')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              user?.role === 'ROLE_CLAIMS_OFFICER'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Officer
          </button>
          <button
            onClick={() => switchDemoRole('ROLE_ADMIN')}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition ${
              user?.role === 'ROLE_ADMIN'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Real-Time Notification Center */}
        <NotificationCenter />

        {/* User Info & Role Badge */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 leading-tight">
              {user?.fullName || user?.username}
            </p>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 border ${roleInfo.color}`}
            >
              {roleInfo.label}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100">
            {user?.fullName ? user.fullName.charAt(0) : 'U'}
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;