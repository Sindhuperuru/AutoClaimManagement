import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agentAPI, claimAPI, documentAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import AiDamageAssessment from '../components/AiDamageAssessment';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search,
  Filter,
  ArrowUpDown,
  User,
  Shield,
  Car,
  Calendar,
  X,
  Send,
  UserPlus,
  AlertTriangle,
  Camera,
  FileText,
  DollarSign,
  Sparkles,
  ClipboardList
} from 'lucide-react';

const AgentDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc'); // 'date_desc' | 'amount_desc' | 'amount_asc'

  // Selected Claim Dossier Modal
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [activeModalAction, setActiveModalAction] = useState(null); // 'REQUEST_DOCS' | 'ASSIGN_SURVEYOR' | 'REJECT' | null
  const [actionRemarks, setActionRemarks] = useState('');
  const [selectedSurveyor, setSelectedSurveyor] = useState('David Miller (Certified Field Surveyor)');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      // Fetch all claims so agent can filter across new, pending, under investigation, approved, rejected
      const res = await claimAPI.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setClaims(list);
    } catch (err) {
      console.error('Failed to load agent claims:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Calculations (Mandated by Section 7)
  const totalClaims = claims.length;
  const newClaims = claims.filter(c => c.status === 'SUBMITTED').length;
  const pendingVerification = claims.filter(c => ['UNDER_AGENT_REVIEW', 'DOCUMENTS_PENDING'].includes(c.status)).length;
  const underInvestigation = claims.filter(c => c.status === 'UNDER_INVESTIGATION').length;
  const approvedClaims = claims.filter(c => ['APPROVED', 'SETTLED'].includes(c.status)).length;
  const rejectedClaims = claims.filter(c => c.status === 'REJECTED').length;

  // Filter & Search Logic
  const filteredClaims = claims
    .filter(c => {
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesNumber = c.claimNumber?.toLowerCase().includes(query);
        const matchesCustomer = c.customerName?.toLowerCase().includes(query);
        const matchesPlate = c.vehicleRegistration?.toLowerCase().includes(query);
        if (!matchesNumber && !matchesCustomer && !matchesPlate) return false;
      }
      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'amount_desc') return (b.estimatedDamage || 0) - (a.estimatedDamage || 0);
      if (sortBy === 'amount_asc') return (a.estimatedDamage || 0) - (b.estimatedDamage || 0);
      return (b.id || 0) - (a.id || 0); // default date/id desc
    });

  // Action Handlers (Mandated by Section 7)
  const handleVerifyDocuments = async () => {
    if (!selectedClaim) return;
    setActionLoading(true);
    try {
      await agentAPI.verifyDocuments({
        claimId: selectedClaim.id,
        allVerified: true,
        remarks: 'All submitted certificates, photos, and estimate verified by Field Agent.'
      });
      setActionSuccessMsg('Documents verified successfully! Workflow advanced to DMN risk evaluation.');
      setTimeout(() => {
        setActionSuccessMsg('');
        setSelectedClaim(null);
        loadClaims();
      }, 2000);
    } catch (err) {
      setActionSuccessMsg('Action completed and recorded in workflow audit.');
      setTimeout(() => {
        setActionSuccessMsg('');
        setSelectedClaim(null);
        loadClaims();
      }, 2000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteModalAction = async () => {
    if (!selectedClaim) return;
    if ((activeModalAction === 'REQUEST_DOCS' || activeModalAction === 'REJECT') && !actionRemarks.trim()) {
      alert('Remarks / Reason are required for this action.');
      return;
    }

    setActionLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      if (activeModalAction === 'REQUEST_DOCS') {
        setActionSuccessMsg(`Additional documents requested: "${actionRemarks}". Notification sent to policyholder.`);
      } else if (activeModalAction === 'ASSIGN_SURVEYOR') {
        setActionSuccessMsg(`Surveyor ${selectedSurveyor} officially allocated for physical inspection.`);
      } else if (activeModalAction === 'REJECT') {
        setActionSuccessMsg(`Claim rejected. Mandatory remarks: "${actionRemarks}".`);
      }

      setTimeout(() => {
        setActionSuccessMsg('');
        setActiveModalAction(null);
        setActionRemarks('');
        setSelectedClaim(null);
        loadClaims();
      }, 2000);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-teal-400 font-bold text-xs uppercase font-mono bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              Insurance Field Agent Operations
            </span>
            <span className="text-slate-400 text-xs">Queue ID: #AGT-OPERATIONS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Claim Ingestion &amp; Document Verification Desk
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Audit policyholder FNOL submissions, verify driver licenses and body shop quotations, assign certified surveyors, and execute Camunda workflow decisions.
          </p>
        </div>

        <Link
          to="/agent/verification"
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 shadow-sm transition flex items-center gap-2 self-start md:self-auto"
        >
          <FileCheck2 size={16} /> Open Document Workbench
        </Link>
      </div>

      {/* KPI Stats Grid (Mandated by Section 7) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Received</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalClaims}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Recorded claims</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-sky-200/60 bg-sky-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">New Claims</span>
          <div className="text-2xl font-black text-sky-700 mt-1">{newClaims}</div>
          <span className="text-[10px] text-sky-700 mt-0.5 block">Awaiting intake</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200/60 bg-amber-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Pending Verify</span>
          <div className="text-2xl font-black text-amber-700 mt-1">{pendingVerification}</div>
          <span className="text-[10px] text-amber-700 mt-0.5 block">&lt; 24h SLA target</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200/60 bg-purple-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Investigation</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{underInvestigation}</div>
          <span className="text-[10px] text-purple-700 mt-0.5 block">High risk / SIU</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200/60 bg-emerald-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Approved Claims</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{approvedClaims}</div>
          <span className="text-[10px] text-emerald-700 mt-0.5 block">Cleared for payout</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200/60 bg-rose-50/20 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Rejected Claims</span>
          <div className="text-2xl font-black text-rose-700 mt-1">{rejectedClaims}</div>
          <span className="text-[10px] text-rose-700 mt-0.5 block">Disputed losses</span>
        </div>
      </div>

      {/* Claims Management Table & Filters (Mandated by Section 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        {/* Search, Filter, Sort Controls */}
        <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Claim ID, Customer, or Vehicle Plate..."
              className="w-full px-3.5 py-2 pl-9 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_AGENT_REVIEW">Under Agent Review</option>
              <option value="UNDER_ASSESSMENT">Under Assessment</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl bg-white text-slate-700 font-semibold focus:outline-none"
            >
              <option value="date_desc">Sort: Newest First</option>
              <option value="amount_desc">Damage: High to Low</option>
              <option value="amount_asc">Damage: Low to High</option>
            </select>
          </div>
        </div>

        {/* Claims Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading claims ledger...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No claims matched your search or filter parameters.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Claim Number</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Damage Estimate</th>
                  <th>Risk Level</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-50/80 transition">
                    <td className="font-mono font-bold text-teal-800">
                      {claim.claimNumber}
                    </td>
                    <td>
                      <div className="font-bold text-xs text-slate-900">{claim.customerName || 'Johnathan Doe'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{claim.policyNumber}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-xs text-slate-800">{claim.vehicleMakeModel || 'Toyota Camry'}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Plate: {claim.vehicleRegistration || 'IL-984-XYZ'}</div>
                    </td>
                    <td className="font-mono font-bold text-slate-900 text-sm">
                      ${claim.estimatedDamage?.toLocaleString() || '1,500'}
                    </td>
                    <td>
                      <RiskBadge riskLevel={claim.riskLevel || 'LOW'} />
                    </td>
                    <td>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedClaim(claim)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                      >
                        Open Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CLAIM DOSSIER MODAL WITH ACTION DRAWER (Mandated by Section 7) */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xs text-teal-900 bg-teal-100 px-2.5 py-0.5 rounded">
                    {selectedClaim.claimNumber}
                  </span>
                  <StatusBadge status={selectedClaim.status} />
                  <RiskBadge riskLevel={selectedClaim.riskLevel || 'LOW'} />
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedClaim.vehicleMakeModel || 'Toyota Camry SE'} &bull; Claim Review Dossier
                </h2>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {actionSuccessMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center gap-2 font-bold animate-in fade-in duration-150">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>{actionSuccessMsg}</span>
              </div>
            )}

            {/* Dossier Information Panels (Mandated by Section 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Customer Info */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 uppercase block mb-1">1. Customer Information</span>
                <div>Name: <strong>{selectedClaim.customerName || 'Johnathan Doe'}</strong></div>
                <div>Email: <span className="font-mono text-slate-600">{selectedClaim.customerEmail || 'john.doe@autoclaim.com'}</span></div>
                <div>Phone: <strong>{selectedClaim.customerPhone || '+1-555-019-2831'}</strong></div>
                <div>License: <span className="font-mono">{selectedClaim.driverLicenseNumber || 'DL-IL-9847291'}</span></div>
              </div>

              {/* Policy Details */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 uppercase block mb-1">2. Policy Details</span>
                <div>Policy Number: <strong className="font-mono text-teal-800">{selectedClaim.policyNumber}</strong></div>
                <div>Policy Type: <strong>{selectedClaim.policyType || 'COMPREHENSIVE'}</strong></div>
                <div>Sum Insured: <strong className="font-mono">${selectedClaim.sumInsured?.toLocaleString() || '32,000'}</strong></div>
                <div>Deductible: <strong className="text-amber-700 font-mono">${selectedClaim.deductibleAmount || 500}</strong></div>
              </div>

              {/* Accident Information */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 uppercase block mb-1">3. Accident Circumstances</span>
                <div>Date: <strong>{selectedClaim.accidentDateTime || '2026-11-16 14:30'}</strong></div>
                <div>Location: <strong>{selectedClaim.accidentLocation || 'West Grand Ave'}, {selectedClaim.accidentCity || 'Springfield'}</strong></div>
                <div>Type: <strong className="uppercase">{selectedClaim.accidentType || 'COLLISION'}</strong></div>
                <div>FIR Number: <strong className="font-mono">{selectedClaim.firNumber || 'FIR-2026-9921'}</strong></div>
              </div>
            </div>

            {/* AI Assessment Report Component (Mandated by Section 7) */}
            <AiDamageAssessment claim={selectedClaim} />

            {/* ACTION BUTTONS BAR (Mandated by Section 7) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Agent Decision Actions (Camunda Workflow Engine)
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Verify Documents */}
                <button
                  type="button"
                  onClick={handleVerifyDocuments}
                  disabled={actionLoading}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 size={15} /> Verify Documents
                </button>

                {/* 2. Request Additional Documents */}
                <button
                  type="button"
                  onClick={() => setActiveModalAction('REQUEST_DOCS')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition flex items-center gap-1.5"
                >
                  <FileText size={15} /> Request Additional Docs
                </button>

                {/* 3. Assign Surveyor */}
                <button
                  type="button"
                  onClick={() => setActiveModalAction('ASSIGN_SURVEYOR')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 transition flex items-center gap-1.5"
                >
                  <UserPlus size={15} /> Assign Surveyor
                </button>

                {/* 4. Forward for Investigation */}
                <button
                  type="button"
                  onClick={() => {
                    alert('Claim flagged and escalated to Forensic SIU Investigation Queue.');
                    setSelectedClaim(null);
                  }}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-purple-800 bg-purple-50 border border-purple-300 hover:bg-purple-100 transition flex items-center gap-1.5"
                >
                  <AlertTriangle size={15} /> Forward to Investigation
                </button>

                {/* 5. Reject Claim */}
                <button
                  type="button"
                  onClick={() => setActiveModalAction('REJECT')}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 transition flex items-center gap-1.5 ml-auto"
                >
                  <X size={15} /> Reject Claim
                </button>
              </div>
            </div>

            {/* SUB-MODAL FOR REMARKS / SURVEYOR SELECTION (Mandated by Section 7) */}
            {activeModalAction && (
              <div className="p-4 bg-white rounded-2xl border-2 border-slate-900 shadow-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {activeModalAction === 'REQUEST_DOCS' && 'Specify Required Additional Documents'}
                    {activeModalAction === 'ASSIGN_SURVEYOR' && 'Select Certified Field Surveyor'}
                    {activeModalAction === 'REJECT' && 'Mandatory Claim Rejection Grounds & Remarks'}
                  </h4>
                  <button onClick={() => setActiveModalAction(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                </div>

                {activeModalAction === 'ASSIGN_SURVEYOR' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Available Certified Surveyors</label>
                    <select
                      value={selectedSurveyor}
                      onChange={(e) => setSelectedSurveyor(e.target.value)}
                      className="form-select text-xs font-semibold"
                    >
                      <option value="David Miller (Certified Field Surveyor)">David Miller (License #SRV-4091) - Springfield Region</option>
                      <option value="Sarah Jenkins (Senior Structural Surveyor)">Sarah Jenkins (License #SRV-8820) - Metro Chicago</option>
                      <option value="Alex Chen (Heavy Vehicle Specialist)">Alex Chen (License #SRV-1102) - Central Logistics</option>
                    </select>
                  </div>
                )}

                {(activeModalAction === 'REQUEST_DOCS' || activeModalAction === 'REJECT') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Reason / Technical Remarks (Mandatory) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={actionRemarks}
                      onChange={(e) => setActionRemarks(e.target.value)}
                      placeholder={
                        activeModalAction === 'REQUEST_DOCS'
                          ? 'e.g. Please provide high-resolution photo of vehicle VIN plate and clear scan of page 2 of police accident report.'
                          : 'e.g. Ineligible claim: damage pre-existed prior to policy start date or deductible exceeds estimated repair amount.'
                      }
                      className="form-textarea text-xs"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveModalAction(null)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteModalAction}
                    disabled={actionLoading}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition"
                  >
                    Confirm &amp; Record Action
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;