import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPlus, FaUsers, FaSearch, FaEdit, FaTrash, FaEye, FaTimes } from 'react-icons/fa';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        clientName: '',
        contactPerson: '',
        email: '',
        phone: '',
        gstin: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        notes: ''
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
    }, []);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                ...(searchTerm && { search: searchTerm })
            });

            const response = await axios.get(
                `${API_URL}/api/clients?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setClients(response.data.clients);
        } catch (error) {
            console.error('Error fetching clients:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchClients();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setFormData({
            clientName: '',
            contactPerson: '',
            email: '',
            phone: '',
            gstin: '',
            address: {
                street: '',
                city: '',
                state: '',
                pincode: ''
            },
            notes: ''
        });
        setEditingClient(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem('token');

            if (editingClient) {
                // Update existing client
                await axios.put(
                    `${API_URL}/api/clients/${editingClient._id}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Client updated successfully');
            } else {
                // Create new client
                await axios.post(
                    `${API_URL}/api/clients`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                toast.success('Client created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            toast.error(error.response?.data?.message || 'Failed to save client');
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            clientName: client.clientName || '',
            contactPerson: client.contactPerson || '',
            email: client.email || '',
            phone: client.phone || '',
            gstin: client.gstin || '',
            address: {
                street: client.address?.street || '',
                city: client.address?.city || '',
                state: client.address?.state || '',
                pincode: client.address?.pincode || ''
            },
            notes: client.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (clientId) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}/api/clients/${clientId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Client deleted successfully');
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            toast.error(error.response?.data?.message || 'Failed to delete client');
        }
    };

    if (loading) {
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
                    <h1 className="text-3xl font-bold text-slate-800">Clients</h1>
                    <p className="text-slate-600 mt-1">Manage your client information</p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                >
                    <FaPlus />
                    <span>Add Client</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, or contact person..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Clients Grid */}
            {clients.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-200">
                    <FaUsers className="mx-auto text-6xl text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No clients found</h3>
                    <p className="text-slate-500 mb-6">Add your first client to get started</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                        <FaPlus />
                        <span>Add Client</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <div key={client._id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-1">{client.clientName}</h3>
                                    {client.contactPerson && (
                                        <p className="text-sm text-slate-600">{client.contactPerson}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                        title="Delete"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                {client.email && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-medium">Email:</span>
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-medium">Phone:</span>
                                        <span>{client.phone}</span>
                                    </div>
                                )}
                                {client.address?.state && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-medium">State:</span>
                                        <span>{client.address.state}</span>
                                    </div>
                                )}
                                {client.gstin && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <span className="font-medium">GSTIN:</span>
                                        <span className="font-mono text-xs">{client.gstin}</span>
                                    </div>
                                )}
                            </div>

                            {client.notes && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <p className="text-xs text-slate-500 line-clamp-2">{client.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Client Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-800">
                                {editingClient ? 'Edit Client' : 'Add New Client'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4">Basic Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Client Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="ABC Corporation"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Contact Person
                                        </label>
                                        <input
                                            type="text"
                                            name="contactPerson"
                                            value={formData.contactPerson}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
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
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="9876543210"
                                            maxLength={10}
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            GSTIN
                                        </label>
                                        <input
                                            type="text"
                                            name="gstin"
                                            value={formData.gstin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase"
                                            placeholder="27AAPFU0939F1ZV"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-4">Address</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Street
                                        </label>
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="123 Main Street"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={formData.address.city}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Mumbai"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            State
                                        </label>
                                        <select
                                            name="address.state"
                                            value={formData.address.state}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="">Select State</option>
                                            {INDIAN_STATES.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            name="address.pincode"
                                            value={formData.address.pincode}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="400001"
                                            maxLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Additional notes about this client..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                >
                                    {editingClient ? 'Update Client' : 'Add Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
