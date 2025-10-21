import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/apiClient';
import html2pdf from 'html2pdf.js';
import { ArrowDownTrayIcon, PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline';
// import logo from '../../assets/logo.png'; // optional: place your logo under src/assets/

const PrintInvoice = ({ stockId, onClose }) => {
    const [invoice, setInvoice] = useState(null);
    const invoiceRef = useRef(null);

    useEffect(() => {
        if (!stockId) return;
        const loadInvoice = async () => {
            try {
                const data = await api.get(`/stocks/${stockId}`);
                setInvoice(data);
            } catch (err) {
                console.error('Failed to load invoice:', err);
            }
        };
        loadInvoice();
    }, [stockId]);

    if (!invoice) return null;

    const product = invoice.product || {};
    const supplier = product.supplier || {};

    const handlePrint = () => window.print();

    const handleDownloadPDF = () => {
        const element = invoiceRef.current;
        const opt = {
            margin: 0.5,
            filename: `Invoice_${invoice.stockId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-100 overflow-y-auto">
            {/* Outer modal (hidden during print) */}
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-4 print:shadow-none print:border-none">
                {/* Top Toolbar */}
                <div className="flex justify-between items-center p-4 border-b bg-indigo-50 print:hidden">
                    <h2 className="text-lg font-semibold text-gray-700">Invoice Preview</h2>
                    <div className="fixed top-0 right-0 z-[110] p-4 flex space-x-3 bg-white shadow-lg rounded-bl-lg">
                        <button
                            onClick={handlePrint}
                            className="flex items-center px-3 py-1 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                        >
                            <PrinterIcon className="w-4 h-4 mr-1" /> Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" /> PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice Content */}
                <div className="min-h-full py-10 px-2 sm:px-4 md:px-6 mt-[60px]">
                <div ref={invoiceRef} className="bg-white p-6 md:p-10 mx-auto max-w-4xl shadow-2xl">
                    {/* Header with Branding */}
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <div className="flex items-center space-x-3">
                            <img
                                //src={logo}
                                alt="Logo"
                                className="w-16 h-16 object-contain"
                                onError={(e) => (e.target.style.display = 'none')}
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-indigo-700">TAXINVO</h1>
                                <p className="text-sm text-gray-500">
                                    Tax Made Easy for Every Business
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <h2 className="text-xl font-bold text-gray-800">Purchase Invoice</h2>
                            <p className="text-sm text-gray-600">Invoice ID: {invoice.stockId}</p>
                        </div>
                    </div>

                    {/* Supplier Details */}
                    <div className="mb-6 grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-1">Supplier Details</h3>
                            <p>{supplier.name}</p>
                            <p className="text-sm text-gray-600">{supplier.address}</p>
                            <p className="text-sm text-gray-600">GSTIN: {supplier.gstin}</p>
                            <p className="text-sm text-gray-600">Contact: {supplier.contact}</p>
                        </div>

                        <div className="text-right">
                            <p className="text-sm"><strong>Purchase Date:</strong> {invoice.purchaseDate}</p>
                            <p className="text-sm"><strong>Batch No:</strong> {invoice.batchNumber}</p>
                            <p className="text-sm"><strong>Expiry Date:</strong> {invoice.expiryDate}</p>
                        </div>
                    </div>

                    {/* Product Table */}
                    <table className="w-full border-collapse border border-gray-200 mb-6 text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            {[
                                'Product Name',
                                'HSN/SAC',
                                'Qty',
                                'UOM',
                                'Purchase Price',
                                'Taxable Value',
                                'GST Rate',
                                'GST Value',
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="border border-gray-200 px-3 py-2 text-left font-semibold text-gray-700"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border px-3 py-2">{product.name}</td>
                            <td className="border px-3 py-2">{product.hsnSac}</td>
                            <td className="border px-3 py-2 text-center">{invoice.quantity}</td>
                            <td className="border px-3 py-2 text-center">{product.uom}</td>
                            <td className="border px-3 py-2 text-right">₹ {invoice.purchasePrice.toFixed(2)}</td>
                            <td className="border px-3 py-2 text-right">₹ {invoice.taxableValue.toFixed(2)}</td>
                            <td className="border px-3 py-2 text-center">{product.gstRate}%</td>
                            <td className="border px-3 py-2 text-right text-green-700">
                                ₹ {invoice.gstValue.toFixed(2)}
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mt-6">
                        <div className="w-1/2 text-right">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">Taxable Value:</span>
                                <span>₹ {invoice.taxableValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-gray-700">GST Amount:</span>
                                <span>₹ {invoice.gstValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t pt-2 mt-2">
                                <span>Total Amount:</span>
                                <span className="text-indigo-700">
                  ₹ {(invoice.taxableValue + invoice.gstValue).toFixed(2)}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Signature Section */}
                    <div className="mt-10 flex justify-between items-end">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Customer Signature</p>
                            <div className="border-b border-gray-400 w-40 mt-8"></div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-600">Authorized Signature</p>
                            <div className="border-b border-gray-400 w-40 mt-8"></div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
                        <p>Generated on {new Date().toLocaleString()}</p>
                        <p>© {new Date().getFullYear()} TAXINVO — All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default PrintInvoice;
