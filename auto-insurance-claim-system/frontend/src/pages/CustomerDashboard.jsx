import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { claimAPI, policyAPI, notificationAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import {
  FilePlus2,
  Search,
  Shield,
  Car,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  FileText,
  Calendar,
  DollarSign,
  Upload,
  History,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [claimsRes, policiesRes] = await Promise.all([
        claimAPI.getAll(),
        policyAPI.getAll()
      ]);
      const claimsList = claimsRes.data || (Array.isArray(claimsRes) ? claimsRes : []);
      const policiesList = policiesRes.data || (Array.isArray(policiesRes) ? policiesRes : []);
      setClaims(claimsList);
      setPolicies(policiesList);
    } catch (err) {
      console.error('Error loading customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute stat metrics (Mandated by Section 3)
  const totalClaims = claims.length;
  const pendingClaims = claims.filter(c =>
    ['SUBMITTED', 'UNDER_AGENT_REVIEW', 'DOCUMENTS_PENDING', 'UNDER_ASSESSMENT', 'UNDER_INVESTIGATION', 'UNDER_OFFICER_REVIEW'].includes(c.status)
  ).length;
  const approvedClaims = claims.filter(c => ['APPROVED', 'SETTLED'].includes(c.status)).length;
  const rejectedClaims = claims.filter(c => c.status === 'REJECTED').length;

  const filteredClaims = activeTab === 'ALL'
    ? claims
    : activeTab === 'PENDING'
    ? claims.filter(c => ['SUBMITTED', 'UNDER_AGENT_REVIEW', 'DOCUMENTS_PENDING', 'UNDER_ASSESSMENT', 'UNDER_INVESTIGATION', 'UNDER_OFFICER_REVIEW'].includes(c.status))
    : activeTab === 'APPROVED'
    ? claims.filter(c => ['APPROVED', 'SETTLED'].includes(c.status))
    : claims.filter(c => c.status === 'REJECTED');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Welcome Message & Top Hero Banner (Mandated by Section 3) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-teal-400 font-bold text-xs tracking-wider uppercase font-mono bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
              Policyholder Portal
            </span>
            <span className="text-slate-400 text-xs">Customer ID: #{user?.customerId || '101'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.fullName || 'Johnathan Doe'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Your vehicles are protected under AutoSure comprehensive coverage. Track real-time AI damage valuations, upload mandatory claims evidence, and monitor settlement disbursements.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/customer/submit-claim"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 shadow-sm transition flex items-center gap-2"
          >
            <FilePlus2 size={16} /> File New Claim
          </Link>
          <Link
            to="/claims/track"
            className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 border border-slate-700 hover:bg-slate-800 transition flex items-center gap-2"
          >
            <Search size={16} /> Track Status
          </Link>
        </div>
      </div>

      {/* 2. Metric Stat Cards (Mandated by Section 3) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Claims</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileText size={18} />
            </span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalClaims}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime filed incidents</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/60 bg-amber-50/20 shadow-xs hover:border-amber-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Claims</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock size={18} />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-800 mt-2">{pendingClaims}</div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">Under Agent/Surveyor review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs hover:border-emerald-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved Claims</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle size={18} />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-800 mt-2">{approvedClaims}</div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Disbursement cleared</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/60 bg-rose-50/20 shadow-xs hover:border-rose-300 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Rejected Claims</span>
            <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle size={18} />
            </span>
          </div>
          <div className="text-3xl font-black text-rose-800 mt-2">{rejectedClaims}</div>
          <span className="text-[11px] text-rose-700 font-medium mt-1 block">Ineligible or disputed</span>
        </div>
      </div>

      {/* 3. Dashboard Action Cards (Mandated by Section 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <a
          href="#policies-section"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition text-center group flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800 block">My Policies</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Coverage &amp; Vehicles</span>
        </a>

        <Link
          to="/customer/submit-claim"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition text-center group flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <FilePlus2 size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Submit Claim</span>
          <span className="text-[10px] text-slate-400 mt-0.5">5-Step Filing</span>
        </Link>

        <Link
          to="/claims/track"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition text-center group flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <Search size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Track My Claim</span>
          <span className="text-[10px] text-slate-400 mt-0.5">9-Stage Timeline</span>
        </Link>

        <Link
          to="/customer/submit-claim"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition text-center group flex flex-col items-center"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <Upload size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Upload Docs</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Photos &amp; FIR</span>
        </Link>

        <a
          href="#claims-table-section"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-teal-500 hover:shadow-md transition text-center group flex flex-col items-center col-span-2 sm:col-span-1"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition">
            <History size={20} />
          </div>
          <span className="text-xs font-bold text-slate-800 block">Claim History</span>
          <span className="text-[10px] text-slate-400 mt-0.5">Logs &amp; Payouts</span>
        </a>
      </div>

      {/* 4. Active Insurance Policy Details (Mandated by Section 3) */}
      <div id="policies-section" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield size={18} className="text-teal-600" /> Active Insurance Policy Coverage
            </h2>
            <p className="text-xs text-slate-500">
              Your registered vehicle policies with deductible details and validity schedules
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200 self-start sm:self-auto font-mono">
            {policies.length} Active {policies.length === 1 ? 'Policy' : 'Policies'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-400 hover:shadow-sm transition space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono font-bold text-xs text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    {p.policyNumber}
                  </span>
                  <div className="font-bold text-base text-slate-900 mt-2">
                    {p.vehicle?.make} {p.vehicle?.model}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Plate: <strong className="text-slate-800">{p.vehicle?.registrationNumber}</strong> &bull; Year: {p.vehicle?.yearOfManufacture}
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                  {p.status || 'ACTIVE'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Sum Insured</span>
                  <span className="font-black text-slate-900">${p.sumInsured?.toLocaleString()}</span>
                </div>
                <div className="border-x border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Deductible</span>
                  <span className="font-black text-amber-700">${p.deductibleAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Policy Validity</span>
                  <span className="font-semibold text-slate-700 font-mono text-[11px]">
                    {p.startDate} &rarr; {p.endDate}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                &ldquo;{p.coverageDetails || 'Full comprehensive collision and roadside assistance shield.'}&rdquo;
              </p>

              <div className="pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Policy Type: <strong>{p.policyType}</strong></span>
                <Link
                  to="/customer/submit-claim"
                  className="font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                >
                  File Claim on this Policy <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Recent Claims Table (Mandated by Section 3) */}
      <div id="claims-table-section" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History size={18} className="text-teal-600" /> Recent Claims History
            </h2>
            <p className="text-xs text-slate-500">
              Live claims tracking, status transitions, and insurance loss settlement amounts
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              All ({claims.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'PENDING' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Pending ({pendingClaims})
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'APPROVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Approved ({approvedClaims})
            </button>
            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3 py-1 rounded-lg font-bold transition ${activeTab === 'REJECTED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'}`}
            >
              Rejected ({rejectedClaims})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading claims record...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle size={32} className="mx-auto text-teal-500" />
            <p className="font-semibold text-slate-700">No insurance claims found in this category.</p>
            <Link to="/customer/submit-claim" className="btn btn-teal text-xs inline-flex mt-2">
              Submit New Accident Claim
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Accident Date</th>
                  <th>Vehicle Number</th>
                  <th>Claim Type</th>
                  <th>Claim Amount</th>
                  <th>Current Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="font-mono font-bold text-teal-800">
                      {c.claimNumber}
                    </td>
                    <td className="text-xs text-slate-600">
                      {c.accidentDateTime ? c.accidentDateTime.slice(0, 10) : '2026-11-16'}
                    </td>
                    <td className="font-mono text-xs font-semibold text-slate-800">
                      {c.vehicleRegistration || 'IL-984-XYZ'}
                    </td>
                    <td>
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {c.accidentType || 'COLLISION'}
                      </span>
                    </td>
                    <td className="font-mono font-bold text-slate-900 text-sm">
                      ${c.estimatedDamage?.toLocaleString() || '1,500'}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/claims/track?number=${c.claimNumber}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
                      >
                        View Details <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;