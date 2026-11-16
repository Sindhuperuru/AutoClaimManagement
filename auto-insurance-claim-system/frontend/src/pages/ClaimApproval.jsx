import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { officerAPI, claimAPI } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  CheckCircle,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  DollarSign
} from 'lucide-react';

const ClaimApproval = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(searchParams.get('claimId') || '');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [decision, setDecision] = useState('APPROVED');
  const [remarks, setRemarks] = useState('Claim satisfies all coverage eligibility parameters and repair estimates are verified.');
  const [rejectionReason, setRejectionReason] = useState('Accident caused by unapproved driver exclusion or policy violation.');
  const [claimantFaultPercentage, setClaimantFaultPercentage] = useState(0);
  const [manualOverrideAmount, setManualOverrideAmount] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    if (selectedClaimId) {
      loadClaim(selectedClaimId);
    }
  }, [selectedClaimId]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await officerAPI.getAwaitingClaims();
      const list = res.data || [];
      setClaims(list);
      if (list.length > 0 && !selectedClaimId) {
        setSelectedClaimId(String(list[0].id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadClaim = async (id) => {
    try {
      const res = await claimAPI.getById(id);
      setSelectedClaim(res.data);
      setManualOverrideAmount(res.data.estimatedDamage || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitDecision = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const payload = {
        claimId: selectedClaim.id,
        taskId: selectedClaim.currentTaskId,
        decision: decision,
        remarks: remarks,
        rejectionReason: decision === 'REJECTED' ? rejectionReason : null,
        claimantFaultPercentage: parseFloat(claimantFaultPercentage || 0),
        manualOverrideAmount: manualOverrideAmount ? parseFloat(manualOverrideAmount) : null
      };

      await officerAPI.submitReview(payload);

      setMessage(`Claim successfully adjudicated as ${decision}! Camunda BPMN workflow advanced.`);
      setTimeout(() => {
        if (decision === 'APPROVED') {
          navigate('/settlement');
        } else {
          navigate('/officer/dashboard');
        }
      }, 1500);
    } catch (err) {
      setError(err.message || 'Adjudication submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="text-teal-600" /> Claims Officer Adjudication Center
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Camunda User Task: <strong className="font-mono text-slate-700">claimsOfficerReviewTask</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Target Claim:</label>
            <select
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              className="form-select text-xs font-mono font-bold py-1.5"
            >
              {claims.map(c => (
                <option key={c.id} value={c.id}>
                  {c.claimNumber} - {c.customerName} (${c.estimatedDamage})
                </option>
              ))}
            </select>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {selectedClaim ? (
          <form onSubmit={handleSubmitDecision} className="space-y-6">
            {/* Claim Highlights */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Claimant:</span>
                <span className="font-bold text-slate-800">{selectedClaim.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Policy &amp; Limit:</span>
                <span className="font-bold text-slate-800">${selectedClaim.sumInsured?.toLocaleString()}</span>
                <span className="text-[11px] font-mono text-slate-500 block">({selectedClaim.policyType})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Damage:</span>
                <span className="font-extrabold text-slate-900">${selectedClaim.estimatedDamage?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Risk Rating:</span>
                <RiskBadge riskLevel={selectedClaim.riskLevel} score={selectedClaim.riskScore} />
              </div>
            </div>

            {/* Decision Radio Selector */}
            <div>
              <label className="form-label text-xs">Select Adjudication Action</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className={`p-4 rounded-xl border cursor-pointer transition text-left block ${
                  decision === 'APPROVED' ? 'border-teal-600 bg-teal-50/40 ring-1 ring-teal-600' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="APPROVED"
                    checked={decision === 'APPROVED'}
                    onChange={() => setDecision('APPROVED')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 text-sm font-bold text-teal-800">
                    <CheckCircle size={18} className="text-teal-600" /> Approve Claim
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Advances to DMN Settlement Calculation &amp; Disbursement</p>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition text-left block ${
                  decision === 'INVESTIGATE' ? 'border-amber-600 bg-amber-50/40 ring-1 ring-amber-600' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="INVESTIGATE"
                    checked={decision === 'INVESTIGATE'}
                    onChange={() => setDecision('INVESTIGATE')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                    <ShieldAlert size={18} className="text-amber-600" /> Escalate to SIU
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Routes to Special Investigation task for fraud inquiry</p>
                </label>

                <label className={`p-4 rounded-xl border cursor-pointer transition text-left block ${
                  decision === 'REJECTED' ? 'border-rose-600 bg-rose-50/40 ring-1 ring-rose-600' : 'border-slate-200 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="decision"
                    value="REJECTED"
                    checked={decision === 'REJECTED'}
                    onChange={() => setDecision('REJECTED')}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-800">
                    <XCircle size={18} className="text-rose-600" /> Reject Claim
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Directs to rejection reason generation &amp; customer notification</p>
                </label>
              </div>
            </div>

            {/* Conditional Parameters for Approval */}
            {decision === 'APPROVED' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Claimant Contributory Fault (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={claimantFaultPercentage}
                    onChange={(e) => setClaimantFaultPercentage(e.target.value)}
                    className="form-input text-xs"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0% = Full settlement, 20% = Comparative reduction</span>
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-xs">Approved Settlement Base ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={manualOverrideAmount}
                    onChange={(e) => setManualOverrideAmount(e.target.value)}
                    className="form-input text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Auto-populated with initial damage estimate</span>
                </div>
              </div>
            )}

            {/* Rejection reason if rejected */}
            {decision === 'REJECTED' && (
              <div className="form-group mb-0">
                <label className="form-label text-xs">Official Rejection Regulatory Reason *</label>
                <textarea
                  rows="2"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="form-textarea text-xs"
                />
              </div>
            )}

            {/* General Remarks */}
            <div className="form-group mb-0">
              <label className="form-label text-xs">Adjudication Officer Remarks / Notes</label>
              <textarea
                rows="2"
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="form-textarea text-xs"
              />
            </div>

            {/* Action Submit */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary text-xs font-semibold px-6 flex items-center gap-2"
              >
                {submitting ? 'Executing Camunda Transition...' : 'Execute Adjudication Decision'}
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">No claim selected for adjudication.</div>
        )}
      </div>
    </div>
  );
};

export default ClaimApproval;
