import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const CreateInvoice = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState([]);
    const [businessProfile, setBusinessProfile] = useState(null);
    const [showAddClientModal, setShowAddClientModal] = useState(false);

    const [formData, setFormData] = useState({
        clientId: '',
        dueDate: '',
        status: 'Draft',
        notes: '',
        termsAndConditions: '',
        lineItems: [
            {
                itemName: '',
                description: '',
                quantity: 1,
                rate: 0,
                discount: 0,
                gstPercentage: 18
            }
        ]
    });

    const [newClient, setNewClient] = useState({
        clientName: '',
        email: '',
        phone: '',
        address: { state: '' }
    });

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');

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

    useEffect(() => {
        fetchClients();
        fetchBusinessProfile();

        if (isEditMode) {
            fetchInvoice();
        } else {
            // Set default due date to 30 days from now
            const defaultDueDate = new Date();
            defaultDueDate.setDate(defaultDueDate.getDate() + 30);
            setFormData(prev => ({
                ...prev,
                dueDate: defaultDueDate.toISOString().split('T')[0]
            }));
        }
    }, [id]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/clients`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClients(response.data.clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };

    const fetchBusinessProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/business-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Backend returns profile directly, not wrapped in businessProfile property
            setBusinessProfile(response.data);

            // Safely access termsAndConditions with optional chaining
            if (response.data?.termsAndConditions) {
                setFormData(prev => ({
                    ...prev,
                    termsAndConditions: response.data.termsAndConditions
                }));
            }
        } catch (error) {
            console.error('Error fetching business profile:', error);
            // Don't throw error if profile doesn't exist - it's optional for invoice creation
            if (error.response?.status === 404) {
                console.log('No business profile found - user can still create invoices');
            }
        }
    };

    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const invoice = response.data.invoice;
            setFormData({
                clientId: invoice.clientId._id,
                dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
                status: invoice.status,
                notes: invoice.notes || '',
                termsAndConditions: invoice.termsAndConditions || '',
                lineItems: invoice.lineItems.map(item => ({
                    itemName: item.itemName,
                    description: item.description || '',
                    quantity: item.quantity,
                    rate: item.rate,
                    discount: item.discount || 0,
                    gstPercentage: item.gstPercentage
                }))
            });
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLineItemChange = (index, field, value) => {
        const updatedLineItems = [...formData.lineItems];
        updatedLineItems[index][field] = value;
        setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                {
                    itemName: '',
                    description: '',
                    quantity: 1,
                    rate: 0,
                    discount: 0,
                    gstPercentage: 18
                }
            ]
        }));
    };

    const removeLineItem = (index) => {
        if (formData.lineItems.length === 1) {
            toast.error('At least one line item is required');
            return;
        }

        const updatedLineItems = formData.lineItems.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, lineItems: updatedLineItems }));
    };

    const calculateLineItemTotal = (item) => {
        const subtotal = (item.quantity * item.rate) - (item.discount || 0);
        return subtotal;
    };

    const calculateLineItemTax = (item) => {
        const subtotal = calculateLineItemTotal(item);
        return (subtotal * item.gstPercentage) / 100;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalTax = 0;

        formData.lineItems.forEach(item => {
            subtotal += calculateLineItemTotal(item);
            totalTax += calculateLineItemTax(item);
        });

        return {
            subtotal,
            totalTax,
            total: subtotal + totalTax
        };
    };

    const getGSTBreakup = () => {
        if (!formData.clientId || !businessProfile) return null;

        const selectedClient = clients.find(c => c._id === formData.clientId);
        if (!selectedClient || !selectedClient.address?.state || !businessProfile.address?.state) {
            return null;
        }

        const isIntraState = selectedClient.address.state === businessProfile.address.state;
        const { totalTax } = calculateTotals();

        if (isIntraState) {
            return {
                type: 'Intra-State',
                cgst: totalTax / 2,
                sgst: totalTax / 2,
                igst: 0
            };
        } else {
            return {
                type: 'Inter-State',
                cgst: 0,
                sgst: 0,
                igst: totalTax
            };
        }
    };

    const handleAddClient = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/api/clients`,
                newClient,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Client added successfully');
            setClients([...clients, response.data.client]);
            setFormData(prev => ({ ...prev, clientId: response.data.client._id }));
            setShowAddClientModal(false);
            setNewClient({ clientName: '', email: '', phone: '', address: { state: '' } });
        } catch (error) {
            console.error('Error adding client:', error);
            toast.error(error.response?.data?.message || 'Failed to add client');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clientId) {
            toast.error('Please select a client');
            return;
        }

        if (formData.lineItems.some(item => !item.itemName || item.rate <= 0)) {
            toast.error('Please fill in all line item details');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const invoiceData = {
                ...formData,
                lineItems: formData.lineItems.map(item => ({
                    itemName: item.itemName,
                    description: item.description,
                    quantity: Number(item.quantity),
                    rate: Number(item.rate),
                    discount: Number(item.discount || 0),
                    gstPercentage: Number(item.gstPercentage)
                }))
            };

            if (isEditMode) {
                await axios.put(
                    `${API_URL}/api/invoices/${id}`,
                    invoiceData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Invoice updated successfully');
            } else {
                await axios.post(
                    `${API_URL}/api/invoices`,
                    invoiceData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Invoice created successfully');
            }

            navigate('/invoices');
        } catch (error) {
            console.error('Error saving invoice:', error);
            toast.error(error.response?.data?.message || 'Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const totals = calculateTotals();
    const gstBreakup = getGSTBreakup();

    if (loading && isEditMode) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {isEditMode ? 'Edit Invoice' : 'Create Invoice'}
                    </h1>
                    <p className="text-slate-600 mt-1">
                        {isEditMode ? 'Update invoice details' : 'Generate a new GST-compliant invoice'}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/invoices')}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                    <FaTimes />
                    <span>Cancel</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client & Basic Info */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Invoice Details</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Client <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-2">
                                <select
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleChange}
                                    required
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>
                                            {client.clientName} {client.address?.state && `(${client.address.state})`}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowAddClientModal(true)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    title="Add New Client"
                                >
                                    <FaPlus />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Due Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="Draft">Draft</option>
                                <option value="Sent">Sent</option>
                                <option value="Paid">Paid</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Line Items</h2>
                        <button
                            type="button"
                            onClick={addLineItem}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                        >
                            <FaPlus />
                            <span>Add Item</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.lineItems.map((item, index) => (
                            <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-sm font-medium text-slate-700">Item #{index + 1}</h3>
                                    {formData.lineItems.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLineItem(index)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                            title="Remove Item"
                                        >
                                            <FaTrash />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Item Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            onChange={(e) => handleLineItemChange(index, 'itemName', e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            placeholder="Web Development"
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={item.description}
                                            onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            placeholder="Full-stack development"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                                            min="1"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Rate (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={item.rate}
                                            onChange={(e) => handleLineItemChange(index, 'rate', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Discount (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={item.discount}
                                            onChange={(e) => handleLineItemChange(index, 'discount', e.target.value)}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            GST %
                                        </label>
                                        <select
                                            value={item.gstPercentage}
                                            onChange={(e) => handleLineItemChange(index, 'gstPercentage', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        >
                                            <option value="0">0%</option>
                                            <option value="5">5%</option>
                                            <option value="12">12%</option>
                                            <option value="18">18%</option>
                                            <option value="28">28%</option>
                                        </select>
                                    </div>

                                    <div className="lg:col-span-2 flex items-end">
                                        <div className="w-full p-3 bg-indigo-50 rounded-lg">
                                            <p className="text-xs text-slate-600 mb-1">Item Total</p>
                                            <p className="text-lg font-bold text-indigo-600">
                                                {formatCurrency(calculateLineItemTotal(item) + calculateLineItemTax(item))}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                (Tax: {formatCurrency(calculateLineItemTax(item))})
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals & GST Breakup */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Summary</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex justify-between text-slate-700">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-slate-700">
                                <span>Total Tax:</span>
                                <span className="font-semibold">{formatCurrency(totals.totalTax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-800 pt-3 border-t border-slate-200">
                                <span>Total Amount:</span>
                                <span className="text-indigo-600">{formatCurrency(totals.total)}</span>
                            </div>
                        </div>

                        {gstBreakup && (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                                    GST Breakup ({gstBreakup.type})
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">CGST:</span>
                                        <span className="font-medium">{formatCurrency(gstBreakup.cgst)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">SGST:</span>
                                        <span className="font-medium">{formatCurrency(gstBreakup.sgst)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">IGST:</span>
                                        <span className="font-medium">{formatCurrency(gstBreakup.igst)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes & Terms */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Additional Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Thank you for your business!"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Terms & Conditions
                            </label>
                            <textarea
                                name="termsAndConditions"
                                value={formData.termsAndConditions}
                                onChange={handleChange}
                                rows={4}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Payment due within 30 days..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/invoices')}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaSave />
                        <span>{loading ? 'Saving...' : (isEditMode ? 'Update Invoice' : 'Create Invoice')}</span>
                    </button>
                </div>
            </form>

            {/* Add Client Modal */}
            {showAddClientModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-800">Quick Add Client</h2>
                            <button
                                onClick={() => setShowAddClientModal(false)}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleAddClient} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Client Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newClient.clientName}
                                    onChange={(e) => setNewClient({ ...newClient, clientName: e.target.value })}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="ABC Corporation"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={newClient.email}
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="contact@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    value={newClient.phone}
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="9876543210"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newClient.address.state}
                                    onChange={(e) => setNewClient({ ...newClient, address: { state: e.target.value } })}
                                    required
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">Required for GST calculation</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddClientModal(false)}
                                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    Add Client
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateInvoice;
