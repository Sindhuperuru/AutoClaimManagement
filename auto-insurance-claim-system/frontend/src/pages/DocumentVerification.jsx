import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { agentAPI, claimAPI } from '../services/api';
import { useAuth } from '../context/authContext';
import StatusBadge from '../components/StatusBadge';
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  ArrowRight,
  ShieldAlert,
  Send
} from 'lucide-react';

const DocumentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingClaims, setPendingClaims] = useState([]);
  const [selectedClaimId, setSelectedClaimId] = useState(searchParams.get('claimId') || '');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [docDecisions, setDocDecisions] = useState({});
  const [agentRemarks, setAgentRemarks] = useState('All 5 mandatory documents checked and validated against DMV and insurance records.');
  const [missingReason, setMissingReason] = useState('Please provide an official authorized workshop repair estimate.');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    if (selectedClaimId) {
      loadClaimDetails(selectedClaimId);
    }
  }, [selectedClaimId]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const res = await agentAPI.getPendingClaims();
      const list = res.data || [];
      setPendingClaims(list);
      if (list.length > 0 && !selectedClaimId) {
        setSelectedClaimId(String(list[0].id));
      }
    } catch (err) {
      console.error('Failed to load pending claims:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClaimDetails = async (claimId) => {
    try {
      const res = await claimAPI.getById(claimId);
      setSelectedClaim(res.data);

      // Default decisions to VERIFIED for present documents
      const initialDecisions = {};
      if (res.data?.documents) {
        res.data.documents.forEach(d => {
          initialDecisions[d.id] = 'VERIFIED';
        });
      }
      setDocDecisions(initialDecisions);
    } catch (err) {
      console.error('Failed to load claim:', err);
    }
  };

  const handleToggleDoc = (docId, status) => {
    setDocDecisions(prev => ({
      ...prev,
      [docId]: status
    }));
  };

  const handleCompleteVerification = async (allVerified) => {
    if (!selectedClaim) return;
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const payload = {
        claimId: selectedClaim.id,
        taskId: selectedClaim.currentTaskId,
        documentDecisions: docDecisions,
        allVerified: allVerified,
        agentRemarks: agentRemarks,
        missingDocumentsReason: !allVerified ? missingReason : null
      };

      await agentAPI.verifyDocuments(payload);

      setMessage(allVerified
        ? 'Documents verified successfully! Claim advanced to Camunda DMN Risk Assessment.'
        : 'Missing documents requested. Camunda 7-day timer boundary event initiated.');

      // Refresh list
      loadClaims();
      setTimeout(() => {
        navigate('/agent/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Verification submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="text-teal-600" /> Document Verification Workbench
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Camunda User Task: <strong className="font-mono text-slate-700">agentDocVerificationTask</strong>
            </p>
          </div>

          {/* Claim Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Select Claim:</label>
            <select
              value={selectedClaimId}
              onChange={(e) => setSelectedClaimId(e.target.value)}
              className="form-select text-xs font-mono font-bold py-1.5"
            >
              {pendingClaims.map(c => (
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
          <div className="space-y-6">
            {/* Claim Quick Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Claimant:</span>
                <span className="font-bold text-slate-800">{selectedClaim.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Policy &amp; Vehicle:</span>
                <span className="font-bold text-slate-800">{selectedClaim.vehicleMakeModel}</span>
                <span className="text-[11px] font-mono text-slate-500 block">({selectedClaim.policyNumber})</span>
              </div>
              <div>
                <span className="text-slate-500 block">Damage Estimate:</span>
                <span className="font-extrabold text-slate-900">${selectedClaim.estimatedDamage?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block">FIR Reference:</span>
                <span className="font-mono font-bold text-sky-800">{selectedClaim.firNumber || 'None'}</span>
              </div>
            </div>

            {/* Document Checklist */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Mandatory Legal Documents Checklist ({selectedClaim.documents?.length || 0}/5 Uploaded)
              </h3>

              {(!selectedClaim.documents || selectedClaim.documents.length === 0) ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-dashed rounded-xl">
                  No documents found for this claim. You can request missing documents from the policyholder.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedClaim.documents.map((doc) => {
                    const currentDecision = docDecisions[doc.id] || 'VERIFIED';
                    return (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                          currentDecision === 'VERIFIED'
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-rose-200 bg-rose-50/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              {doc.documentType?.replace(/_/g, ' ')}
                            </span>
                            <span className={`badge text-[9px] ${
                              currentDecision === 'VERIFIED' ? 'badge-low' : 'badge-high'
                            }`}>
                              {currentDecision}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">File: <strong className="text-slate-700">{doc.fileName}</strong></p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/documents/download/${doc.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline py-1 px-2.5 text-xs font-semibold flex items-center gap-1"
                          >
                            <Download size={12} /> Inspect File
                          </a>

                          <button
                            type="button"
                            onClick={() => handleToggleDoc(doc.id, 'VERIFIED')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                              currentDecision === 'VERIFIED'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDoc(doc.id, 'REJECTED')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg border transition ${
                              currentDecision === 'REJECTED'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Agent Verification Remarks */}
            <div className="space-y-3">
              <div className="form-group mb-0">
                <label className="form-label text-xs">Agent Verification Notes / Audit Remarks</label>
                <textarea
                  rows="2"
                  value={agentRemarks}
                  onChange={(e) => setAgentRemarks(e.target.value)}
                  className="form-textarea text-xs"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs">Missing Documents Instructions (if requesting resubmission)</label>
                <input
                  type="text"
                  value={missingReason}
                  onChange={(e) => setMissingReason(e.target.value)}
                  className="form-input text-xs"
                  placeholder="Specify which documents need to be re-uploaded"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleCompleteVerification(false)}
                className="btn btn-danger text-xs font-semibold w-full sm:w-auto flex items-center justify-center gap-1.5"
              >
                <AlertTriangle size={14} /> Request Missing Documents (Trigger Timeout)
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleCompleteVerification(true)}
                className="btn btn-teal text-xs font-semibold w-full sm:w-auto flex items-center justify-center gap-1.5 px-6"
              >
                <CheckCircle size={14} /> Verify &amp; Forward to Camunda DMN Engine
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No claim selected.
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;
