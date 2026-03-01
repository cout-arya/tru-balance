import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { isValidEmail } from '../utils/helpers';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error('Please enter a valid email');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.PROD ? '' : 'http://localhost:5001'}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email
      }));

      toast.success(`Welcome to TruBalance, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { label: '', strength: 0, color: '' };

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', strength: 33, color: 'bg-red-500' };
    if (strength <= 4) return { label: 'Medium', strength: 66, color: 'bg-yellow-500' };
    return { label: 'Strong', strength: 100, color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

        {/* Brand Side */}
        <div className="w-full md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-800 rounded-full opacity-50 blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">TruBalance</h1>
            <p className="text-indigo-200 mt-2 text-sm">Join thousands of smart savers today.</p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="py-2">
              <h3 className="font-semibold mb-2">Why Join Us?</h3>
              <ul className="space-y-3 text-sm text-indigo-100/90">
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center">✓</div>
                  Smart Categorization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center">✓</div>
                  Budget Forecasts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/50 flex items-center justify-center">✓</div>
                  Financial Health Score
                </li>
              </ul>
            </div>
          </div>

          <div className="relative z-10 text-xs text-indigo-300">
            Already trusted by 10,000+ users
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-8 md:p-10 bg-white">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500 mb-6 text-sm">Sign up for free and start tracking expenses.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FaUser />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    required
                  />
                </div>
                {formData.password && (
                  <div className="flex items-center gap-2 mt-1.5 px-0.5">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{passwordStrength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    required
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-500">
                      <FaCheckCircle />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
