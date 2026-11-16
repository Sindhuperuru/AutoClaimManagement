import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { BarChart3, PieChart, TrendingUp, ShieldCheck, DollarSign, Clock } from 'lucide-react';

const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAnalytics();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-4 mb-4">
          <BarChart3 className="text-teal-600" /> Claims Analytics &amp; Workflow Intelligence
        </h1>

        {/* 4 KPI summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block">Total Claims:</span>
            <span className="text-2xl font-extrabold text-slate-900">{stats?.totalClaims || 0}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block">Average Claim Value:</span>
            <span className="text-2xl font-extrabold text-sky-700">${stats?.averageClaimAmount?.toLocaleString() || '0.00'}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block">Settled Volume:</span>
            <span className="text-2xl font-extrabold text-emerald-600">${stats?.totalSettledAmount?.toLocaleString() || '0.00'}</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block">Avg SLA Resolution:</span>
            <span className="text-2xl font-extrabold text-indigo-600">{stats?.averageResolutionDays || 3.4} Days</span>
          </div>
        </div>

        {/* Visual Bar Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Risk Level Distribution */}
          <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={16} className="text-teal-600" /> DMN Risk Classification Distribution
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700">Low Risk (Automated / Fast-Track)</span>
                  <span className="font-mono text-slate-800">{stats?.claimsByRiskLevel?.LOW || 1} claims</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700">Medium Risk (Desk &amp; Workshop Audit)</span>
                  <span className="font-mono text-slate-800">{stats?.claimsByRiskLevel?.MEDIUM || 1} claims</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-rose-700">High Risk (SIU Fraud Inquiry)</span>
                  <span className="font-mono text-slate-800">{stats?.claimsByRiskLevel?.HIGH || 0} claims</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Claims Ingestion */}
          <div className="p-5 border border-slate-200 rounded-xl bg-white space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-sky-600" /> Monthly Accident Claim Ingestion
            </h3>

            <div className="flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-200">
              {stats?.claimsByMonth && Object.entries(stats.claimsByMonth).map(([month, count]) => {
                const heightPct = Math.min(100, Math.max(15, count * 3));
                return (
                  <div key={month} className="flex flex-col items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-mono text-slate-600 font-bold">{count}</span>
                    <div
                      className="w-8 bg-[#0f2942] rounded-t hover:bg-sky-600 transition"
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[11px] font-semibold text-slate-500">{month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
