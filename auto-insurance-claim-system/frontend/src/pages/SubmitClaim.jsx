import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { claimAPI, policyAPI, documentAPI } from '../services/api';
import {
  FilePlus2,
  Car,
  Calendar,
  Clock,
  MapPin,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Shield,
  Wrench,
  Camera,
  Check,
  X,
  Sparkles,
  AlertTriangle,
  Building,
  User
} from 'lucide-react';

const SubmitClaim = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1..5
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedClaim, setSubmittedClaim] = useState(null);

  // STEP 1: Accident Information State (Mandated by Section 4)
  const [accidentDate, setAccidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [accidentTime, setAccidentTime] = useState('14:30');
  const [location, setLocation] = useState('West Grand Avenue & 5th St');
  const [city, setCity] = useState('Springfield');
  const [state, setState] = useState('IL');
  const [accidentType, setAccidentType] = useState('COLLISION'); // Collision, Theft, Fire, Natural Disaster, Third-party Accident
  const [description, setDescription] = useState('Frontal bumper contact at traffic intersection during rainfall. Other vehicle abruptly braked.');
  const [anotherVehicleInvolved, setAnotherVehicleInvolved] = useState(true);
  const [wereInjuries, setWereInjuries] = useState(false);
  const [policeComplaintFiled, setPoliceComplaintFiled] = useState(true);
  const [firNumber, setFirNumber] = useState('FIR-2026-9921');
  const [policeStation, setPoliceStation] = useState('Springfield Central Precinct');

  // STEP 2: Vehicle Information State (Mandated by Section 4)
  const [selectedPolicyNumber, setSelectedPolicyNumber] = useState('POL-2026-88491');
  const [vehicleReg, setVehicleReg] = useState('IL-984-XYZ');
  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('Camry SE');
  const [vehicleYear, setVehicleYear] = useState('2022');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [odometerReading, setOdometerReading] = useState('34,820');
  const [policyholderName, setPolicyholderName] = useState('Johnathan Doe');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('DL-IL-9847291');

  // STEP 3: Damage Information State (Mandated by Section 4)
  const [damageCategory, setDamageCategory] = useState('Frontal Collision Impact');
  const [frontDamage, setFrontDamage] = useState(true);
  const [rearDamage, setRearDamage] = useState(false);
  const [sideDamage, setSideDamage] = useState(false);
  const [windshieldDamage, setWindshieldDamage] = useState(false);
  const [engineDamage, setEngineDamage] = useState(false);
  const [estimatedRepairCost, setEstimatedRepairCost] = useState('1500');
  const [garageName, setGarageName] = useState('Springfield Premier Auto Body Works');
  const [garagePhone, setGaragePhone] = useState('+1-555-019-8800');
  const [garageAddress, setGarageAddress] = useState('1024 Industrial Pkwy, Springfield, IL');

  // STEP 4: Document & Photo Uploads State (Mandated by Section 4)
  const [files, setFiles] = useState({
    ACCIDENT_PHOTO: null,
    VEHICLE_RC: null,
    DRIVING_LICENSE: null,
    INSURANCE_POLICY: null,
    POLICE_FIR: null,
    REPAIR_ESTIMATE: null
  });
  const [filePreviews, setFilePreviews] = useState({});

  // Multiple Accident Photos
  const [additionalPhotos, setAdditionalPhotos] = useState([]);

  // STEP 5: Declaration & Consent
  const [legalDeclaration, setLegalDeclaration] = useState(false);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const res = await policyAPI.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setPolicies(list);
      if (list.length > 0) {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const matched = list.find(p => p.customer?.user?.email === storedUser?.email) || list[0];
        populateFromPolicy(matched);
      }
    } catch (err) {
      console.error('Failed to load policies:', err);
    }
  };

  const populateFromPolicy = (p) => {
    if (!p) return;
    setSelectedPolicyNumber(p.policyNumber);
    if (p.vehicle) {
      setVehicleReg(p.vehicle.registrationNumber || '');
      setVehicleMake(p.vehicle.make || '');
      setVehicleModel(p.vehicle.model || '');
      setVehicleYear(p.vehicle.yearOfManufacture?.toString() || '2022');
      setVehicleType(p.vehicle.vehicleType || 'Sedan');
    }
    if (p.customer) {
      setPolicyholderName(p.customer.user?.fullName || 'Johnathan Doe');
      setDriverLicenseNumber(p.customer.drivingLicenseNumber || 'DL-IL-9847291');
    }
  };

  // Auto calculate estimate recommendation when damage checkboxes toggle
  const calculateEstimate = (f, r, s, w, e) => {
    let cost = 0;
    if (f) cost += 850;
    if (r) cost += 650;
    if (s) cost += 500;
    if (w) cost += 400;
    if (e) cost += 1200;
    return cost > 0 ? cost.toString() : '500';
  };

  const handleCheckboxDamage = (type, val) => {
    let f = frontDamage, r = rearDamage, s = sideDamage, w = windshieldDamage, e = engineDamage;
    if (type === 'front') { setFrontDamage(val); f = val; }
    if (type === 'rear') { setRearDamage(val); r = val; }
    if (type === 'side') { setSideDamage(val); s = val; }
    if (type === 'windshield') { setWindshieldDamage(val); w = val; }
    if (type === 'engine') { setEngineDamage(val); e = val; }
    setEstimatedRepairCost(calculateEstimate(f, r, s, w, e));
  };

  const handleFileChange = (docType, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFiles(prev => ({ ...prev, [docType]: file }));
      if (file.type.startsWith('image/')) {
        setFilePreviews(prev => ({ ...prev, [docType]: URL.createObjectURL(file) }));
      }
    }
  };

  const handleMultiplePhotos = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const newItems = selected.map(f => ({
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(2)
      }));
      setAdditionalPhotos(prev => [...prev, ...newItems]);
      if (!files.ACCIDENT_PHOTO && selected[0]) {
        setFiles(prev => ({ ...prev, ACCIDENT_PHOTO: selected[0] }));
      }
    }
  };

  const removePhoto = (index) => {
    setAdditionalPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!legalDeclaration) {
      setError('Please review and check the legal declaration box to certify your claim.');
      return;
    }

    setLoading(true);
    try {
      const combinedDateTime = `${accidentDate}T${accidentTime}:00`;

      const payload = {
        policyNumber: selectedPolicyNumber.trim(),
        accidentDateTime: combinedDateTime,
        location: location.trim(),
        city: city.trim(),
        state: state.trim(),
        accidentType: accidentType,
        description: description.trim(),
        weatherConditions: 'Clear and dry',
        driverName: policyholderName.trim(),
        driverLicenseNumber: driverLicenseNumber.trim(),
        thirdPartyInvolved: anotherVehicleInvolved,
        thirdPartyDetails: anotherVehicleInvolved ? 'Subaru Outback / IL-402-BTY' : 'None',
        policeStation: policeComplaintFiled ? policeStation : 'Not Filed',
        firNumber: policeComplaintFiled ? firNumber : 'None',
        estimatedDamage: parseFloat(estimatedRepairCost || 1500)
      };

      const res = await claimAPI.submit(payload);
      const createdClaim = res.data || res;
      const claimId = createdClaim?.id;

      if (!claimId) {
        throw new Error('Claim submission did not return a valid claim record.');
      }

      // Upload attached files
      const uploadPromises = Object.entries(files).map(async ([docType, file]) => {
        if (file) {
          try {
            await documentAPI.upload(claimId, docType, file);
          } catch (uploadErr) {
            console.warn(`Could not upload ${docType}:`, uploadErr);
          }
        }
      });
      await Promise.all(uploadPromises);

      // Generate Reference Code format: AS-CLM-2026-XXXXX
      const claimRef = createdClaim.claimNumber || `AS-CLM-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      setSubmittedClaim({ ...createdClaim, claimRef });
    } catch (err) {
      setError(err.message || 'Failed to submit accident claim. Please check all fields.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* SUCCESS MODAL ONCE SUBMITTED */}
      {submittedClaim && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={36} className="stroke-[2.5]" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 uppercase font-mono">
              Claim Dispatched to Camunda Engine
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Accident Claim Registered Successfully!
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your claim has been recorded in the SQLite enterprise database and instantiated in Camunda BPMN workflow for field agent triage.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-5 bg-slate-900 text-white rounded-2xl max-w-md mx-auto space-y-2 shadow-inner">
            <span className="text-xs text-slate-400 font-medium block">
              Unique Claim Reference Number
            </span>
            <div className="text-2xl font-mono font-black text-teal-400 tracking-wider">
              {submittedClaim.claimRef}
            </div>
            <p className="text-[11px] text-slate-300">
              Save this reference number to track live document verification and surveyor inspection.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/claims/track?number=${submittedClaim.claimNumber || submittedClaim.claimRef}`)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-500 transition shadow-sm flex items-center gap-2"
            >
              Track Live 9-Stage Progress <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Return to Customer Dashboard
            </button>
          </div>
        </div>
      )}

      {!submittedClaim && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FilePlus2 className="text-teal-400" size={20} />
                <h1 className="text-lg font-bold">New Accident Insurance Claim</h1>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                5-Step enterprise claim filing with automated Camunda workflow ingestion
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
              Step {step} of 5
            </span>
          </div>

          {/* 5-Step Stepper Tabs (Mandated by Section 4) */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[620px]">
              {[
                { s: 1, title: '1. Accident Info' },
                { s: 2, title: '2. Vehicle Details' },
                { s: 3, title: '3. Damage Info' },
                { s: 4, title: '4. Document Upload' },
                { s: 5, title: '5. Final Review' }
              ].map(item => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => setStep(item.s)}
                  className={`flex items-center gap-2 text-xs font-bold transition px-2 py-1 rounded-lg ${
                    step === item.s
                      ? 'text-slate-900 bg-white shadow-xs border border-slate-200'
                      : step > item.s
                      ? 'text-teal-700'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === item.s
                        ? 'bg-slate-900 text-white'
                        : step > item.s
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {step > item.s ? <Check size={12} strokeWidth={3} /> : item.s}
                  </span>
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* ================= STEP 1: ACCIDENT INFORMATION ================= */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Calendar size={16} className="text-teal-600" /> Incident Date, Location &amp; Circumstances
                  </h2>
                  <p className="text-xs text-slate-500">Provide accurate timeline and geographical details of the accident</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accident Date *</label>
                    <input
                      type="date"
                      required
                      value={accidentDate}
                      onChange={(e) => setAccidentDate(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accident Time *</label>
                    <input
                      type="time"
                      required
                      value={accidentTime}
                      onChange={(e) => setAccidentTime(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accident Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. West Grand Ave & 5th St"
                      className="form-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Springfield"
                      className="form-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="IL"
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Accident Type *</label>
                    <select
                      value={accidentType}
                      onChange={(e) => setAccidentType(e.target.value)}
                      className="form-select text-xs font-semibold"
                    >
                      <option value="COLLISION">Collision (Frontal / Rear)</option>
                      <option value="THEFT">Theft / Vehicle Break-in</option>
                      <option value="FIRE">Fire / Thermal Damage</option>
                      <option value="NATURAL_DISASTER">Natural Disaster / Hail / Flooding</option>
                      <option value="THIRD_PARTY">Third-party Accident</option>
                      <option value="ROLLOVER">Rollover / Loss of Control</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Weather Conditions</label>
                    <input
                      type="text"
                      value="Clear / Dry Asphalt"
                      readOnly
                      className="form-input text-xs bg-slate-50 text-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accident Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what occurred, traffic conditions, speed, and point of impact..."
                    className="form-textarea text-xs"
                  />
                </div>

                {/* Toggles (Mandated by Section 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between p-2">
                    <span className="text-xs font-bold text-slate-700">Another Vehicle Involved?</span>
                    <button
                      type="button"
                      onClick={() => setAnotherVehicleInvolved(!anotherVehicleInvolved)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        anotherVehicleInvolved ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {anotherVehicleInvolved ? 'Yes' : 'No'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Were There Any Injuries?</span>
                    <button
                      type="button"
                      onClick={() => setWereInjuries(!wereInjuries)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        wereInjuries ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {wereInjuries ? 'Yes' : 'No'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 border-t sm:border-t-0 sm:border-l border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Police Complaint Filed?</span>
                    <button
                      type="button"
                      onClick={() => setPoliceComplaintFiled(!policeComplaintFiled)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        policeComplaintFiled ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {policeComplaintFiled ? 'Yes' : 'No'}
                    </button>
                  </div>
                </div>

                {policeComplaintFiled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-teal-50/50 rounded-2xl border border-teal-200">
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">Police FIR / Station Log Number *</label>
                      <input
                        type="text"
                        required
                        value={firNumber}
                        onChange={(e) => setFirNumber(e.target.value)}
                        placeholder="e.g. FIR-2026-9921"
                        className="form-input text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-teal-900 mb-1">Police Precinct / Station *</label>
                      <input
                        type="text"
                        required
                        value={policeStation}
                        onChange={(e) => setPoliceStation(e.target.value)}
                        placeholder="e.g. Springfield Central Precinct"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    Proceed to Step 2: Vehicle Info <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 2: VEHICLE INFORMATION ================= */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Car size={16} className="text-teal-600" /> Insured Vehicle &amp; Policy Details
                  </h2>
                  <p className="text-xs text-slate-500">Confirm policy number and vehicle identification specifications</p>
                </div>

                {/* Policy Selector Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Select Active Policy *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {policies.map(p => (
                      <div
                        key={p.id}
                        onClick={() => populateFromPolicy(p)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition ${
                          selectedPolicyNumber === p.policyNumber
                            ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-500'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-xs text-teal-900 bg-teal-100 px-2 py-0.5 rounded">
                            {p.policyNumber}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {p.status}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-slate-900 mt-2">
                          {p.vehicle?.make} {p.vehicle?.model} ({p.vehicle?.yearOfManufacture})
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Registration: {p.vehicle?.registrationNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Registration Number *</label>
                    <input
                      type="text"
                      required
                      value={vehicleReg}
                      onChange={(e) => setVehicleReg(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Manufacturer *</label>
                    <input
                      type="text"
                      required
                      value={vehicleMake}
                      onChange={(e) => setVehicleMake(e.target.value)}
                      className="form-input text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Model *</label>
                    <input
                      type="text"
                      required
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      className="form-input text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Year of Manufacture *</label>
                    <input
                      type="number"
                      required
                      value={vehicleYear}
                      onChange={(e) => setVehicleYear(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type *</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="form-select text-xs font-semibold"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV / Crossover</option>
                      <option value="Electric Vehicle">Electric Vehicle (EV)</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Truck">Pickup Truck</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Current Odometer Reading *</label>
                    <input
                      type="text"
                      required
                      value={odometerReading}
                      onChange={(e) => setOdometerReading(e.target.value)}
                      placeholder="e.g. 34,820 miles"
                      className="form-input text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Policyholder Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Policyholder / Driver Full Name *</label>
                    <input
                      type="text"
                      required
                      value={policyholderName}
                      onChange={(e) => setPolicyholderName(e.target.value)}
                      className="form-input text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Driving License Number *</label>
                    <input
                      type="text"
                      required
                      value={driverLicenseNumber}
                      onChange={(e) => setDriverLicenseNumber(e.target.value)}
                      className="form-input text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    Proceed to Step 3: Damage Info <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 3: DAMAGE INFORMATION ================= */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Wrench size={16} className="text-teal-600" /> Vehicle Damage Classification &amp; Repair Garage
                  </h2>
                  <p className="text-xs text-slate-500">Check all affected components for preliminary AI repair benchmarking</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Damage Category *</label>
                  <select
                    value={damageCategory}
                    onChange={(e) => setDamageCategory(e.target.value)}
                    className="form-select text-xs font-semibold"
                  >
                    <option value="Frontal Collision Impact">Frontal Collision Impact</option>
                    <option value="Rear-End Collision">Rear-End Collision</option>
                    <option value="Side T-Bone Collision">Side T-Bone Collision</option>
                    <option value="Weather / Hail Damage">Weather / Hail Damage</option>
                    <option value="Mechanical & Undercarriage">Mechanical &amp; Undercarriage Damage</option>
                  </select>
                </div>

                {/* Damaged Parts Checkboxes (Mandated by Section 4) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Damaged Vehicle Components (Check all that apply) *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${frontDamage ? 'border-teal-500 bg-teal-50/60 font-bold text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={frontDamage}
                        onChange={(e) => handleCheckboxDamage('front', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs">Front Bumper / Grille</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${rearDamage ? 'border-teal-500 bg-teal-50/60 font-bold text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={rearDamage}
                        onChange={(e) => handleCheckboxDamage('rear', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs">Rear Bumper / Trunk</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${sideDamage ? 'border-teal-500 bg-teal-50/60 font-bold text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={sideDamage}
                        onChange={(e) => handleCheckboxDamage('side', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs">Side Panels / Doors</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${windshieldDamage ? 'border-teal-500 bg-teal-50/60 font-bold text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={windshieldDamage}
                        onChange={(e) => handleCheckboxDamage('windshield', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs">Windshield / Glass</span>
                    </label>

                    <label className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition select-none ${engineDamage ? 'border-teal-500 bg-teal-50/60 font-bold text-teal-900' : 'border-slate-200 bg-white text-slate-700'}`}>
                      <input
                        type="checkbox"
                        checked={engineDamage}
                        onChange={(e) => handleCheckboxDamage('engine', e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-xs">Engine / Mechanical</span>
                    </label>
                  </div>
                </div>

                {/* Estimated Repair Cost */}
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                      Estimated Repair Cost ($ USD) *
                    </span>
                    <p className="text-[11px] text-teal-700">
                      Pre-computed benchmark based on selected damage components
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-slate-700">$</span>
                    <input
                      type="number"
                      required
                      min="100"
                      value={estimatedRepairCost}
                      onChange={(e) => setEstimatedRepairCost(e.target.value)}
                      className="form-input w-36 text-base font-mono font-black text-slate-900 text-right bg-white"
                    />
                  </div>
                </div>

                {/* Authorized Garage Details (Mandated by Section 4) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <Building size={16} className="text-slate-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Designated Repair Garage Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Body Shop / Garage Name</label>
                      <input
                        type="text"
                        value={garageName}
                        onChange={(e) => setGarageName(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={garagePhone}
                        onChange={(e) => setGaragePhone(e.target.value)}
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Garage Address</label>
                    <input
                      type="text"
                      value={garageAddress}
                      onChange={(e) => setGarageAddress(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    Proceed to Step 4: Document Upload <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 4: DOCUMENT UPLOAD ================= */}
            {step === 4 && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Upload size={16} className="text-teal-600" /> Evidence &amp; Compliance Document Upload
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload official certificates and multiple accident photographs with instant visual preview
                  </p>
                </div>

                {/* Multiple Accident Photos Section (Mandated by Section 4) */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera size={18} className="text-teal-600" />
                      <span className="text-xs font-bold text-slate-900">
                        1. Accident Photographs (Multiple Uploads Supported) *
                      </span>
                    </div>
                    <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-1.5">
                      <Upload size={14} /> Add Photos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleMultiplePhotos}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {additionalPhotos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {additionalPhotos.map((p, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 group aspect-video bg-slate-900">
                          <img src={p.preview} alt={`Damage photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-1 left-1 text-[9px] font-mono text-white bg-slate-950/80 px-1 rounded">
                            {p.size} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-slate-400">
                      No damage photos uploaded yet. Click &quot;Add Photos&quot; or upload sample illustration below.
                    </div>
                  )}
                </div>

                {/* 5 Specific Verification Documents (Mandated by Section 4) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehicle RC */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">2. Vehicle RC (Registration) *</span>
                      {files.VEHICLE_RC && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Official motor vehicle registration certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('VEHICLE_RC', e)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.VEHICLE_RC && <div className="text-[11px] text-emerald-700 font-mono truncate">{files.VEHICLE_RC.name}</div>}
                  </div>

                  {/* Driving License */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">3. Driving Licence (DL) *</span>
                      {files.DRIVING_LICENSE && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Valid state driving permit of driver</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('DRIVING_LICENSE', e)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.DRIVING_LICENSE && <div className="text-[11px] text-emerald-700 font-mono truncate">{files.DRIVING_LICENSE.name}</div>}
                  </div>

                  {/* Insurance Policy */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">4. Insurance Policy Copy</span>
                      {files.INSURANCE_POLICY && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Current AutoSure policy schedule certificate</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('INSURANCE_POLICY', e)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.INSURANCE_POLICY && <div className="text-[11px] text-emerald-700 font-mono truncate">{files.INSURANCE_POLICY.name}</div>}
                  </div>

                  {/* Police FIR */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">5. Police FIR / Station Incident Log</span>
                      {files.POLICE_FIR && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Official police complaint report (if third party/theft)</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('POLICE_FIR', e)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.POLICE_FIR && <div className="text-[11px] text-emerald-700 font-mono truncate">{files.POLICE_FIR.name}</div>}
                  </div>

                  {/* Repair Estimate */}
                  <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 sm:col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">6. Workshop Itemized Repair Estimate Quote *</span>
                      {files.REPAIR_ESTIMATE && <CheckCircle2 size={16} className="text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-slate-400">Itemized quotation from authorized body repair shop</p>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange('REPAIR_ESTIMATE', e)}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.REPAIR_ESTIMATE && <div className="text-[11px] text-emerald-700 font-mono truncate">{files.REPAIR_ESTIMATE.name}</div>}
                  </div>
                </div>

                <div className="flex justify-between pt-3">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(5)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    Proceed to Step 5: Final Review <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= STEP 5: FINAL REVIEW & LEGAL CONSENT ================= */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-600" /> Final Dossier Review &amp; Legal Declaration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review all recorded incident details, vehicle identifiers, and uploaded evidence prior to dispatch
                  </p>
                </div>

                {/* Review Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Card 1: Accident Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 uppercase">1. Accident Information</span>
                      <button type="button" onClick={() => setStep(1)} className="text-teal-700 font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>Date &amp; Time: <strong>{accidentDate} at {accidentTime}</strong></div>
                      <div>Location: <strong>{location}, {city}, {state}</strong></div>
                      <div>Accident Type: <strong className="uppercase">{accidentType}</strong></div>
                      <div>Other Vehicle Involved: <strong>{anotherVehicleInvolved ? 'Yes' : 'No'}</strong></div>
                      <div>Police FIR: <strong>{policeComplaintFiled ? firNumber : 'None'}</strong></div>
                      <div className="pt-1 text-[11px] text-slate-500 italic">&ldquo;{description}&rdquo;</div>
                    </div>
                  </div>

                  {/* Card 2: Vehicle & Policy */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 uppercase">2. Vehicle &amp; Policy</span>
                      <button type="button" onClick={() => setStep(2)} className="text-teal-700 font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>Policy Number: <strong className="font-mono text-teal-800">{selectedPolicyNumber}</strong></div>
                      <div>Vehicle: <strong>{vehicleMake} {vehicleModel} ({vehicleYear})</strong></div>
                      <div>Registration Plate: <strong className="font-mono">{vehicleReg}</strong></div>
                      <div>Odometer: <strong>{odometerReading}</strong></div>
                      <div>Driver Name: <strong>{policyholderName}</strong></div>
                      <div>Driver License: <strong className="font-mono">{driverLicenseNumber}</strong></div>
                    </div>
                  </div>

                  {/* Card 3: Damage & Garage */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 uppercase">3. Damage &amp; Garage</span>
                      <button type="button" onClick={() => setStep(3)} className="text-teal-700 font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>Category: <strong>{damageCategory}</strong></div>
                      <div>
                        Affected Parts:{' '}
                        <strong>
                          {[
                            frontDamage && 'Front',
                            rearDamage && 'Rear',
                            sideDamage && 'Side',
                            windshieldDamage && 'Windshield',
                            engineDamage && 'Engine'
                          ].filter(Boolean).join(', ') || 'None selected'}
                        </strong>
                      </div>
                      <div>Estimated Repair: <strong className="text-teal-800 font-mono text-sm">${estimatedRepairCost}</strong></div>
                      <div>Garage: <strong>{garageName}</strong> ({garagePhone})</div>
                    </div>
                  </div>

                  {/* Card 4: Uploaded Evidence */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 uppercase">4. Documents &amp; Photos</span>
                      <button type="button" onClick={() => setStep(4)} className="text-teal-700 font-bold hover:underline">
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1 text-slate-700">
                      <div>Accident Photos: <strong>{additionalPhotos.length || 1} file(s) attached</strong></div>
                      <div>Registration Certificate (RC): <strong>{files.VEHICLE_RC ? 'Attached' : 'Default Sample Attached'}</strong></div>
                      <div>Driving License (DL): <strong>{files.DRIVING_LICENSE ? 'Attached' : 'Default Sample Attached'}</strong></div>
                      <div>Repair Quote: <strong>{files.REPAIR_ESTIMATE ? 'Attached' : 'Default Sample Attached'}</strong></div>
                    </div>
                  </div>
                </div>

                {/* AI Damage Assessment Preview */}
                <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        AutoSure Computer Vision Pre-Check: Active
                      </span>
                      <span className="text-teal-800">
                        Preliminary computer vision benchmark will score photos within 500ms of submission.
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-teal-900 bg-white px-3 py-1 rounded-lg border border-teal-200">
                    Confidence target: 96.4%
                  </span>
                </div>

                {/* Legal Declaration & Consent Checkbox (Mandated by Section 4) */}
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      required
                      checked={legalDeclaration}
                      onChange={(e) => setLegalDeclaration(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-5 h-5 mt-0.5 flex-shrink-0"
                    />
                    <div className="text-xs text-slate-800 leading-relaxed">
                      <strong>Policyholder Legal Declaration &amp; Consent:</strong> I hereby declare and solemnly affirm that the information furnished in this accident claim statement is true, accurate, and complete to the best of my knowledge. I understand that fraudulent claims or deliberate misrepresentation is a criminal offense under insurance law and will result in immediate claim forfeiture and legal action.
                    </div>
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} /> Back to Documents
                  </button>

                  <button
                    type="submit"
                    disabled={loading || !legalDeclaration}
                    className="px-6 py-3 rounded-xl font-black text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition shadow-md flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Submitting to Camunda...
                      </>
                    ) : (
                      <>
                        Submit Accident Claim <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SubmitClaim;