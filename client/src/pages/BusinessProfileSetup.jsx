import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const BusinessProfileSetup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Business Details
        businessName: '',
        businessType: 'Freelancer',
        gstin: '',
        pan: '',
        email: '',
        phone: '',
        website: '',

        // Address
        street: '',
        city: '',
        state: '',
        pincode: '',

        // Bank Details
        accountNumber: '',
        ifsc: '',
        bankName: '',
        branch: '',

        // Terms
        termsAndConditions: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
    });

    const [errors, setErrors] = useState({});

    const [isEditing, setIsEditing] = useState(false);

    // Check if user already has a profile and fetch data if so
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001')}/api/business-profile`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (response.data) {
                    // Profile exists, populate form and set editing mode
                    setIsEditing(true);
                    setFormData(prev => ({
                        ...prev,
                        ...response.data,
                        // Ensure nested objects are handled if they exist
                        street: response.data.address?.street || '',
                        city: response.data.address?.city || '',
                        state: response.data.address?.state || '',
                        pincode: response.data.address?.pincode || '',
                        accountNumber: response.data.bankDetails?.accountNumber || '',
                        ifsc: response.data.bankDetails?.ifsc || '',
                        bankName: response.data.bankDetails?.bankName || '',
                        branch: response.data.bankDetails?.branch || ''
                    }));
                    // Optional: Toast to let them know they are editing
                    // toast.info('Loaded existing business profile');
                }
            } catch (error) {
                // If 404, it means no profile, which is fine - we stay in create mode
                if (error.response?.status !== 404) {
                    console.error('Error fetching profile:', error);
                }
            }
        };

        fetchProfileData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.businessName?.trim()) newErrors.businessName = 'Business name is required';
            if (!formData.businessType) newErrors.businessType = 'Business type is required';
            if (formData.gstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstin)) {
                newErrors.gstin = 'Invalid GSTIN format';
            }
            if (formData.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
                newErrors.pan = 'Invalid PAN format';
            }
            if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
                newErrors.phone = 'Invalid phone number';
            }
            if (formData.email && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }
        }

        if (step === 2) {
            if (!formData.state) newErrors.state = 'State is required for GST calculation';
            if (formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
                newErrors.pincode = 'Invalid pincode';
            }
        }

        if (step === 3) {
            if (formData.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc)) {
                newErrors.ifsc = 'Invalid IFSC code';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep()) {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep()) return;

        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Prepare data
            const profileData = {
                businessName: formData.businessName,
                businessType: formData.businessType,
                gstin: formData.gstin || undefined,
                pan: formData.pan || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                website: formData.website || undefined,
                address: {
                    street: formData.street || undefined,
                    city: formData.city || undefined,
                    state: formData.state,
                    pincode: formData.pincode || undefined
                },
                bankDetails: {
                    accountNumber: formData.accountNumber || undefined,
                    ifsc: formData.ifsc || undefined,
                    bankName: formData.bankName || undefined,
                    branch: formData.branch || undefined
                },
                termsAndConditions: formData.termsAndConditions
            };

            const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/business-profile`;

            if (isEditing) {
                await axios.put(apiUrl, profileData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Business profile updated successfully!');
            } else {
                await axios.post(apiUrl, profileData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Business profile created successfully!');
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Error saving profile:', error);
            // If we get "already exists" error in create mode, suggest refreshing or handle it
            if (!isEditing && error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
                toast.error('Profile already exists. Switching to update mode...');
                setIsEditing(true); // Switch to edit mode for next try
            } else {
                toast.error(error.response?.data?.message || 'Failed to save business profile');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Complete Your Business Profile</h1>
                    <p className="text-slate-600">This information will be used for generating invoices and reports</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Step {step} of 4</span>
                        <span className="text-sm text-slate-500">{Math.round((step / 4) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(step / 4) * 100}%` }}
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Business Details */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Business Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.businessName ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                    placeholder="Enter your business name"
                                />
                                {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Business Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="businessType"
                                    value={formData.businessType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="Freelancer">Freelancer</option>
                                    <option value="SME">SME (Small & Medium Enterprise)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        GSTIN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="gstin"
                                        value={formData.gstin}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.gstin ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase`}
                                        placeholder="27AAPFU0939F1ZV"
                                        maxLength={15}
                                    />
                                    {errors.gstin && <p className="text-red-500 text-sm mt-1">{errors.gstin}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        PAN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="pan"
                                        value={formData.pan}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.pan ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase`}
                                        placeholder="AAPFU0939F"
                                        maxLength={10}
                                    />
                                    {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email (Optional)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        placeholder="business@example.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Phone (Optional)
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Website (Optional)
                                </label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="https://www.example.com"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Business Address</h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Street Address (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="street"
                                    value={formData.street}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="123 Main Street"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        City (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.state ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                    >
                                        <option value="">Select State</option>
                                        {INDIAN_STATES.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                                    <p className="text-sm text-slate-500 mt-1">Required for GST calculation</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Pincode (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 border ${errors.pincode ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                    placeholder="400001"
                                    maxLength={6}
                                />
                                {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank Details */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Bank Details (Optional)</h2>
                            <p className="text-sm text-slate-600 mb-4">These details will appear on your invoices</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Account Number
                                    </label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="1234567890"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        IFSC Code
                                    </label>
                                    <input
                                        type="text"
                                        name="ifsc"
                                        value={formData.ifsc}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border ${errors.ifsc ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase`}
                                        placeholder="SBIN0001234"
                                        maxLength={11}
                                    />
                                    {errors.ifsc && <p className="text-red-500 text-sm mt-1">{errors.ifsc}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Bank Name
                                    </label>
                                    <input
                                        type="text"
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="State Bank of India"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Mumbai Main Branch"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Terms & Conditions */}
                    {step === 4 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4">Terms & Conditions</h2>
                            <p className="text-sm text-slate-600 mb-4">Default terms that will appear on your invoices</p>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Terms & Conditions
                                </label>
                                <textarea
                                    name="termsAndConditions"
                                    value={formData.termsAndConditions}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Enter your terms and conditions..."
                                />
                            </div>

                            {/* Summary */}
                            <div className="bg-slate-50 rounded-lg p-6 mt-6">
                                <h3 className="font-semibold text-slate-800 mb-4">Profile Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="font-medium">Business:</span> {formData.businessName}</p>
                                    <p><span className="font-medium">Type:</span> {formData.businessType}</p>
                                    {formData.gstin && <p><span className="font-medium">GSTIN:</span> {formData.gstin}</p>}
                                    <p><span className="font-medium">State:</span> {formData.state || 'Not specified'}</p>
                                    {formData.email && <p><span className="font-medium">Email:</span> {formData.email}</p>}
                                    {formData.phone && <p><span className="font-medium">Phone:</span> {formData.phone}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                            >
                                Back
                            </button>
                        )}

                        {step < 4 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="ml-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creating Profile...' : 'Complete Setup'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessProfileSetup;
