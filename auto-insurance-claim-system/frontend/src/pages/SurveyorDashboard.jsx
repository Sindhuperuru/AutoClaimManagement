import React, { useState, useEffect } from 'react';
import { claimAPI, officerAPI } from '../services/api';
import AiDamageAssessment from '../components/AiDamageAssessment';
import StatusBadge from '../components/StatusBadge';
import RiskBadge from '../components/RiskBadge';
import {
  Wrench,
  Car,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Upload,
  FileText,
  DollarSign,
  User,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  Check,
  Building
} from 'lucide-react';

const SAMPLE_INSPECTIONS = [
  {
    id: 1,
    claimNumber: 'CLM-2026-00101',
    customerName: 'Johnathan Doe',
    customerPhone: '+1-555-019-2831',
    vehicleRegistration: 'IL-984-XYZ',
    vehicleMakeModel: 'Toyota Camry SE (2022)',
    accidentLocation: 'West Grand Avenue & 5th St, Springfield, IL',
    accidentDate: '2026-11-16 14:30',
    estimatedDamage: 1500,
    priority: 'HIGH',
    status: 'INSPECTION_PENDING',
    policyNumber: 'POL-2026-88491',
    garage: 'Springfield Premier Auto Body Works'
  },
  {
    id: 2,
    claimNumber: 'CLM-2026-00102',
    customerName: 'Sarah Connor',
    customerPhone: '+1-555-019-4820',
    vehicleRegistration: 'CA-882-SPD',
    vehicleMakeModel: 'Tesla Model 3 Long Range (2023)',
    accidentLocation: '1844 Cyberdyne Way, Los Angeles, CA',
    accidentDate: '2026-11-15 09:15',
    estimatedDamage: 3200,
    priority: 'URGENT',
    status: 'SURVEYOR_ASSIGNED',
    policyNumber: 'POL-2026-33108',
    garage: 'Metro Collision Center LA'
  }
];

const SurveyorDashboard = () => {
  const [inspections, setInspections] = useState(SAMPLE_INSPECTIONS);
  const [selectedInspection, setSelectedInspection] = useState(SAMPLE_INSPECTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Vehicle Inspection Form State (Mandated by Section 8)
  const [damageSeverity, setDamageSeverity] = useState('MODERATE'); // MINOR, MODERATE, SEVERE, TOTAL_LOSS
  const [checklist, setChecklist] = useState({
    frameAlignment: true,
    bumperAbsorber: true,
    hoodLatch: true,
    headlampAssembly: true,
    radiatorSupport: false,
    suspensionStrut: false,
    airbagSensor: true,
    windshieldSeal: false
  });

  const [partsCost, setPartsCost] = useState('950');
  const [laborHours, setLaborHours] = useState('6');
  const [laborRate, setLaborRate] = useState('85');
  const [paintCost, setPaintCost] = useState('350');
  const [surveyorRemarks, setSurveyorRemarks] = useState(
    'Conducted physical inspection at body shop. Front bumper reinforcement bar collapsed with 15mm crease on hood leading edge. Frame rails intact with zero diamond distortion. Airbags did not deploy. Recommending OEM bumper replacement and hood refinishing.'
  );

  const totalAssessedRepair = (
    parseFloat(partsCost || 0) +
    parseFloat(laborHours || 0) * parseFloat(laborRate || 0) +
    parseFloat(paintCost || 0)
  ).toFixed(2);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Simulate or call backend investigation/review endpoint
      await new Promise(r => setTimeout(r, 900));
      setReportSuccess(true);
      setInspections(prev =>
        prev.map(item =>
          item.id === selectedInspection.id
            ? { ...item, status: 'INSPECTION_COMPLETED' }
            : item
        )
      );
      setTimeout(() => {
        setReportSuccess(false);
      }, 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-teal-400 font-bold text-xs uppercase font-mono bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
              Certified Surveyor Bureau
            </span>
            <span className="text-slate-400 text-xs">Surveyor ID: #SRV-4091</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Vehicle Damage Inspection &amp; Survey Workspace
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Examine physical vehicle accident losses, execute mechanical inspection checklists, assess OEM parts replacement quotes, and submit certified survey reports.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 text-xs font-mono">
          <Wrench size={16} className="text-teal-400" />
          <span>Active Inspections: <strong>{inspections.length}</strong></span>
        </div>
      </div>

      {/* Main Grid: Left Queue, Right Inspection Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (4): Assigned Vehicle Inspections Queue */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-teal-600" /> Assigned Vehicle Queue
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
                {inspections.length} Tasks
              </span>
            </div>

            <div className="space-y-2.5">
              {inspections.map(item => (
                <div
                  key={item.id}
                  onClick={() => setSelectedInspection(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    selectedInspection?.id === item.id
                      ? 'border-teal-600 bg-teal-50/60 shadow-xs ring-2 ring-teal-500/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-bold text-xs text-teal-900 bg-teal-100 px-2 py-0.5 rounded">
                      {item.claimNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'URGENT' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{item.vehicleMakeModel}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">Plate: {item.vehicleRegistration}</span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-200/80">
                    <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">{item.garage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Benchmark Card */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold">
              <Sparkles size={14} /> AI Computer Vision Synchronized
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Preliminary damage model estimated <strong>${selectedInspection.estimatedDamage}</strong> with 96.4% confidence score. Reconcile physical inspection against digital scan.
            </p>
          </div>
        </div>

        {/* Right Col (8): Vehicle Damage Inspection Form (Mandated by Section 8) */}
        <div className="lg:col-span-8 space-y-6">
          {reportSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in duration-200">
              <CheckCircle2 size={24} className="text-emerald-600 flex-shrink-0" />
              <div>
                <strong className="block font-bold">Survey Report Certified &amp; Submitted!</strong>
                <span>Inspection report recorded and routed to Senior Claims Officer for loss adjustment.</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Target Vehicle Header */}
            <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-slate-500">Inspection Dossier</span>
                  <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {selectedInspection.claimNumber}
                  </span>
                </div>
                <h2 className="text-lg font-black text-slate-900 mt-1">
                  {selectedInspection.vehicleMakeModel}
                </h2>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3 mt-0.5">
                  <span>Customer: <strong>{selectedInspection.customerName}</strong> ({selectedInspection.customerPhone})</span>
                  <span>&bull;</span>
                  <span>Location: <strong>{selectedInspection.accidentLocation}</strong></span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assessed Repair Total</span>
                <span className="text-2xl font-black text-teal-700 font-mono">
                  ${totalAssessedRepair}
                </span>
              </div>
            </div>

            {/* Inspection Form */}
            <form onSubmit={handleSubmitInspection} className="space-y-6">
              {/* 1. Damage Severity Classification (Mandated by Section 8) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  1. Surveyor Damage Severity Rating *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'MINOR', label: 'Minor Scuffs & Paint', color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
                    { id: 'MODERATE', label: 'Moderate Panel Damage', color: 'border-amber-500 text-amber-800 bg-amber-50' },
                    { id: 'SEVERE', label: 'Severe Frame / Rails', color: 'border-rose-500 text-rose-800 bg-rose-50' },
                    { id: 'TOTAL_LOSS', label: 'Constructive Total Loss', color: 'border-purple-500 text-purple-800 bg-purple-50' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setDamageSeverity(lvl.id)}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                        damageSeverity === lvl.id
                          ? `${lvl.color} ring-2 ring-slate-900 shadow-xs`
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Inspection Checklist (Mandated by Section 8) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Component Inspection Checklist &amp; Measurements *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { key: 'frameAlignment', label: 'Structural Frame Rails & Unibody Points' },
                    { key: 'bumperAbsorber', label: 'Front Impact Absorber & Crash Bar' },
                    { key: 'hoodLatch', label: 'Hood Panel Latch & Hinges Alignment' },
                    { key: 'headlampAssembly', label: 'Right LED Headlamp Housing & Brackets' },
                    { key: 'radiatorSupport', label: 'Radiator Support Core & Cooling Hoses' },
                    { key: 'suspensionStrut', label: 'Front MacPherson Strut & Control Arm' },
                    { key: 'airbagSensor', label: 'SRS Airbag Crash Accelerometer Sensors' },
                    { key: 'windshieldSeal', label: 'Windshield Laminated Glass & Gasket' }
                  ].map(item => (
                    <div
                      key={item.key}
                      onClick={() => toggleChecklist(item.key)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition select-none ${
                        checklist[item.key]
                          ? 'border-teal-500 bg-teal-50/50 text-teal-950 font-bold'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className={`w-5 h-5 rounded-md flex items-center justify-center ${
                        checklist[item.key] ? 'bg-teal-600 text-white' : 'border border-slate-300 bg-white'
                      }`}>
                        {checklist[item.key] && <Check size={13} strokeWidth={3} />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Itemized Repair Cost Estimation (Mandated by Section 8) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Itemized Labor &amp; Parts Loss Valuation
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">OEM Replacement Parts ($)</label>
                    <input
                      type="number"
                      required
                      value={partsCost}
                      onChange={(e) => setPartsCost(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Labor Hours (hrs)</label>
                    <input
                      type="number"
                      required
                      value={laborHours}
                      onChange={(e) => setLaborHours(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Labor Rate ($/hr)</label>
                    <input
                      type="number"
                      required
                      value={laborRate}
                      onChange={(e) => setLaborRate(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Paint &amp; Refinish ($)</label>
                    <input
                      type="number"
                      required
                      value={paintCost}
                      onChange={(e) => setPaintCost(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold">Formula: Parts + (Labor &times; Rate) + Paint</span>
                  <span className="font-mono font-black text-sm text-slate-900">
                    Grand Total: ${totalAssessedRepair}
                  </span>
                </div>
              </div>

              {/* 4. Surveyor Assessment Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  4. Surveyor Technical Assessment Remarks *
                </label>
                <textarea
                  rows={3}
                  required
                  value={surveyorRemarks}
                  onChange={(e) => setSurveyorRemarks(e.target.value)}
                  className="form-textarea text-xs"
                />
              </div>

              {/* 5. Survey Report Document Upload */}
              <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Upload size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block">Attach Physical Signed Survey Report (PDF/Scan)</span>
                    <span className="text-[11px] text-slate-400">Optional: Upload vehicle chassis measurement report</span>
                  </div>
                </div>
                <input
                  type="file"
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              {/* Submit Inspection Report Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 transition shadow-md flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Certifying Inspection...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck size={18} /> Submit Official Inspection Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyorDashboard;