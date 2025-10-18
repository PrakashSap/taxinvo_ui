// src/components/Sales/ViewInvoiceModal.jsx
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const toNum = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));

const ViewInvoiceModal = ({ isOpen, onClose, invoice }) => {
    if (!isOpen || !invoice) return null;
    const items = invoice.lineItems || [];
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div id="printable-invoice" className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 overflow-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Invoice Preview — {invoice.referenceNo}</h2>
                    <button onClick={onClose} className="text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
                </div>

                <div className="mb-4">
                    <div><strong>Customer:</strong> {invoice.partyName || invoice.partyId}</div>
                    <div><strong>Payment:</strong> {invoice.paymentMethod}</div>
                </div>

                <table className="w-full text-sm border-collapse border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="border px-2 py-1 text-left">Product</th>
                        <th className="border px-2 py-1 text-right">Qty</th>
                        <th className="border px-2 py-1 text-right">Unit</th>
                        <th className="border px-2 py-1 text-right">Taxable</th>
                        <th className="border px-2 py-1 text-right">GST</th>
                        <th className="border px-2 py-1 text-right">Total</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((li, i) => (
                        <tr key={i}>
                            <td className="border px-2 py-1">{li.productName || li.productId}</td>
                            <td className="border px-2 py-1 text-right">{toNum(li.saleQuantity)}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(li.unitSellingPrice).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(li.taxableValue).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(li.gstAmount).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(li.lineTotal).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="mt-4 text-right">
                    <div><strong>Subtotal Taxable:</strong> ₹ {toNum(invoice.totals?.subtotalTaxable).toFixed(2)}</div>
                    <div><strong>GST:</strong> ₹ {toNum(invoice.totals?.subtotalGst).toFixed(2)}</div>
                    <div><strong>Round Off:</strong> ₹ {toNum(invoice.totals?.roundOff).toFixed(2)}</div>
                    <div className="text-lg font-bold">Grand Total: ₹ {toNum(invoice.totals?.grandTotal).toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoiceModal;
