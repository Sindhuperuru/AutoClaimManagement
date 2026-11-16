import React from 'react';
import {
  Check,
  Clock,
  AlertCircle,
  X,
  FileText,
  FileCheck2,
  Search,
  UserCheck,
  Wrench,
  ShieldAlert,
  CheckCircle2,
  CreditCard,
  Building2,
  Calendar,
  ArrowRight
} from 'lucide-react';

export const TRACKING_STAGES = [
  {
    id: 1,
    key: 'SUBMITTED',
    label: 'Claim Submitted',
    department: 'First Notice of Loss (FNOL)',
    defaultComments: 'Accident claim incident report and photographic evidence received through portal.',
    nextAction: 'Queue allocated for preliminary document review by Field Agent.'
  },
  {
    id: 2,
    key: 'DOCUMENT_VERIFICATION',
    label: 'Document Verification',
    department: 'Verification Bureau',
    defaultComments: 'Validation of driver license, vehicle RC, policy coverage limits, and police log.',
    nextAction: 'Executing Camunda DMN eligibility and risk scoring rules.'
  },
  {
    id: 3,
    key: 'INITIAL_REVIEW',
    label: 'Initial Review',
    department: 'Triage & Risk Assessment',
    defaultComments: 'Risk classification calculated. High-risk fraud screening completed.',
    nextAction: 'Assignment of authorized field surveyor for physical damage survey.'
  },
  {
    id: 4,
    key: 'SURVEYOR_ASSIGNED',
    label: 'Surveyor Assigned',
    department: 'Field Surveyor Bureau',
    defaultComments: 'Certified vehicle surveyor David Miller assigned to inspect vehicle.',
    nextAction: 'Surveyor appointment scheduled at authorized workshop / accident site.'
  },
  {
    id: 5,
    key: 'VEHICLE_INSPECTION',
    label: 'Vehicle Inspection',
    department: 'Surveyor Operations',
    defaultComments: 'Body shop on-site vehicle structural inspection and parts measurement.',
    nextAction: 'Surveyor generating comprehensive damage inspection report.'
  },
  {
    id: 6,
    key: 'DAMAGE_ASSESSMENT',
    label: 'Damage Assessment',
    department: 'AI & Forensic Valuation',
    defaultComments: 'Computer vision appraisal reconciled with surveyor itemized estimate.',
    nextAction: 'Claim packet escalated to Senior Claims Officer for final settlement review.'
  },
  {
    id: 7,
    key: 'CLAIM_APPROVAL',
    label: 'Claim Approval',
    department: 'Claims Underwriting',
    defaultComments: 'Review of loss adjustment, deductible application, and approval signature.',
    nextAction: 'Authorization routed to treasury for automated payment disbursement.'
  },
  {
    id: 8,
    key: 'PAYMENT_PROCESSING',
    label: 'Payment Processing',
    department: 'Treasury & Disbursements',
    defaultComments: 'Electronic Fund Transfer (ACH) simulation prepared for workshop / policyholder.',
    nextAction: 'Banking clearinghouse settlement confirmation.'
  },
  {
    id: 9,
    key: 'CLAIM_SETTLED',
    label: 'Claim Settled',
    department: 'Customer Success',
    defaultComments: 'Disbursement authorized and claim file officially closed in records.',
    nextAction: 'Final closure notice dispatched to policyholder.'
  }
];

const ClaimTimeline = ({ currentStatus, isRejected = false, claimData = null }) => {
  const normStatus = String(currentStatus || '').toUpperCase().trim();
  const isSettled = ['SETTLED', 'CLOSED', 'PAID', 'DISBURSED'].includes(normStatus);

  // Determine active stage index (1-based: 1..9)
  const getActiveStageNumber = (status) => {
    const s = String(status || '').toUpperCase().trim();
    switch (s) {
      case 'SUBMITTED':
        return 2; // stage 1 complete, 2 in progress
      case 'UNDER_AGENT_REVIEW':
      case 'DOCUMENTS_PENDING':
        return 2;
      case 'UNDER_ASSESSMENT':
      case 'PARALLEL_VERIFICATION':
        return 4;
      case 'UNDER_INVESTIGATION':
        return 5;
      case 'UNDER_OFFICER_REVIEW':
        return 6;
      case 'APPROVED':
        return 8; // Approval done, payment processing ready
      case 'SETTLED':
      case 'CLOSED':
      case 'PAID':
      case 'DISBURSED':
        return 10; // All 9 stages complete!
      case 'REJECTED':
        return isRejected ? 7 : 3;
      default:
        return 2;
    }
  };

  const currentStageNumber = getActiveStageNumber(currentStatus);

  const getStageStatus = (stageId) => {
    if (isRejected && stageId === currentStageNumber) {
      return { status: 'REJECTED', text: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-300' };
    }
    if (isSettled || stageId < currentStageNumber) {
      return { status: 'COMPLETED', text: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' };
    }
    if (stageId === currentStageNumber && !isRejected) {
      return { status: 'IN_PROGRESS', text: 'In Progress', color: 'bg-amber-50 text-amber-700 border-amber-300' };
    }
    return { status: 'UPCOMING', text: 'Upcoming', color: 'bg-slate-50 text-slate-400 border-slate-200' };
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Overview Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[760px] flex items-center justify-between relative px-4">
          {TRACKING_STAGES.map((stage, idx) => {
            const { status } = getStageStatus(stage.id);
            const isCompleted = status === 'COMPLETED';
            const isInProgress = status === 'IN_PROGRESS';
            const isFailed = status === 'REJECTED';

            return (
              <div key={stage.id} className="flex-1 flex flex-col items-center relative text-center">
                {/* Connecting Line */}
                {idx < TRACKING_STAGES.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-[3px] z-0 transition-colors ${
                      stage.id < currentStageNumber ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Node */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs z-10 transition-all border-2 ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                      : isInProgress
                      ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
                      : isFailed
                      ? 'bg-rose-600 border-rose-600 text-white shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : isInProgress ? (
                    <Clock size={16} />
                  ) : isFailed ? (
                    <X size={16} strokeWidth={3} />
                  ) : (
                    <span>{stage.id}</span>
                  )}
                </div>

                {/* Stage Title */}
                <p
                  className={`text-[11px] font-semibold mt-2 max-w-[85px] leading-tight ${
                    isInProgress
                      ? 'text-amber-800 font-bold'
                      : isCompleted
                      ? 'text-emerald-800'
                      : isFailed
                      ? 'text-rose-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </p>

                {/* Status Pill */}
                <span
                  className={`mt-1 text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                    isInProgress
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : isFailed
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}
                >
                  {isInProgress ? 'Pending' : isCompleted ? 'Done' : isFailed ? 'Failed' : 'Queued'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Stage-by-Stage List (Mandated by Section 6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 size={18} className="text-teal-400" />
            <h3 className="font-bold text-sm">Detailed 9-Stage Claim Tracking Lifecycle</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Status: {currentStatus || 'IN_PROGRESS'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {TRACKING_STAGES.map((stage) => {
            const { status, text, color } = getStageStatus(stage.id);
            const isCompleted = status === 'COMPLETED';
            const isInProgress = status === 'IN_PROGRESS';
            const isFailed = status === 'REJECTED';

            const stageDate = isCompleted
              ? 'Nov 16, 2026 at 10:30 AM'
              : isInProgress
              ? 'Today, Pending Action'
              : 'Projected in Next SLA Window';

            return (
              <div
                key={stage.id}
                className={`p-4 sm:p-5 transition flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isInProgress ? 'bg-amber-50/40 border-l-4 border-l-amber-500' : isCompleted ? 'bg-emerald-50/10' : ''
                }`}
              >
                {/* Left: Stage Number & Details */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-400'
                        : isFailed
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check size={16} /> : stage.id}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">
                        {stage.id}. {stage.label}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
                        {text}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Calendar size={12} /> {stageDate}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      <strong>Responsible Department:</strong>{' '}
                      <span className="text-slate-800 font-medium">{stage.department}</span>
                    </div>

                    <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                      <strong>Audit Comments:</strong>{' '}
                      {isSettled && stage.id === 8
                        ? (claimData?.transactionReference ? `Electronic Automated Clearinghouse (ACH) direct deposit disbursement cleared. Txn Ref: ${claimData.transactionReference}` : 'Electronic Automated Clearinghouse (ACH) direct deposit disbursement cleared.')
                        : isSettled && stage.id === 9
                        ? `Disbursement authorized and claim file officially settled and closed. Final payout: $${(claimData?.approvedSettlementAmount != null ? Number(claimData.approvedSettlementAmount).toLocaleString() : '850.00')}.`
                        : stage.defaultComments}
                    </p>

                    <div className="text-xs text-teal-800 bg-teal-50/70 p-2 rounded-lg border border-teal-200/60 mt-2 flex items-center gap-1.5">
                      <ArrowRight size={13} className="text-teal-600 flex-shrink-0" />
                      <span>
                        <strong>Next Expected Action:</strong>{' '}
                        {isSettled && stage.id === 8
                          ? 'Electronic disbursement receipt issued to policyholder records.'
                          : isSettled && stage.id === 9
                          ? 'Claim lifecycle complete. Settlement receipt available for download.'
                          : stage.nextAction}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClaimTimeline;