import React, { useState, useEffect } from 'react';
import { workflowAPI } from '../services/api';
import {
  Cpu,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Database,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';

const WorkflowMonitoring = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await workflowAPI.getTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Camunda Engine Status Banner */}
      <div className="bg-[#0f2942] text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-teal-300 font-semibold mb-1">
            <Activity size={14} /> Camunda Platform 7 Engine: RUNNING
          </div>
          <h1 className="text-2xl font-bold">BPMN Workflow &amp; SQLite Monitor</h1>
          <p className="text-slate-300 text-xs mt-1">
            Process Key: <code className="bg-slate-800 text-teal-300 px-1.5 py-0.5 rounded font-mono">auto_accident_claim_process</code> | SQLite Database: <code className="bg-slate-800 text-sky-300 px-1.5 py-0.5 rounded font-mono">insurance.db</code>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadTasks}
            className="btn btn-outline text-white border-white/30 text-xs flex items-center gap-1.5"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <a
            href="http://localhost:8080/camunda/app/cockpit/default/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-teal text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <ExternalLink size={14} /> Open Camunda Cockpit
          </a>
        </div>
      </div>

      {/* SQLite Terminal Query Guide Card */}
      <div className="card space-y-3 bg-gradient-to-br from-slate-900 to-[#0f2942] text-white border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 text-teal-400">
            <Database size={16} /> Inspecting Your Data in SQLite (Terminal Commands)
          </h2>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
            insurance.db
          </span>
        </div>

        <p className="text-xs text-slate-300">
          All claims, documents, reviews, investigations, and settlements created on the website are persisted in your local SQLite database. Open a command prompt and run:
        </p>

        <div className="bg-slate-950 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800 space-y-1 overflow-x-auto">
          <div className="text-slate-500"># 1. Open SQLite database</div>
          <div>sqlite3 insurance.db</div>
          <div className="text-slate-500 mt-2"># 2. View all 13 application tables</div>
          <div>.tables</div>
          <div className="text-slate-500 mt-2"># 3. View live accident insurance claims</div>
          <div>SELECT id, claim_number, status, risk_level, estimated_damage, approved_settlement_amount FROM insurance_claims;</div>
          <div className="text-slate-500 mt-2"># 4. View completed simulated settlements</div>
          <div>SELECT claim_number, final_payable_amount, payment_status, transaction_reference FROM settlements;</div>
        </div>
      </div>

      {/* Active User Tasks in Camunda Engine */}
      <div className="card space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers size={16} className="text-sky-600" /> Active Workflow Execution Tasks
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Tasks currently awaiting human action in Camunda Tasklist</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            {tasks.length} Active {tasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Scanning Camunda runtime engine...</div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            <CheckCircle2 size={32} className="mx-auto text-teal-500 mb-2" />
            <p className="font-semibold text-slate-700">No active human user tasks in the engine.</p>
            <p className="text-slate-400 mt-0.5">All running claims have progressed past user tasks or are completed.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Task Name</th>
                  <th>BPMN Definition Key</th>
                  <th>Claim Number</th>
                  <th>Target Assignee</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.taskId}>
                    <td className="font-mono text-xs font-bold text-slate-800">{t.taskId}</td>
                    <td className="text-xs font-semibold text-sky-800">{t.taskName}</td>
                    <td className="text-xs text-slate-600 font-mono">{t.taskDefinitionKey}</td>
                    <td>
                      <span className="font-mono text-xs font-bold text-slate-900">{t.claimNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="badge badge-submitted text-[10px]">
                        {t.assignee || 'Candidate Pool'}
                      </span>
                    </td>
                    <td className="text-xs text-slate-500">
                      {t.createTime ? new Date(t.createTime).toLocaleTimeString() : '-'}
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

export default WorkflowMonitoring;
