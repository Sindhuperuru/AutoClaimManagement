import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { officerAPI, claimAPI } from '../services/api';
import { useAuth } from '../context/authContext';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  FileText,
  MapPin,
  Wrench,
  Search,
  Send
} from 'lucide-react';

const InvestigationDashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(searchParams.get('claimId') || '');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [form, setForm] = useState({
    siteVisitDone: true,
    thirdPartyVerified: true,
    workshopVerified: true,
    fraudRiskFlag: false,
    findings: 'Physical inspection completed at Springfield Certified Body Shop. Rear quarter panel damage consistent with reported trajectory and paint transfer marks.',
    reportSummary: 'Low risk of staged accident. Line items for bumper assembly and tailgate align with standard OEM parts catalog.'
  });

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await officerAPI.submitInvestigation({
        claimId: selectedClaim.id,
        taskId: selectedClaim.currentTaskId,
        ...form
      });

      setMessage('Special Investigation findings successfully submitted to Camunda process engine.');
      setTimeout(() => {
        navigate('/officer/approval?claimId=' + selectedClaim.id);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit investigation report');
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
              <ShieldAlert className="text-rose-600" /> Special Investigation Unit (SIU)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fraud risk evaluation and site inspection report for high/medium risk claims
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
                  {c.claimNumber} - {c.customerName} ({c.riskLevel})
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
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Incident Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Claim Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedClaim.claimNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Reported Damage:</span>
                <span className="font-extrabold text-slate-900">${selectedClaim.estimatedDamage?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">DMN Risk Classification:</span>
                <RiskBadge riskLevel={selectedClaim.riskLevel} score={selectedClaim.riskScore} />
              </div>
              <div>
                <span className="text-slate-500 block">Police FIR Report:</span>
                <span className="font-mono font-bold text-sky-800">{selectedClaim.firNumber || 'None'}</span>
              </div>
            </div>

            {/* Checkboxes for field validations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="p-3 border border-slate-200 rounded-xl flex items-center gap-2.5 bg-white cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.siteVisitDone}
                  onChange={(e) => setForm({ ...form, siteVisitDone: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin size={14} className="text-rose-500" /> Physical Site Inspection
                </span>
              </label>

              <label className="p-3 border border-slate-200 rounded-xl flex items-center gap-2.5 bg-white cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.thirdPartyVerified}
                  onChange={(e) => setForm({ ...form, thirdPartyVerified: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Search size={14} className="text-indigo-500" /> Third-Party / Witness Validated
                </span>
              </label>

              <label className="p-3 border border-slate-200 rounded-xl flex items-center gap-2.5 bg-white cursor-pointer hover:bg-slate-50 transition">
                <input
                  type="checkbox"
                  checked={form.workshopVerified}
                  onChange={(e) => setForm({ ...form, workshopVerified: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Wrench size={14} className="text-amber-500" /> Body Shop Rates Audited
                </span>
              </label>
            </div>

            {/* Fraud Risk Flag */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.fraudRiskFlag}
                  onChange={(e) => setForm({ ...form, fraudRiskFlag: e.target.checked })}
                  className="h-4 w-4 text-rose-600 rounded focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold text-rose-900 block">Flag as Suspicious / Fraudulent Staging</span>
                  <span className="text-[11px] text-rose-700">Check this box if evidence indicates intentional damage, inflated invoice, or pre-existing collisions.</span>
                </div>
              </label>
            </div>

            {/* Detailed Findings */}
            <div className="space-y-3">
              <div className="form-group mb-0">
                <label className="form-label text-xs">Investigator Detailed Findings</label>
                <textarea
                  rows="3"
                  required
                  value={form.findings}
                  onChange={(e) => setForm({ ...form, findings: e.target.value })}
                  className="form-textarea text-xs"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs">SIU Final Executive Summary</label>
                <input
                  type="text"
                  required
                  value={form.reportSummary}
                  onChange={(e) => setForm({ ...form, reportSummary: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-teal text-xs font-semibold px-6 flex items-center gap-2"
              >
                <Send size={14} /> Submit SIU Report to Claims Officer
              </button>
            </div>
          </form>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">No claim selected for investigation.</div>
        )}
      </div>
    </div>
  );
};

export default InvestigationDashboard;
