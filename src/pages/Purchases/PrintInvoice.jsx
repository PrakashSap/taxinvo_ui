import React, { useEffect, useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { PrinterIcon, ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {getPurchaseInvoiceByRef} from "./PurchaseService";


const toNum = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));

const PrintInvoice = ({ referenceNo, onClose }) => {
    const [invoice, setInvoice] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const invoiceRef = useRef(null);

    useEffect(() => {
        if (!referenceNo) return;
        setIsLoading(true);
        getPurchaseInvoiceByRef(referenceNo)
            .then((res) => {
                console.log("Fetched purchase invoice:", res);
                setInvoice(res||null); // since apiClient already unwraps
            })
            .catch((e) => console.error("getPurchaseInvoiceByRef", e))
            .finally(() => setIsLoading(false));
    }, [referenceNo]);

    if (isLoading || !invoice) {
        return (
            <div className="fixed inset-0 z-[100] bg-white bg-opacity-75 flex items-center justify-center">
                Loading Invoice...
            </div>
        );
    }

    const product = invoice.product || {};
    const supplier = product.supplier || {};
    const totalAmount = toNum(invoice.taxableValue) + toNum(invoice.gstValue);

    const handlePrint = () => window.print();

    const handleDownloadPDF = () => {
        if (!invoiceRef.current) return;
        const opt = {
            margin: 0.3,
            filename: `Purchase_${invoice.stockId}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        // No setTimeout needed as it's an interactive function call
        html2pdf().set(opt).from(invoiceRef.current).save();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-gray-100 overflow-y-auto invoice-print-container print:relative print:z-auto print:bg-white">
            {/* Toolbar */}
            <div className="print:hidden bg-white shadow-lg fixed top-0 left-0 right-0 z-[110]">
                <div className="max-w-5xl mx-auto flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-700">Invoice Preview</h2>
                    <div className="flex space-x-3">
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
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="min-h-full py-10 px-2 sm:px-4 md:px-6 pt-[80px] print:pt-0 print:p-0 print:m-0 print:min-h-0">
                <div
                    id="printable-invoice"
                    ref={invoiceRef}
                    className="bg-white p-6 md:p-10 mx-auto max-w-5xl shadow-2xl print:bg-white print:shadow-none print:p-4">
                    <div className="text-center border-b border-gray-400 pb-2 mb-4 print:border-black">
                        <h2 className="text-2xl font-bold text-gray-900">SRI DHANALAKSHMI TRADER</h2>
                        <p className="text-sm text-gray-700">
                            Kaveri Kapila Double Road, Triveni Nagara, T.Narasipura 571124
                        </p>
                        <p className="text-sm text-gray-700">GSTIN: ABCDE1234F</p>
                        <h3 className="text-lg font-semibold mt-2 underline text-gray-800">PURCHASE INVOICE</h3>
                    </div>

                    <div className="flex justify-between text-sm mb-4">
                        <div className="w-1/2 pr-4">
                            <h4 className="font-semibold text-gray-800 mb-1">Bill From (Supplier):</h4>
                            <p>{supplier?.name || '-'}</p>
                            <p>{supplier?.address || '-'}</p>
                            <p>GSTIN: {supplier?.gstin || '-'}</p>
                            <p>Contact: {supplier?.contact || '-'}</p>
                        </div>
                        <div className="w-1/2 pl-4 text-right">
                            <h4 className="font-semibold text-gray-800 mb-1">Bill To (Your Shop):</h4>
                            <p>SRI DHANALAKSHMI TRADER</p>
                            <p>Kaveri Kapila Double Road, Triveni Nagara</p>
                            <p>T.Narasipura 571124</p>
                            <p>GSTIN: ABCDE1234F</p>
                            <p>Date: {invoice.purchaseDate || '-'}</p>
                        </div>
                    </div>
                    {/* Product Table - Desktop */}
                    <div className="overflow-x-auto max-w-full hidden sm:block">
                    <table className="w-full text-sm border border-gray-400 border-collapse mb-4 print:border-black">
                        <thead className="bg-gray-100">
                        <tr>
                            {['#', 'Description', 'HSN', 'Qty', 'Rate', 'Taxable', 'GST Value', 'Total'].map((h) => (
                                <th key={h} className="border px-2 py-1 text-left font-semibold">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border px-2 py-1 text-center">1</td>
                            <td className="border px-2 py-1">{product.name || '-'}</td>
                            <td className="border px-2 py-1 text-center">{product.hsnSac || '-'}</td>
                            <td className="border px-2 py-1 text-right">{invoice.quantity}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(invoice.purchasePrice).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right">₹ {toNum(invoice.taxableValue).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right text-green-700">₹ {toNum(invoice.gstValue).toFixed(2)}</td>
                            <td className="border px-2 py-1 text-right font-semibold">₹ {totalAmount.toFixed(2)}</td>
                        </tr>
                        </tbody>
                    </table>
                    </div>
                    {/* Product Cards - Mobile */}
                    <div className="sm:hidden space-y-3 mb-4">
                        <div className="border rounded-lg p-3 bg-white shadow-sm">
                            <div className="flex justify-between text-sm font-semibold text-gray-700">
                                <span>{product.name || "-"}</span>
                                <span>₹ {totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="mt-1 text-xs text-gray-600 space-y-0.5">
                                <p>HSN: {product.hsnSac || "-"}</p>
                                <p>
                                    Qty: {invoice.quantity} @ ₹{" "}
                                    {toNum(invoice.purchasePrice).toFixed(2)}
                                </p>
                                <p>Taxable: ₹ {toNum(invoice.taxableValue).toFixed(2)}</p>
                                <p>GST: ₹ {toNum(invoice.gstValue).toFixed(2)}</p>
                                <p className="border-t pt-1 mt-1 font-medium">
                                    Total: ₹ {totalAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end text-sm mt-4">
                        <div className="w-1/3 text-right space-y-1">
                            <div className="flex justify-between">
                                <span>Taxable Value:</span>
                                <span>₹ {toNum(invoice.taxableValue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>GST Value:</span>
                                <span>₹ {toNum(invoice.gstValue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Grand Total:</span>
                                <span>₹ {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-2 italic">
                        * Subject to T. Narasipura Jurisdiction *
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrintInvoice;
