// src/components/Sales/SalesInvoicePrint.jsx
import React, { useEffect, useRef, useState } from "react";
import html2pdf from "html2pdf.js";
import {
    PrinterIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { getSaleInvoiceByRef } from "./SaleService";

const toNum = (v) =>
    v === "" || v === null || v === undefined ? 0 : Number(v);

const SalesInvoicePrint = ({ referenceNo, onClose }) => {
    const [items, setItems] = useState(null);
    const ref = useRef(null);

    useEffect(() => {
        if (!referenceNo) return;
        getSaleInvoiceByRef(referenceNo)
            .then((data) => setItems(data || []))
            .catch((e) => console.error("getSaleInvoiceByRef", e));
    }, [referenceNo]);

    if (!items) return null;

    const firstItem = items[0] || {};
    const customer = firstItem.party || {};
    const totalTaxable = items.reduce((s, it) => s + toNum(it.taxableValue), 0);
    const totalCGST = items.reduce((s, it) => s + toNum(it.cgstAmount || it.cgst), 0);
    const totalSGST = items.reduce((s, it) => s + toNum(it.sgstAmount || it.sgst), 0);
    const grand = items.reduce((s, it) => s + toNum(it.totalBillAmount || it.lineTotal), 0);
    const rounded = Math.round(grand);
    const roundOff = (rounded - grand).toFixed(2);

    const amountInWords = (num) => {
        const a = [
            "",
            "One",
            "Two",
            "Three",
            "Four",
            "Five",
            "Six",
            "Seven",
            "Eight",
            "Nine",
            "Ten",
            "Eleven",
            "Twelve",
            "Thirteen",
            "Fourteen",
            "Fifteen",
            "Sixteen",
            "Seventeen",
            "Eighteen",
            "Nineteen",
        ];
        const b = [
            "",
            "",
            "Twenty",
            "Thirty",
            "Forty",
            "Fifty",
            "Sixty",
            "Seventy",
            "Eighty",
            "Ninety",
        ];
        const inWords = (n) => {
            if (n < 20) return a[n];
            if (n < 100)
                return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
            if (n < 1000)
                return (
                    a[Math.floor(n / 100)] +
                    " Hundred " +
                    (n % 100 ? inWords(n % 100) : "")
                );
            if (n < 100000)
                return (
                    inWords(Math.floor(n / 1000)) +
                    " Thousand " +
                    inWords(n % 1000)
                );
            if (n < 10000000)
                return (
                    inWords(Math.floor(n / 100000)) +
                    " Lakh " +
                    inWords(n % 100000)
                );
            return num;
        };
        return inWords(Math.floor(num)) + " Rupees Only";
    };

    const handlePrint = () => window.print();
    const handlePdf = () => {
        const opt = {
            margin: 0.3,
            filename: `Sale_${referenceNo}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };
        html2pdf().set(opt).from(ref.current).save();
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/60 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4">
                {/* Header Controls */}
                <div className="flex justify-between p-3 border-b print:hidden bg-pink-50">
                    <h3 className="font-semibold text-gray-700">
                        Sales Invoice — {referenceNo}
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="p-2 rounded bg-pink-600 text-white hover:bg-pink-700"
                            title="Print Invoice"
                        >
                            <PrinterIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handlePdf}
                            className="p-2 rounded bg-green-600 text-white hover:bg-green-700"
                            title="Download PDF"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-600">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Printable Invoice */}
                <div ref={ref} id="printable-invoice" className="p-8 bg-white">
                    {/* Company Header */}
                    <div className="text-center border-b border-gray-400 pb-2 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                            SRI DHANALAKSHMI TRADER
                        </h2>
                        <p className="text-sm text-gray-700">
                            Kaveri Kapila Double Road, Triveni Nagara, T.Narasipura 571124
                        </p>
                        <p className="text-sm text-gray-700">GSTIN: ABCDE1234F</p>
                        <h3 className="text-lg font-semibold mt-2 underline text-gray-800">
                            TAX INVOICE
                        </h3>
                    </div>

                    {/* Bill & Ship To */}
                    <div className="flex justify-between text-sm mb-4">
                        <div className="w-1/2 pr-4">
                            <h4 className="font-semibold text-gray-800 mb-1">Bill To:</h4>
                            <p>{customer?.name || "-"}</p>
                            <p>{customer?.address || "-"}</p>
                            <p>GSTIN: {customer?.gstin || "-"}</p>
                            <p>Contact: {customer?.contact || "-"}</p>
                        </div>
                        <div className="w-1/2 pl-4">
                            <h4 className="font-semibold text-gray-800 mb-1">Ship To:</h4>
                            <p>{customer?.shippingName || customer?.name || "-"}</p>
                            <p>{customer?.shippingAddress || customer?.address || "-"}</p>
                            <p>State Code: {customer?.stateCode || "-"}</p>
                            <p>Date:{" "}
                                {firstItem.createdAt
                                    ? new Date(firstItem.createdAt).toLocaleDateString("en-IN")
                                    : "-"}
                            </p>
                        </div>
                    </div>

                    {/* Product Table */}
                    <table className="w-full text-sm border border-gray-400 border-collapse">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 w-8">#</th>
                            <th className="border px-2 py-1 text-left">Description</th>
                            <th className="border px-2 py-1">HSN</th>
                            <th className="border px-2 py-1 text-right">Qty</th>
                            <th className="border px-2 py-1 text-right">Rate</th>
                            <th className="border px-2 py-1 text-right">Taxable</th>
                            <th className="border px-2 py-1 text-right">CGST</th>
                            <th className="border px-2 py-1 text-right">SGST</th>
                            <th className="border px-2 py-1 text-right">Total</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.map((it, i) => (
                            <tr key={i}>
                                <td className="border px-2 py-1 text-center">{i + 1}</td>
                                <td className="border px-2 py-1">
                                    {it.stock?.product?.name || it.product?.name || "-"}
                                </td>
                                <td className="border px-2 py-1 text-center">
                                    {it.product?.hsnSac || "-"}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {toNum(it.saleQuantity)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    ₹ {toNum(it.unitSellingPrice || 0).toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    ₹ {toNum(it.taxableValue).toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    ₹ {toNum(it.cgstAmount || it.cgst).toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    ₹ {toNum(it.sgstAmount || it.sgst).toFixed(2)}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    ₹ {toNum(it.totalBillAmount || it.lineTotal).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mt-4 text-sm">
                        <div className="w-1/3 text-right space-y-1">
                            <div className="flex justify-between">
                                <span>Taxable Value:</span>
                                <span>₹ {totalTaxable.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CGST:</span>
                                <span>₹ {totalCGST.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>SGST:</span>
                                <span>₹ {totalSGST.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Round Off:</span>
                                <span>{roundOff}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-semibold">
                                <span>Grand Total:</span>
                                <span>₹ {rounded.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mt-4 text-sm">
                        <strong>Amount in Words:</strong> {amountInWords(rounded)}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-between text-sm border-t border-gray-400 pt-2">
                        <div>
                            <p>
                                <strong>Bank:</strong> SBI Bank
                            </p>
                            <p>
                                <strong>A/c No:</strong> 123456789
                            </p>
                            <p>
                                <strong>IFSC:</strong> SBIN0001234
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">for SRI DHANALAKSHMI TRADER</p>
                            <div className="h-12"></div>
                            <p>Authorized Signatory</p>
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

export default SalesInvoicePrint;
