import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Percent,
  DollarSign,
  Maximize2,
  Info,
  Car
} from 'lucide-react';

const SAMPLE_SCENARIOS = [
  {
    id: 'frontal',
    name: 'Frontal Collision (Sedan)',
    imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=800&q=80',
    severity: 'MODERATE',
    confidence: 96.4,
    estimatedCost: 1500,
    parts: [
      { part: 'Front Bumper Cover & Absorber', status: 'Replaced', cost: 450, confidence: 98.2 },
      { part: 'Right LED Headlamp Assembly', status: 'Replaced', cost: 520, confidence: 97.5 },
      { part: 'Engine Hood Panel Alignment', status: 'Repaired & Painted', cost: 380, confidence: 94.1 },
      { part: 'Radiator Grille Mesh', status: 'Replaced', cost: 150, confidence: 95.8 }
    ],
    boxes: [
      { label: 'Front Bumper Damage (98.2%)', top: '55%', left: '20%', width: '60%', height: '35%', color: 'border-rose-500 bg-rose-500/20' },
      { label: 'Right Headlight Shattered (97.5%)', top: '45%', left: '65%', width: '25%', height: '25%', color: 'border-amber-500 bg-amber-500/20' },
      { label: 'Hood Dent (94.1%)', top: '30%', left: '30%', width: '40%', height: '25%', color: 'border-sky-500 bg-sky-500/20' }
    ],
    summary: 'Computer Vision Model detected frontal impact deformation. Structural frame rails intact. Airbag deployment sensor un-triggered. Recommended for fast-track body shop repair.'
  },
  {
    id: 'rear',
    name: 'Rear-End Impact (SUV)',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
    severity: 'SEVERE',
    confidence: 94.8,
    estimatedCost: 3200,
    parts: [
      { part: 'Rear Bumper & Reinforcement Bar', status: 'Replaced', cost: 850, confidence: 97.0 },
      { part: 'Tailgate / Trunk Lid Assembly', status: 'Replaced', cost: 1200, confidence: 95.4 },
      { part: 'Rear Tail Light Cluster (Dual)', status: 'Replaced', cost: 650, confidence: 98.1 },
      { part: 'Exhaust Muffler Tip Re-alignment', status: 'Repaired', cost: 500, confidence: 88.7 }
    ],
    boxes: [
      { label: 'Tailgate Crush (95.4%)', top: '35%', left: '25%', width: '50%', height: '40%', color: 'border-rose-500 bg-rose-500/20' },
      { label: 'Bumper Collapse (97.0%)', top: '65%', left: '15%', width: '70%', height: '30%', color: 'border-rose-500 bg-rose-500/20' }
    ],
    summary: 'High energy impact identified on rear hatch. Potential floor pan buckling. Requires mandatory physical certified surveyor measurement.'
  },
  {
    id: 'fender',
    name: 'Side Fender Scratch & Dent',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
    severity: 'MINOR',
    confidence: 98.5,
    estimatedCost: 650,
    parts: [
      { part: 'Left Front Fender Panel', status: 'Repainted / Blended', cost: 420, confidence: 99.1 },
      { part: 'Alloy Wheel Rim Scuff Repair', status: 'Refinished', cost: 230, confidence: 97.9 }
    ],
    boxes: [
      { label: 'Panel Scratch & Crease (99.1%)', top: '40%', left: '35%', width: '35%', height: '45%', color: 'border-amber-500 bg-amber-500/20' }
    ],
    summary: 'Superficial cosmetic damage limited to exterior panel and wheel rim. No mechanical or structural component affected. Pre-approved for instant automated disbursement.'
  }
];

const AiDamageAssessment = ({ claim, defaultScenarioId = 'frontal' }) => {
  const [selectedScenario, setSelectedScenario] = useState(
    SAMPLE_SCENARIOS.find(s => s.id === defaultScenarioId) || SAMPLE_SCENARIOS[0]
  );
  const [showOverlays, setShowOverlays] = useState(true);

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'MINOR':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Minor Damage</span>;
      case 'MODERATE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Moderate Severity</span>;
      case 'SEVERE':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Severe Damage</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">Pending Evaluation</span>;
    }
  };

  return (
    <div className="card space-y-5 bg-white border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AutoSure AI Damage Assessment Engine
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                v3.2 Vision Model
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Automated computer vision damage analysis &amp; preliminary parts cost estimation
            </p>
          </div>
        </div>

        {/* Scenario Switcher for presentation */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-2">Scenario:</span>
          {SAMPLE_SCENARIOS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedScenario(s)}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedScenario.id === s.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Image with Overlays & AI Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image with Bounding Boxes */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video flex items-center justify-center group shadow-inner">
            <img
              src={selectedScenario.imageUrl}
              alt="Accident Damage"
              className="w-full h-full object-cover object-center"
            />

            {/* Bounding Box Overlays */}
            {showOverlays && selectedScenario.boxes.map((box, index) => (
              <div
                key={index}
                style={{
                  top: box.top,
                  left: box.left,
                  width: box.width,
                  height: box.height
                }}
                className={`absolute border-2 rounded-lg transition-all ${box.color} pointer-events-none flex flex-col justify-between p-1.5`}
              >
                <span className="text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded shadow-sm self-start">
                  {box.label}
                </span>
              </div>
            ))}

            {/* Toggle Overlay Button */}
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className="bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md backdrop-blur-sm transition flex items-center gap-1"
              >
                <Layers size={13} /> {showOverlays ? 'Hide AI Overlays' : 'Show AI Overlays'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-600" />
              High-resolution photographic metadata verified
            </span>
            <span className="font-mono text-slate-600">
              Analysis latency: 340ms
            </span>
          </div>
        </div>

        {/* Right: AI Damage Detection Metrics */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Damage Severity
                </span>
                <div className="mt-1.5">{getSeverityBadge(selectedScenario.severity)}</div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  AI Confidence
                </span>
                <div className="text-xl font-extrabold text-teal-700 mt-1 flex items-center gap-1">
                  {selectedScenario.confidence}%
                  <span className="text-xs font-normal text-slate-500">precision</span>
                </div>
              </div>
            </div>

            {/* Cost Metric Card */}
            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                AI Estimated Repair Total
              </span>
              <div className="text-3xl font-black text-slate-900 mt-1">
                ${selectedScenario.estimatedCost.toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1.5">USD (OEM Parts + Labor)</span>
              </div>
              <p className="text-[11px] text-teal-700 mt-1">
                Calculated using regional authorized body shop labor matrix ($85/hr).
              </p>
            </div>

            {/* Damaged Parts Itemized Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Damaged Vehicle Components Detected:
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white text-xs">
                {selectedScenario.parts.map((p, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-800">{p.part}</p>
                      <span className="text-[10px] text-slate-500">
                        Recommendation: <strong>{p.status}</strong> • {p.confidence}% match
                      </span>
                    </div>
                    <span className="font-bold font-mono text-slate-900">
                      ${p.cost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
        <span className="font-bold text-slate-800 block">AI Assessment Summary:</span>
        <p className="text-slate-600 leading-relaxed">
          {selectedScenario.summary}
        </p>
      </div>

      {/* Legal Human-In-The-Loop Disclaimer (Mandated by Section 5) */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>Regulatory Compliance Notice:</strong> This AI assessment is a preliminary automated appraisal produced by computer vision algorithms. In accordance with insurance regulatory standards, final claim approval, parts authorization, and monetary settlement require manual human verification by a certified insurance surveyor and claims officer.
        </div>
      </div>
    </div>
  );
};

export default AiDamageAssessment;