import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { Shield, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    drivingLicenseNumber: '',
    nationalId: '',
    address: '',
    city: '',
    state: '',
    postalCode: ''
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register({ ...formData, role: 'ROLE_CUSTOMER' });
      navigate('/customer/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 mx-auto flex items-center justify-center text-teal-400 shadow-md mb-3 ring-4 ring-slate-100">
          <Shield size={30} className="stroke-[2.5]" />
        </div>
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">AutoSure</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200 font-mono">
            New Policyholder
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Register to manage policies and file automated accident claims</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Johnathan Doe"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Username *</label>
                <input
                  type="text"
                  required
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. jdoe22"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. john@example.com"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Create a strong password"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="+1-555-019-2831"
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label">Driving License Number *</label>
                <input
                  type="text"
                  required
                  name="drivingLicenseNumber"
                  value={formData.drivingLicenseNumber}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. DL-IL-9847291"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="form-input"
                placeholder="Residential address"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="form-group mb-0">
                <label className="form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="City"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="State"
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="ZIP"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-2.5 font-semibold mt-4"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
