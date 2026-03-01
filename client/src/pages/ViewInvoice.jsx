import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaPrint, FaEdit, FaArrowLeft, FaFileInvoice } from 'react-icons/fa';

const ViewInvoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [businessProfile, setBusinessProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5001');

    useEffect(() => {
        fetchInvoice();
        fetchBusinessProfile();
    }, [id]);

    const fetchInvoice = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/invoices/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoice(response.data.invoice);
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('Failed to load invoice');
            navigate('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinessProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/business-profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBusinessProfile(response.data);
        } catch (error) {
            console.error('Error fetching business profile:', error);
            // Business profile is optional
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const calculateLineItemTotal = (item) => {
        const subtotal = (item.quantity * item.rate) - (item.discount || 0);
        return subtotal;
    };

    const calculateLineItemTax = (item) => {
        const subtotal = calculateLineItemTotal(item);
        return (subtotal * item.gstPercentage) / 100;
    };

    const getGSTBreakup = () => {
        if (!invoice?.clientId?.address?.state || !businessProfile?.address?.state) {
            return null;
        }

        const isIntraState = invoice.clientId.address.state === businessProfile.address.state;
        const totalTax = invoice.lineItems.reduce((sum, item) => sum + calculateLineItemTax(item), 0);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="text-center py-12">
                <FaFileInvoice className="mx-auto text-6xl text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Invoice not found</h3>
                <Link
                    to="/invoices"
                    className="text-indigo-600 hover:text-indigo-700"
                >
                    Back to Invoices
                </Link>
            </div>
        );
    }

    const gstBreakup = getGSTBreakup();

    return (
        <div className="space-y-6">
            {/* Action Buttons - Hidden when printing */}
            <div className="flex items-center justify-between print:hidden">
                <Link
                    to="/invoices"
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                    <FaArrowLeft />
                    <span>Back to Invoices</span>
                </Link>
                <div className="flex gap-3">
                    {invoice.status !== 'Paid' && (
                        <Link
                            to={`/invoices/edit/${invoice._id}`}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            <FaEdit />
                            <span>Edit Invoice</span>
                        </Link>
                    )}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition"
                    >
                        <FaPrint />
                        <span>Print</span>
                    </button>
                </div>
            </div>

            {/* Invoice Document */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 print:shadow-none print:border-0">
                {/* Header */}
                <div className="border-b-2 border-slate-200 pb-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">INVOICE</h1>
                            <p className="text-lg text-slate-600">#{invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right">
                            {getStatusBadge(invoice.status)}
                            <p className="text-sm text-slate-600 mt-2">
                                Date: <span className="font-semibold">{formatDate(invoice.invoiceDate)}</span>
                            </p>
                            <p className="text-sm text-slate-600">
                                Due: <span className="font-semibold">{formatDate(invoice.dueDate)}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Business and Client Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* From */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">From</h3>
                        {businessProfile ? (
                            <div className="text-slate-700">
                                <p className="font-bold text-lg mb-1">{businessProfile.businessName}</p>
                                {businessProfile.address && (
                                    <>
                                        <p>{businessProfile.address.street}</p>
                                        <p>{businessProfile.address.city}, {businessProfile.address.state} {businessProfile.address.pincode}</p>
                                    </>
                                )}
                                {businessProfile.gstin && <p className="mt-2">GSTIN: <span className="font-semibold">{businessProfile.gstin}</span></p>}
                                {businessProfile.email && <p>Email: {businessProfile.email}</p>}
                                {businessProfile.phone && <p>Phone: {businessProfile.phone}</p>}
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">Business profile not set up</p>
                        )}
                    </div>

                    {/* To */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase mb-3">Bill To</h3>
                        <div className="text-slate-700">
                            <p className="font-bold text-lg mb-1">{invoice.clientId?.clientName || 'N/A'}</p>
                            {invoice.clientId?.address && (
                                <>
                                    <p>{invoice.clientId.address.street}</p>
                                    <p>{invoice.clientId.address.city}, {invoice.clientId.address.state} {invoice.clientId.address.pincode}</p>
                                </>
                            )}
                            {invoice.clientId?.gstin && <p className="mt-2">GSTIN: <span className="font-semibold">{invoice.clientId.gstin}</span></p>}
                            {invoice.clientId?.email && <p>Email: {invoice.clientId.email}</p>}
                            {invoice.clientId?.phone && <p>Phone: {invoice.clientId.phone}</p>}
                        </div>
                    </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-8">
                    <table className="w-full">
                        <thead className="bg-slate-100 border-y border-slate-300">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">#</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Item</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Rate</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Discount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">GST %</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {invoice.lineItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-800">{item.itemName}</p>
                                        {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-700">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{formatCurrency(item.rate)}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{item.discount ? formatCurrency(item.discount) : '-'}</td>
                                    <td className="px-4 py-3 text-right text-slate-700">{item.gstPercentage}%</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                        {formatCurrency(calculateLineItemTotal(item) + calculateLineItemTax(item))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-8">
                    <div className="w-full max-w-md space-y-3">
                        <div className="flex justify-between text-slate-700">
                            <span>Subtotal:</span>
                            <span className="font-semibold">{formatCurrency(invoice.subtotal)}</span>
                        </div>

                        {gstBreakup && (
                            <div className="border-t border-slate-200 pt-3 space-y-2">
                                <p className="text-sm font-semibold text-slate-600 mb-2">GST Breakup ({gstBreakup.type})</p>
                                {gstBreakup.cgst > 0 && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>CGST:</span>
                                        <span>{formatCurrency(gstBreakup.cgst)}</span>
                                    </div>
                                )}
                                {gstBreakup.sgst > 0 && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>SGST:</span>
                                        <span>{formatCurrency(gstBreakup.sgst)}</span>
                                    </div>
                                )}
                                {gstBreakup.igst > 0 && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>IGST:</span>
                                        <span>{formatCurrency(gstBreakup.igst)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-3">
                            <span>Total Tax:</span>
                            <span className="font-semibold">{formatCurrency(invoice.taxAmount)}</span>
                        </div>

                        <div className="flex justify-between text-lg font-bold text-slate-800 bg-slate-100 px-4 py-3 rounded-lg border-t-2 border-slate-300">
                            <span>Total Amount:</span>
                            <span className="text-indigo-600">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes and Terms */}
                {(invoice.notes || invoice.termsAndConditions) && (
                    <div className="border-t border-slate-200 pt-6 space-y-4">
                        {invoice.notes && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-2">Notes</h4>
                                <p className="text-slate-700 whitespace-pre-wrap">{invoice.notes}</p>
                            </div>
                        )}
                        {invoice.termsAndConditions && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-2">Terms & Conditions</h4>
                                <p className="text-slate-700 whitespace-pre-wrap">{invoice.termsAndConditions}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Info */}
                {invoice.status === 'Paid' && invoice.paymentDate && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 font-semibold">
                            ✓ Paid on {formatDate(invoice.paymentDate)}
                            {invoice.paymentMethod && ` via ${invoice.paymentMethod}`}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
                    <p>Thank you for your business!</p>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoice;
