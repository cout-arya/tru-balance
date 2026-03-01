import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPlus, FaFileInvoice, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');

    useEffect(() => {
        fetchInvoices();
        fetchStats();
    }, [page, statusFilter]);

    const fetchInvoices = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(statusFilter && { status: statusFilter }),
                ...(searchTerm && { search: searchTerm })
            });

            const response = await axios.get(
                `${API_URL}/api/invoices?${params}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setInvoices(response.data.invoices);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching invoices:', error);

            // Check if user needs to complete business profile
            if (error.response?.data?.requiresProfileSetup) {
                toast.error('Please complete your business profile first');
                window.location.href = '/business-profile-setup';
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch invoices');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/api/invoices/stats/summary`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchInvoices();
    };

    const handleDelete = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${API_URL}/api/invoices/${invoiceId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Invoice deleted successfully');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error(error.response?.data?.message || 'Failed to delete invoice');
        }
    };

    const handleMarkAsPaid = async (invoiceId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `${API_URL}/api/invoices/${invoiceId}/mark-paid`,
                {
                    paymentDate: new Date().toISOString(),
                    paymentMethod: 'Bank Transfer'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Invoice marked as paid');
            fetchInvoices();
            fetchStats();
        } catch (error) {
            console.error('Error marking invoice as paid:', error);
            toast.error(error.response?.data?.message || 'Failed to mark invoice as paid');
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            Draft: 'bg-slate-100 text-slate-700',
            Sent: 'bg-blue-100 text-blue-700',
            Paid: 'bg-green-100 text-green-700',
            Overdue: 'bg-red-100 text-red-700',
            Cancelled: 'bg-gray-100 text-gray-700'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
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
                    <h1 className="text-3xl font-bold text-slate-800">Invoices</h1>
                    <p className="text-slate-600 mt-1">Manage your invoices and track payments</p>
                </div>
                <Link
                    to="/invoices/create"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
                >
                    <FaPlus />
                    <span>Create Invoice</span>
                </Link>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Invoices</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{stats.totalInvoices}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FaFileInvoice className="text-indigo-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Paid</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.paidInvoices}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <FaCheckCircle className="text-green-600 text-xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-xl font-bold">₹</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">Pending Amount</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{formatCurrency(stats.pendingAmount)}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-xl font-bold">₹</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by invoice number..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-2">
                        <FaFilter className="text-slate-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {invoices.length === 0 ? (
                    <div className="text-center py-12">
                        <FaFileInvoice className="mx-auto text-6xl text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No invoices found</h3>
                        <p className="text-slate-500 mb-6">Create your first invoice to get started</p>
                        <Link
                            to="/invoices/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FaPlus />
                            <span>Create Invoice</span>
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Invoice #
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Due Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice._id} className="hover:bg-slate-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-indigo-600">{invoice.invoiceNumber}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-800">{invoice.clientId?.clientName || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {formatDate(invoice.invoiceDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                {formatDate(invoice.dueDate)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-semibold text-slate-800">{formatCurrency(invoice.totalAmount)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(invoice.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        to={`/invoices/${invoice._id}`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="View"
                                                    >
                                                        <FaEye />
                                                    </Link>
                                                    {invoice.status !== 'Paid' && (
                                                        <>
                                                            <Link
                                                                to={`/invoices/edit/${invoice._id}`}
                                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                <FaEdit />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleMarkAsPaid(invoice._id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                                title="Mark as Paid"
                                                            >
                                                                <FaCheckCircle />
                                                            </button>
                                                        </>
                                                    )}
                                                    {invoice.status !== 'Paid' && (
                                                        <button
                                                            onClick={() => handleDelete(invoice._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-sm text-slate-600">
                                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} invoices
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPage(page + 1)}
                                        disabled={page === pagination.pages}
                                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default InvoiceList;
