import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.PROD ? '' : 'http://localhost:5001'}/api/auth/login`, formData);

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email
      }));

      toast.success(`Welcome back, ${res.data.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">

        {/* Brand Side - Professional & Minimalist */}
        <div className="w-full md:w-5/12 bg-indigo-600 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-800 rounded-full opacity-50 blur-2xl"></div>

          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">TruBalance</h1>
            <p className="text-indigo-200 mt-2 text-sm">Financial clarity, simplified.</p>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm border border-indigo-400/20">
                <span className="text-sm">📊</span>
              </div>
              <p className="text-sm font-medium text-indigo-50">Smart Analytics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm border border-indigo-400/20">
                <span className="text-sm">🛡️</span>
              </div>
              <p className="text-sm font-medium text-indigo-50">Secure Data</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm border border-indigo-400/20">
                <span className="text-sm">💡</span>
              </div>
              <p className="text-sm font-medium text-indigo-50">AI Insights</p>
            </div>
          </div>

          <div className="relative z-10 text-xs text-indigo-300">
            © 2026 TruBalance Inc.
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full md:w-7/12 p-8 md:p-12">
          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
            <p className="text-slate-500 mb-8 text-sm">Please enter your details to sign in.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="name@company.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <FaSpinner className="animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
