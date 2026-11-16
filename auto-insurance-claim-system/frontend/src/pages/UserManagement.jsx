import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Users, Shield, CheckCircle2, UserCheck, Search } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch =
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="text-sky-600" /> User &amp; Role Management
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage policyholders, field agents, claims officers, and administrators</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input text-xs pl-8"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="form-select text-xs font-semibold py-1.5"
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_CUSTOMER">Policyholders</option>
              <option value="ROLE_AGENT">Field Agents</option>
              <option value="ROLE_CLAIMS_OFFICER">Claims Officers</option>
              <option value="ROLE_ADMIN">Administrators</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading user accounts...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>System Role</th>
                  <th>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="font-mono font-bold text-slate-900 text-xs">{u.username}</span>
                    </td>
                    <td className="text-xs font-semibold text-slate-800">{u.fullName}</td>
                    <td className="text-xs text-slate-600 font-mono">{u.email}</td>
                    <td className="text-xs text-slate-600">{u.phoneNumber || 'N/A'}</td>
                    <td>
                      <span className={`badge text-[10px] ${
                        u.role === 'ROLE_CUSTOMER' ? 'badge-low' :
                        u.role === 'ROLE_AGENT' ? 'badge-agent' :
                        u.role === 'ROLE_CLAIMS_OFFICER' ? 'badge-officer' : 'badge-investigation'
                      }`}>
                        {u.role?.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                        <CheckCircle2 size={12} /> Active
                      </span>
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

export default UserManagement;
