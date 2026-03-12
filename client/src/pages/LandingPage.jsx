import { Link, useNavigate } from 'react-router-dom';
import { FaChartLine, FaShieldAlt, FaBrain, FaArrowRight, FaCheckCircle, FaWallet, FaBolt, FaPlay } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function LandingPage() {
    const navigate = useNavigate();
    const [isDemoLoading, setIsDemoLoading] = useState(false);

    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        try {
            const res = await axios.post(`${import.meta.env.PROD ? '' : 'http://localhost:5001'}/api/auth/demo-login`);
            
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify({
                _id: res.data._id,
                name: res.data.name,
                email: res.data.email
            }));

            toast.success(`Welcome to the Demo, ${res.data.name}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Demo login failed');
        } finally {
            setIsDemoLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 w-full z-50 bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900">TruBalance</span>
                        </Link>

                        {/* Navigation Links - Desktop */}
                        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                How It Works
                            </a>
                            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                                Pricing
                            </a>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            Smart Financial Management
                            <span className="block text-indigo-600">Made Simple</span>
                        </h1>

                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                            Track expenses, manage budgets, and get AI-powered insights to make better financial decisions.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                            <button
                                onClick={handleDemoLogin}
                                disabled={isDemoLoading}
                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isDemoLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <FaPlay className="text-sm" />
                                )}
                                Try Live Demo
                            </button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                            <Link
                                to="/register"
                                className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                            >
                                Start Free Trial
                                <FaArrowRight />
                            </Link>
                            <a
                                href="#features"
                                className="w-full sm:w-auto px-8 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                Learn More
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-emerald-500" />
                                <span>Free to start</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-emerald-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FaCheckCircle className="text-emerald-500" />
                                <span>Cancel anytime</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Everything you need to manage your finances
                        </h2>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Powerful tools to help you track spending, set budgets, and achieve your financial goals.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                <FaChartLine className="text-indigo-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Real-Time Analytics
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Visualize your income and expenses with interactive charts and detailed breakdowns.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                <FaBrain className="text-purple-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                AI Insights
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Get personalized recommendations based on your spending patterns and financial goals.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                                <FaShieldAlt className="text-emerald-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Secure & Private
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Your financial data is encrypted and protected with industry-standard security.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                <FaWallet className="text-blue-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Budget Planning
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Set monthly budgets for different categories and track your progress in real-time.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                                <FaBolt className="text-amber-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Quick Entry
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Add transactions quickly with smart categorization and recurring transaction support.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                                <FaChartLine className="text-rose-600 text-xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">
                                Export Reports
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Download your financial data to Excel for detailed analysis and record-keeping.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                        Ready to take control of your finances?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Join users who are managing their money smarter with TruBalance.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Get Started Free
                        <FaArrowRight />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">T</span>
                            </div>
                            <span className="text-xl font-bold">TruBalance</span>
                        </div>

                        <p className="text-slate-400 text-sm">
                            © 2026 TruBalance. All rights reserved.
                        </p>

                        <div className="flex gap-6 text-sm text-slate-400">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
