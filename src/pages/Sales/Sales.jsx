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
import {deleteSale, getSale, getSaleInvoiceByRef, listSales} from "./SaleService";
import AddSaleModal from "./AddSaleModal";
import ViewInvoiceModal from "./ViewInvoiceModal";
import PrintSaleInvoice from "./SalesInvoicePrint";


const ITEMS_PER_PAGE = 10;

const Sales = () => {
    const [sales, setSales] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null); // full sale object for edit

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

    // Open edit drawer: fetch full sale by id then open drawer
    const openEdit = async (saleSummary) => {
        try {
            // fetch all sale records for this invoice reference
            const invoiceLines = await getSaleInvoiceByRef(saleSummary.referenceNo);
            if (!invoiceLines || invoiceLines.length === 0) {
                toast.error('Invoice details not found');
                return;
            }

            // convert into invoice-shaped object expected by AddSaleModal
            const invoiceObj = {
                referenceNo: invoiceLines[0].referenceNo,
                party: invoiceLines[0].party,
                shop: invoiceLines[0].shop,
                paymentMethod: invoiceLines[0].paymentMethod,
                lineItems: invoiceLines.map(li => ({
                    productId: li.stock?.product?.productId ?? li.product?.productId,
                    stockId: li.stock?.stockId,
                    saleQuantity: Math.abs(Number(li.saleQuantity || 0)),
                    unitSellingPrice: Number(li.unitSellingPrice || 0),
                    discountAmount: 0,
                    gstRate: Number(li.gstRate || 0),
                    taxableValue: Number(li.taxableValue || 0),
                    gstAmount: Number(li.cgstAmount || 0) + Number(li.sgstAmount || 0),
                }))
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

    if (loading) return <div className="p-6 text-center text-gray-500">Loading Sales...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Sales Invoices</h1>
                <button
                    onClick={() => {
                        setEditingSale(null);
                        setIsDrawerOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Sale
                </button>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                    <input
                        className="pl-10 pr-4 py-2 border rounded w-80"
                        placeholder="Search invoice..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        {['Ref', 'Party', 'Payment', 'Total', 'Created', 'Status', 'Actions'].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {sales.length ? (
                        sales.map((s) => (
                            <tr key={s.saleId} className="hover:bg-indigo-50/50">
                                <td className="px-6 py-4">{s.referenceNo}</td>
                                <td className="px-6 py-4">{s.party?.name || '-'}</td>
                                <td className="px-6 py-4">{s.paymentMethod}</td>
                                <td className="px-6 py-4 font-semibold">₹ {(Number(s.totalBillAmount) || 0).toFixed(2)}</td>
                                <td className="px-6 py-4">{s.createdAt ? new Date(s.createdAt).toLocaleString() : '-'}</td>
                                <td className="px-6 py-4">
                    <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            s.paymentMethod === 'Credit' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}
                    >
                      {s.paymentMethod}
                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
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

            <div className="flex justify-end items-center mt-4 gap-3">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border rounded"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <div>
                    Page {currentPage} of {totalPages}
                </div>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border rounded"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Add / Edit Drawer */}
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

            {/* Preview modal */}
            {previewInvoice && (
                <ViewInvoiceModal
                    isOpen={!!previewInvoice}
                    invoice={previewInvoice}
                    onClose={() => setPreviewInvoice(null)}
                />
            )}

            {/* Print modal */}
            {printRef && <PrintSaleInvoice referenceNo={printRef} onClose={() => setPrintRef(null)} />}
        </div>
    );
};

export default Sales;
