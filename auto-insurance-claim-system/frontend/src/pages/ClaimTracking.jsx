import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { claimAPI, workflowAPI } from '../services/api';
import ClaimTimeline from '../components/ClaimTimeline';
import AiDamageAssessment from '../components/AiDamageAssessment';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import {
  Search,
  Shield,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
  Calendar,
  Car,
  MapPin,
  Sparkles,
  Building2,
  DollarSign
} from 'lucide-react';

const ClaimTracking = () => {
  const [searchParams] = useSearchParams();
  const queryClaim = searchParams.get('number') || '';
  const [claimNumber, setClaimNumber] = useState(queryClaim || 'CLM-2026-00101');
  const [claim, setClaim] = useState(null);
  const [workflowHistory, setWorkflowHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('TIMELINE'); // 'TIMELINE' | 'AI_REPORT' | 'DOSSIER'

  useEffect(() => {
    if (claimNumber) {
      handleTrack(claimNumber);
    }
  }, []);

  const handleTrack = async (targetNumber) => {
    if (!targetNumber) return;
    setError('');
    setLoading(true);
    try {
      const res = await claimAPI.track(targetNumber.trim());
      const data = res?.data || res;
      setClaim(data);

      if (data?.processInstanceId) {
        try {
          const histRes = await workflowAPI.getHistory(data.processInstanceId);
          setWorkflowHistory(histRes.data || (Array.isArray(histRes) ? histRes : []));
        } catch (ignored) {}
      }
    } catch (err) {
      setError(err.message || 'Claim not found in SQLite repository.');
      setClaim(null);
      setWorkflowHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 font-bold">
            <Cpu size={14} className="text-teal-600" /> Camunda 7 BPMN Workflow Real-Time Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Real-Time Accident Claim Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitor your claim across the 9-stage adjudication timeline with live status updates, responsible departments, and AI vision reports.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack(claimNumber);
            }}
            className="flex gap-2 max-w-md mx-auto pt-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                placeholder="e.g. CLM-2026-00101"
                className="w-full px-3.5 py-2.5 pl-10 text-sm font-mono font-bold border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
            >
              {loading ? 'Tracking...' : 'Track Claim'}
            </button>
          </form>

          {/* Quick preset links for easy review */}
          <div className="text-xs text-slate-400 flex items-center justify-center gap-2 pt-1 font-mono">
            <span>Demo presets:</span>
            <button
              type="button"
              onClick={() => {
                setClaimNumber('CLM-2026-00101');
                handleTrack('CLM-2026-00101');
              }}
              className="text-teal-700 font-bold hover:underline"
            >
              CLM-2026-00101
            </button>
            <span>&bull;</span>
            <button
              type="button"
              onClick={() => {
                setClaimNumber('CLM-2026-00102');
                handleTrack('CLM-2026-00102');
              }}
              className="text-teal-700 font-bold hover:underline"
            >
              CLM-2026-00102
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2.5">
          <AlertTriangle size={18} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {claim && (
        <div className="space-y-6">
          {/* Claim Hero Header Dossier */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-xs font-bold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  {claim.claimNumber}
                </span>
                <span className="text-slate-400 text-xs">
                  Policy: <strong className="text-white font-mono">{claim.policyNumber}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-black">
                {claim.vehicleMakeModel || 'Toyota Camry SE'} ({claim.vehicleYear || 2022})
              </h2>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
                <span>Registration: <strong className="font-mono">{claim.vehicleRegistration || 'IL-984-XYZ'}</strong></span>
                <span>&bull;</span>
                <span>Filed: <strong>{claim.submissionDate ? claim.submissionDate.slice(0, 10) : '2026-11-16'}</strong></span>
                <span>&bull;</span>
                <span>Customer: <strong>{claim.customerName || 'Johnathan Doe'}</strong></span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="text-right sm:text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                  Estimated Repair Loss
                </span>
                <span className="text-2xl font-black text-teal-400 font-mono">
                  ${claim.estimatedDamage?.toLocaleString() || '1,500'}
                </span>
              </div>
              <div>
                <StatusBadge status={claim.status} />
              </div>
            </div>
          </div>

          {/* Navigation View Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'TIMELINE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock size={14} /> 9-Stage Progress Timeline
            </button>
            <button
              onClick={() => setActiveTab('AI_REPORT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'AI_REPORT'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles size={14} /> AI Computer Vision Appraisal
            </button>
            <button
              onClick={() => setActiveTab('DOSSIER')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'DOSSIER'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText size={14} /> Incident Dossier &amp; Police Record
            </button>
          </div>

          {/* TAB 1: 9-STAGE TIMELINE (Mandated by Section 6) */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <ClaimTimeline
                currentStatus={claim.status}
                isRejected={claim.status === 'REJECTED'}
                claimData={claim}
              />
            </div>
          )}

          {/* TAB 2: AI DAMAGE ASSESSMENT (Mandated by Section 5) */}
          {activeTab === 'AI_REPORT' && (
            <div className="space-y-6">
              <AiDamageAssessment claim={claim} />
            </div>
          )}

          {/* TAB 3: INCIDENT DOSSIER */}
          {activeTab === 'DOSSIER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Accident Scene &amp; Circumstances
                </h3>
                <div className="space-y-1.5 text-slate-700">
                  <div>Date &amp; Time: <strong>{claim.accidentDateTime || '2026-11-16 14:30'}</strong></div>
                  <div>Location: <strong>{claim.accidentLocation || 'West Grand Avenue & 5th St'}, {claim.accidentCity || 'Springfield'}</strong></div>
                  <div>Accident Type: <strong className="uppercase">{claim.accidentType || 'COLLISION'}</strong></div>
                  <div>Third Party Involved: <strong>{claim.thirdPartyInvolved ? 'Yes (Subaru Outback)' : 'No'}</strong></div>
                  <div>Police Station: <strong>{claim.policeStation || 'Springfield Central Precinct'}</strong></div>
                  <div>FIR / Log Number: <strong className="font-mono">{claim.firNumber || 'FIR-2026-9921'}</strong></div>
                </div>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 italic">
                  &ldquo;{claim.accidentDescription || 'Frontal bumper contact at traffic intersection during rainfall.'}&rdquo;
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-xs">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
                  Coverage Limits &amp; Deductibles
                </h3>
                <div className="space-y-1.5 text-slate-700">
                  <div>Policy Number: <strong className="font-mono text-teal-800">{claim.policyNumber}</strong></div>
                  <div>Policy Type: <strong>{claim.policyType || 'COMPREHENSIVE'}</strong></div>
                  <div>Sum Insured: <strong className="text-slate-900 font-mono">${claim.sumInsured?.toLocaleString() || '32,000'}</strong></div>
                  <div>Applicable Deductible: <strong className="text-amber-700 font-mono">${claim.deductibleAmount || 500}</strong></div>
                  <div>DMN Risk Classification: <RiskBadge riskLevel={claim.riskLevel || 'LOW'} /></div>
                  <div>Current Camunda Task: <strong className="font-mono text-slate-800">{claim.currentTaskName || 'Field Agent Document Verification'}</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClaimTracking;