import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  LayoutDashboard,
  FilePlus2,
  Search,
  FileCheck2,
  ShieldAlert,
  ClipboardList,
  CheckCircle,
  CreditCard,
  Users,
  Shield,
  BarChart3,
  Cpu,
  Database,
  ExternalLink,
  Wrench,
  Sparkles,
  Inbox
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-slate-800 text-teal-400 font-semibold shadow-inner border border-slate-700/60'
        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
    }`;

  return (
    <aside className="sidebar p-4 select-none bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 py-3 mb-5 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-sm">
          <Shield size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white block">AutoSure</span>
            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
              AI
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
            Enterprise Claim Engine
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {/* CUSTOMER LINKS */}
        {role === 'ROLE_CUSTOMER' && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
              Policyholder Portal
            </div>
            <NavLink to="/customer/dashboard" className={navItemClass}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/customer/submit-claim" className={navItemClass}>
              <FilePlus2 size={18} />
              <span>Submit New Claim</span>
            </NavLink>
            <NavLink to="/claims/track" className={navItemClass}>
              <Search size={18} />
              <span>Track My Claim</span>
            </NavLink>
          </>
        )}

        {/* AGENT LINKS */}
        {role === 'ROLE_AGENT' && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
              Field Agent Operations
            </div>
            <NavLink to="/agent/dashboard" className={navItemClass}>
              <LayoutDashboard size={18} />
              <span>Agent Overview</span>
            </NavLink>
            <NavLink to="/agent/verification" className={navItemClass}>
              <FileCheck2 size={18} />
              <span>Doc Verification</span>
            </NavLink>
            <NavLink to="/tasks" className={navItemClass}>
              <Inbox size={18} />
              <span>Tasklist Inbox</span>
            </NavLink>
            <NavLink to="/claims/track" className={navItemClass}>
              <Search size={18} />
              <span>Search Claim Dossier</span>
            </NavLink>
          </>
        )}

        {/* SURVEYOR LINKS */}
        {role === 'ROLE_SURVEYOR' && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
              Surveyor Workspace
            </div>
            <NavLink to="/surveyor/dashboard" className={navItemClass}>
              <Wrench size={18} />
              <span>Vehicle Inspections</span>
            </NavLink>
            <NavLink to="/tasks" className={navItemClass}>
              <Inbox size={18} />
              <span>Survey Tasklist</span>
            </NavLink>
            <NavLink to="/claims/track" className={navItemClass}>
              <Search size={18} />
              <span>Inspect Claim</span>
            </NavLink>
          </>
        )}

        {/* CLAIMS OFFICER LINKS */}
        {role === 'ROLE_CLAIMS_OFFICER' && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
              Claims Adjudication
            </div>
            <NavLink to="/officer/dashboard" className={navItemClass}>
              <ClipboardList size={18} />
              <span>Claims Queue</span>
            </NavLink>
            <NavLink to="/officer/investigations" className={navItemClass}>
              <ShieldAlert size={18} />
              <span>Fraud Investigations</span>
            </NavLink>
            <NavLink to="/officer/approval" className={navItemClass}>
              <CheckCircle size={18} />
              <span>Approve / Reject</span>
            </NavLink>
            <NavLink to="/tasks" className={navItemClass}>
              <Inbox size={18} />
              <span>Workflow Tasks</span>
            </NavLink>
            <NavLink to="/settlement" className={navItemClass}>
              <CreditCard size={18} />
              <span>Settlement Center</span>
            </NavLink>
          </>
        )}

        {/* ADMIN LINKS */}
        {role === 'ROLE_ADMIN' && (
          <>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
              Enterprise Admin
            </div>
            <NavLink to="/admin/dashboard" className={navItemClass}>
              <LayoutDashboard size={18} />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink to="/tasks" className={navItemClass}>
              <Inbox size={18} />
              <span>Global Task Inbox</span>
            </NavLink>
            <NavLink to="/surveyor/dashboard" className={navItemClass}>
              <Wrench size={18} />
              <span>Surveyor Workspace</span>
            </NavLink>
            <NavLink to="/admin/workflow" className={navItemClass}>
              <Cpu size={18} />
              <span>Workflow Monitor</span>
            </NavLink>
            <NavLink to="/admin/users" className={navItemClass}>
              <Users size={18} />
              <span>User Management</span>
            </NavLink>
            <NavLink to="/admin/policies" className={navItemClass}>
              <Shield size={18} />
              <span>Policy Registry</span>
            </NavLink>
            <NavLink to="/admin/analytics" className={navItemClass}>
              <BarChart3 size={18} />
              <span>Executive Analytics</span>
            </NavLink>
            <NavLink to="/settlement" className={navItemClass}>
              <CreditCard size={18} />
              <span>Disbursement Auth</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Camunda & SQLite Footprint info */}
      <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
        <a
          href="http://localhost:8080/camunda/app/cockpit/default/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-slate-800 text-teal-300 hover:bg-slate-700/80 transition"
        >
          <span className="flex items-center gap-2">
            <Cpu size={14} className="text-teal-400" /> Camunda Cockpit
          </span>
          <ExternalLink size={12} />
        </a>

        <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-0.5">
            <Database size={12} /> SQLite: insurance.db
          </div>
          <div className="text-[10px] text-slate-400">Claims &amp; Policies Persisted Locally</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;