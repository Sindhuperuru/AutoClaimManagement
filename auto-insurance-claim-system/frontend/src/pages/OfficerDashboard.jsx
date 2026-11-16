import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { officerAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import {
  ClipboardList,
  ShieldAlert,
  CheckCircle,
  Filter,
  ArrowRight,
  Clock,
  Car
} from 'lucide-react';

const OfficerDashboard = () => {
  const [claims, setClaims] = useState([]);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await officerAPI.getAwaitingClaims();
      setClaims(res.data || []);
    } catch (err) {
      console.error('Failed to load officer claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = claims.filter(c => {
    if (riskFilter === 'ALL') return true;
    return c.riskLevel?.toUpperCase() === riskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Officer Header */}
      <div className="bg-[#0f2942] text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-teal-400 font-bold text-xs uppercase tracking-wider">Claims Assessment Department</span>
          <h1 className="text-2xl font-bold mt-1">Senior Claims Officer Workspace</h1>
          <p className="text-slate-300 text-xs mt-1">
            Review DMN evaluated accident claims, analyze risk flags, and grant final claim approval or escalate for fraud investigation.
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/officer/approval" className="btn btn-teal text-xs font-semibold">
            <CheckCircle size={14} /> Claim Approval Center
          </Link>
          <Link to="/officer/investigations" className="btn btn-outline text-white border-white/30 text-xs">
            <ShieldAlert size={14} /> SIU Investigations
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <span className="text-xs font-semibold text-slate-500 uppercase">Awaiting Officer Decision</span>
          <p className="text-2xl font-extrabold text-sky-700 mt-1">{claims.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Active Queue</p>
        </div>

        <div className="card">
          <span className="text-xs font-semibold text-slate-500 uppercase">Low Risk Fast-Track</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {claims.filter(c => c.riskLevel === 'LOW').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">DMN Score &lt; 25</p>
        </div>

        <div className="card">
          <span className="text-xs font-semibold text-slate-500 uppercase">Medium Risk Review</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            {claims.filter(c => c.riskLevel === 'MEDIUM').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">DMN Score 25 - 65</p>
        </div>

        <div className="card">
          <span className="text-xs font-semibold text-slate-500 uppercase">High Risk / Fraud Alert</span>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {claims.filter(c => c.riskLevel === 'HIGH').length}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">SIU Triggered</p>
        </div>
      </div>

      {/* Claims Queue */}
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList size={16} className="text-sky-600" /> Claims Awaiting Formal Adjudication
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Camunda Process: <code className="font-mono text-slate-700">claimsOfficerReviewTask</code></p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 px-1.5 flex items-center gap-1">
              <Filter size={12} /> Risk Filter:
            </span>
            {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskFilter(r)}
                className={`px-2.5 py-1 rounded font-semibold transition text-xs ${
                  riskFilter === r
                    ? 'bg-[#0f2942] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading claims assessment queue...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <CheckCircle size={32} className="mx-auto text-teal-500 mb-2" />
            <p className="font-semibold text-slate-700">No claims currently pending officer review under selected filter.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Claim Number</th>
                  <th>Claimant</th>
                  <th>Vehicle</th>
                  <th>Damage Estimate</th>
                  <th>DMN Risk Rating</th>
                  <th>FIR / Police</th>
                  <th>Workflow Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr key={claim.id}>
                    <td>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {claim.claimNumber}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-800 text-xs">{claim.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{claim.policyNumber}</div>
                    </td>
                    <td>
                      <div className="text-xs font-medium text-slate-700">{claim.vehicleMakeModel}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{claim.vehicleRegistration}</div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-900 text-xs">
                        ${claim.estimatedDamage?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <RiskBadge riskLevel={claim.riskLevel} score={claim.riskScore} />
                    </td>
                    <td>
                      <span className={`text-xs font-mono font-semibold ${
                        claim.firNumber ? 'text-sky-700' : 'text-slate-400'
                      }`}>
                        {claim.firNumber || 'Waived'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td>
                      <Link
                        to={`/officer/approval?claimId=${claim.id}`}
                        className="btn btn-primary py-1 px-3 text-xs font-semibold flex items-center gap-1"
                      >
                        Adjudicate <ArrowRight size={12} />
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

export default OfficerDashboard;
