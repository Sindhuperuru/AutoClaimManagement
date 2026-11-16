import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { claimAPI } from '../services/api';
import { useAuth } from '../context/authContext';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import ClaimTimeline from '../components/ClaimTimeline';
import AiDamageAssessment from '../components/AiDamageAssessment';
import {
  Shield,
  Car,
  Calendar,
  MapPin,
  FileText,
  Download,
  CheckCircle,
  AlertOctagon,
  CreditCard,
  ArrowLeft,
  UserCheck
} from 'lucide-react';

const ClaimDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      setLoading(true);
      const res = await claimAPI.getById(id);
      setClaim(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load claim dossier');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-500">Loading claim dossier...</div>;
  }

  if (error || !claim) {
    return (
      <div className="card text-center py-12">
        <AlertOctagon size={36} className="mx-auto text-rose-500 mb-2" />
        <p className="text-sm font-bold text-slate-800">{error || 'Claim record not found'}</p>
        <Link to="/customer/dashboard" className="btn btn-outline text-xs mt-4 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">
              {claim.claimNumber}
            </h1>
            <StatusBadge status={claim.status} />
            <RiskBadge riskLevel={claim.riskLevel} score={claim.riskScore} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Submitted on {new Date(claim.submissionDate).toLocaleDateString()} by {claim.customerName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'ROLE_AGENT' && (
            <Link to="/agent/verification" className="btn btn-secondary text-xs">
              <UserCheck size={14} /> Document Verification Queue
            </Link>
          )}
          {user?.role === 'ROLE_CLAIMS_OFFICER' && (
            <Link to="/officer/approval" className="btn btn-primary text-xs">
              <CheckCircle size={14} /> Review &amp; Approve Claim
            </Link>
          )}
          {user?.role === 'ROLE_ADMIN' && (
            <Link to="/settlement" className="btn btn-teal text-xs">
              <CreditCard size={14} /> Settlement Disbursement
            </Link>
          )}
        </div>
      </div>

      {/* Camunda BPMN Pipeline Timeline */}
      <ClaimTimeline currentStatus={claim.status} isRejected={claim.status === 'REJECTED'} claimData={claim} />

      {/* AI Damage Assessment Interface */}
      <AiDamageAssessment claim={claim} />

      {/* Rejection notice if rejected */}
      {claim.status === 'REJECTED' && claim.rejectionReason && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
          <div className="font-bold text-rose-800 flex items-center gap-1.5">
            <AlertOctagon size={16} /> Official Claim Rejection Notice
          </div>
          <div className="text-rose-700">Reason: {claim.rejectionReason}</div>
        </div>
      )}

      {/* Dossier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Policy & Coverage Card */}
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <Shield size={16} className="text-sky-600" /> Policy &amp; Coverage Specifications
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Policy Number:</span>
              <span className="font-mono font-bold text-slate-800">{claim.policyNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Coverage Rider:</span>
              <span className="font-bold text-slate-800">{claim.policyType}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Maximum Sum Insured:</span>
              <span className="font-bold text-slate-900">${claim.sumInsured?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Standard Deductible:</span>
              <span className="font-bold text-slate-900">${claim.deductibleAmount}</span>
            </div>
          </div>
        </div>

        {/* Vehicle Record Card */}
        <div className="card space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <Car size={16} className="text-teal-600" /> Insured Vehicle Specifications
          </h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Make &amp; Model:</span>
              <span className="font-bold text-slate-800">{claim.vehicleMakeModel}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Year of Manufacture:</span>
              <span className="font-bold text-slate-800">{claim.vehicleYear}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registration Plate:</span>
              <span className="font-mono font-bold text-slate-800">{claim.vehicleRegistration}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Registered Policyholder:</span>
              <span className="font-semibold text-slate-800">{claim.customerName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accident Incident Report */}
      <div className="card space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <MapPin size={16} className="text-rose-600" /> Accident Incident Report &amp; Police Record
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
          <div>
            <span className="text-slate-500 block">Accident Date &amp; Time:</span>
            <span className="font-semibold text-slate-800">{new Date(claim.accidentDateTime).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Incident Location:</span>
            <span className="font-semibold text-slate-800">{claim.accidentLocation}, {claim.accidentCity}, {claim.accidentState}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Accident Type:</span>
            <span className="font-semibold text-slate-800">{claim.accidentType}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Driver in Control:</span>
            <span className="font-semibold text-slate-800">{claim.driverName} ({claim.driverLicenseNumber})</span>
          </div>
          <div>
            <span className="text-slate-500 block">Police FIR / Incident #:</span>
            <span className="font-mono font-bold text-sky-800">{claim.firNumber || 'None / Not Filed'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Police Precinct:</span>
            <span className="font-semibold text-slate-800">{claim.policeStation || 'N/A'}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg text-xs">
          <span className="font-bold text-slate-700 block mb-1">Accident Narrative:</span>
          <p className="text-slate-600 leading-relaxed">{claim.accidentDescription}</p>
        </div>
      </div>

      {/* Uploaded Evidence Documents */}
      <div className="card space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
          <FileText size={16} className="text-indigo-600" /> Verified Evidence Documents ({claim.documents?.length || 0})
        </h2>

        {(!claim.documents || claim.documents.length === 0) ? (
          <div className="p-4 text-center text-xs text-slate-500">No documents uploaded for this claim.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {claim.documents.map((doc) => (
              <div key={doc.id} className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {doc.documentType?.replace(/_/g, ' ')}
                    </span>
                    <span className={`badge text-[9px] ${
                      doc.verificationStatus === 'VERIFIED' ? 'badge-low' :
                      doc.verificationStatus === 'REJECTED' ? 'badge-high' : 'badge-pending'
                    }`}>
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 truncate" title={doc.fileName}>
                    {doc.fileName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : ''}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 flex justify-between items-center">
                  <a
                    href={`/api/documents/download/${doc.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
                  >
                    <Download size={12} /> Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Financial Settlement Breakdown (if approved or calculated) */}
      {claim.settlement && (
        <div className="card space-y-3 bg-gradient-to-br from-white to-slate-50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
            <CreditCard size={16} className="text-teal-600" /> Camunda DMN Settlement Disbursement Breakdown
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Gross Estimate:</span>
              <span className="font-bold text-sm text-slate-900">${claim.settlement.calculatedAmount?.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Deductible Applied:</span>
              <span className="font-bold text-sm text-rose-600">-${claim.settlement.deductibleDeducted}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <span className="text-slate-500 block">Depreciation (10%):</span>
              <span className="font-bold text-sm text-rose-600">-${claim.settlement.depreciationDeducted}</span>
            </div>
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <span className="text-teal-700 block font-bold">Net Final Payable:</span>
              <span className="font-extrabold text-base text-teal-800">${claim.settlement.finalPayableAmount?.toLocaleString()}</span>
            </div>
          </div>

          {claim.settlement.transactionReference && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex justify-between items-center mt-2">
              <div className="text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-600" />
                Simulated Bank Transfer Reference: <span className="font-mono font-bold">{claim.settlement.transactionReference}</span>
              </div>
              <span className="badge badge-low text-[10px]">PAYMENT SETTLED</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimDetails;
