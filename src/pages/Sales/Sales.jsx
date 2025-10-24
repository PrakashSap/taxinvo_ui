// src/pages/Sales.jsx
import React, { useCallback, useEffect, useState } from 'react';
import {
    PlusCircleIcon,
    TrashIcon,
    PrinterIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { deleteSale, getSaleInvoiceByRef, listSales } from './SaleService';
import AddSaleModal from './AddSaleModal';
import ViewInvoiceModal from './ViewInvoiceModal';
import PrintSaleInvoice from './SalesInvoicePrint';

const ITEMS_PER_PAGE = 10;

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null);

    const [printRef, setPrintRef] = useState(null);
    const [previewInvoice, setPreviewInvoice] = useState(null);

    const loadSales = useCallback(async () => {
        setLoading(true);
        try {
            const all = await listSales();
            const filtered = (all || []).filter((s) =>
                (s.referenceNo || '').toLowerCase().includes(search.toLowerCase())
            );
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            setSales(filtered.slice(start, start + ITEMS_PER_PAGE));
            setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
        } catch (e) {
            console.error('loadSales', e);
            toast.error('Failed to load sales');
        } finally {
            setLoading(false);
        }
    }, [search, currentPage]);

    useEffect(() => {
        loadSales();
    }, [loadSales]);

    const openEdit = async (saleSummary) => {
        try {
            const invoiceLines = await getSaleInvoiceByRef(saleSummary.referenceNo);
            if (!invoiceLines || invoiceLines.length === 0) {
                toast.error('Invoice details not found');
                return;
            }

            const invoiceObj = {
                referenceNo: invoiceLines[0].referenceNo,
                party: invoiceLines[0].party,
                shop: invoiceLines[0].shop,
                paymentMethod: invoiceLines[0].paymentMethod,
                lineItems: invoiceLines.map((li) => ({
                    productId: li.stock?.product?.productId ?? li.product?.productId,
                    stockId: li.stock?.stockId,
                    saleQuantity: Math.abs(Number(li.saleQuantity || 0)),
                    unitSellingPrice: Number(li.unitSellingPrice || 0),
                    discountAmount: 0,
                    gstRate: Number(li.gstRate || 0),
                    taxableValue: Number(li.taxableValue || 0),
                    gstAmount: Number(li.cgstAmount || 0) + Number(li.sgstAmount || 0),
                })),
            };

            setEditingSale(invoiceObj);
            setIsDrawerOpen(true);
        } catch (e) {
            console.error('openEdit', e);
            toast.error('Failed to load sale for editing');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale (will rollback stock & credit)?')) return;
        try {
            await deleteSale(id);
            toast.success('Sale deleted & rolled back');
            loadSales();
        } catch (e) {
            console.error('deleteSale', e);
            toast.error('Delete failed');
        }
    };



    const closePrintModal = () => {
        setPrintRef(null);
        window.onfocus = null; // Ensure cleanup if user clicks the X button
    };


    if (loading) return <div className="p-6 text-center text-gray-500">Loading Sales...</div>;

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sales Invoices</h1>
            </div>

            {/* Search bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                    <input
                        className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Search invoice..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                    onClick={() => {
                        setEditingSale(null);
                        setIsDrawerOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                    <PlusCircleIcon className="w-5 h-5" />
                    <span>Add Sale</span>
                </button>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        {['Ref', 'Party', 'Payment', 'Total', 'Created', 'Status', 'Actions'].map((h) => (
                            <th
                                key={h}
                                className="px-4 py-3 text-left font-semibold text-gray-600 uppercase text-xs whitespace-nowrap"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sales.length ? (
                        sales.map((s) => (
                            <tr key={s.saleId} className="hover:bg-indigo-50/50">
                                <td className="px-4 py-3">{s.referenceNo}</td>
                                <td className="px-4 py-3">{s.party?.name || '-'}</td>
                                <td className="px-4 py-3">{s.paymentMethod}</td>
                                <td className="px-4 py-3 font-semibold">
                                    ₹ {(Number(s.totalBillAmount) || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    {s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}
                                </td>
                                <td className="px-4 py-3">
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            s.paymentMethod === 'Credit'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {s.paymentMethod}
                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2 flex items-center">
                                    <button onClick={() => openEdit(s)} className="text-blue-600">
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => setPrintRef(s.referenceNo)} className="text-gray-600">
                                        <PrinterIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(s.saleId)} className="text-red-600">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="py-10 text-center text-gray-500">
                                No sales found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center sm:justify-end items-center mt-4 gap-3 text-sm">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    Page {currentPage} of {totalPages}
                </div>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded disabled:opacity-50"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Modals */}
            {(isDrawerOpen || editingSale) && (
                <AddSaleModal
                    isOpen={isDrawerOpen || !!editingSale}
                    editingSale={editingSale}
                    onClose={() => {
                        setIsDrawerOpen(false);
                        setEditingSale(null);
                    }}
                    onSuccess={() => {
                        setIsDrawerOpen(false);
                        setEditingSale(null);
                        loadSales();
                    }}
                    onPreview={(invoice) => setPreviewInvoice(invoice)}
                />
            )}

            {previewInvoice && (
                <ViewInvoiceModal
                    isOpen={!!previewInvoice}
                    invoice={previewInvoice}
                    onClose={() => setPreviewInvoice(null)}
                />
            )}

            {printRef && <PrintSaleInvoice referenceNo={printRef} onClose={closePrintModal} />}
        </div>
    );
};

export default Sales;
