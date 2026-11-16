import React, { useState, useEffect } from 'react';
import { policyAPI } from '../services/api';
import { Shield, Car, CheckCircle2, Search } from 'lucide-react';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const res = await policyAPI.getAll();
      setPolicies(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = policies.filter(p =>
    p.policyNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicle?.make?.toLowerCase().includes(search.toLowerCase()) ||
    p.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Shield className="text-teal-600" /> Automobile Policy Registry
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Insurance policies, coverage riders, and vehicle bindings</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search policy / plate..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input text-xs pl-8"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading policy database...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Policy Number</th>
                  <th>Coverage Type</th>
                  <th>Vehicle Details</th>
                  <th>Sum Insured</th>
                  <th>Deductible</th>
                  <th>Valid Period</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-mono font-bold text-sky-800 text-xs">{p.policyNumber}</span>
                    </td>
                    <td>
                      <span className="font-semibold text-xs text-slate-800">{p.policyType}</span>
                    </td>
                    <td>
                      <div className="text-xs font-semibold text-slate-800">
                        {p.vehicle?.make} {p.vehicle?.model} ({p.vehicle?.yearOfManufacture})
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        Plate: {p.vehicle?.registrationNumber}
                      </div>
                    </td>
                    <td>
                      <strong className="text-xs text-slate-900">${p.sumInsured?.toLocaleString()}</strong>
                    </td>
                    <td className="text-xs text-slate-600 font-mono">${p.deductibleAmount}</td>
                    <td className="text-xs text-slate-600 whitespace-nowrap">
                      {p.startDate} to {p.endDate}
                    </td>
                    <td>
                      <span className="badge badge-low text-[10px]">{p.status}</span>
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

export default PolicyManagement;
