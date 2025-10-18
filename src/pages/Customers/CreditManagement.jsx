// src/pages/CreditManagement.jsx
import React, { useEffect, useState } from "react";
import {
    getCreditByPartyId,
    recordPayment,
    getCreditHistory,
    getAllCustomers,
} from "./partyService"; // your combined service file
import { IndianRupee, RefreshCw, History } from "lucide-react";
import toast from "react-hot-toast";
import CreditModal from "./CreditModal";


export default function CreditManagement() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [credit, setCredit] = useState(null);
    const [creditHistory, setCreditHistory] = useState([]);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);


    // 🔹 Load customers on mount
    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        try {
            const res = await getAllCustomers(); // axios response
            setCustomers(res);
        } catch (err) {
            console.error("Failed to load customers:", err);
            toast.error("Failed to load customers");
        }
    };

    // 🔹 Fetch credit + history for a party
    const fetchCreditInfo = async (partyId) => {
        if (!partyId) return;
        setLoading(true);
        try {
            // both return axios responses (res.data)
            const [creditRes, historyRes] = await Promise.all([
                getCreditByPartyId(partyId),
                getCreditHistory(partyId),
            ]);

            const creditData = creditRes;
            const historyData = historyRes || [];

            // backend may return null if no record yet
            if (!creditData) {
                toast.error("No credit record found for this customer.");
                setCredit(null);
                setCreditHistory([]);
                setSelectedCustomer(null);
                setLoading(false);
                return;
            }

            setCredit(creditData);
            setCreditHistory(historyData);

            // prefer customer object from creditData; fallback to customers list
            const customerData =
                creditData.customer ||
                customers.find((c) => String(c.id) === String(partyId)) ||
                null;

            setSelectedCustomer({
                id: customerData?.id || partyId,
                name: customerData?.name || "Customer",
                balance: creditData.currentOutstandingBalance || 0,
                // keep whole customer object accessible if needed
                raw: customerData,
            });
        } catch (err) {
            console.error("Credit fetch error:", err);
            toast.error("Unable to load credit info");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 Record new payment
    const handleRecordPayment = async (e) => {
        e.preventDefault();
        if (!selectedCustomer || !selectedCustomer.id) {
            return toast.error("Select a customer first");
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0)
            return toast.error("Enter a valid payment amount");

        try {
            const res = await recordPayment(selectedCustomer.id, {
                paymentAmount: Number(amount),
            });
            // optional: read returned updated credit object
            const updated = res;
            toast.success("Payment recorded successfully!");
            setAmount("");
            // refresh from server (best to keep in sync)
            await fetchCreditInfo(selectedCustomer.id);
            // if backend returned updated object we can update local state too
            if (updated) {
                setCredit(updated);
            }
        } catch (err) {
            console.error("Payment error:", err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to record payment";
            toast.error(msg);
        }
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Credit Management
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-gray-500 text-sm">Total Outstanding</div>
                    <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                        ₹{" "}
                        {customers
                            .reduce(
                                (sum, c) =>
                                    sum +
                                    (c.creditManagement?.currentOutstandingBalance || 0),
                                0
                            )
                            .toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-gray-500 text-sm">Payments This Month</div>
                    <div className="text-xl font-semibold text-green-600 dark:text-green-400">
                        ₹{" "}
                        {creditHistory
                            .filter(
                                (e) =>
                                    e.type === "PAYMENT" &&
                                    new Date(e.date).getMonth() === new Date().getMonth()
                            )
                            .reduce((sum, e) => sum + (e.credit || 0), 0)
                            .toFixed(2)}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
                    <div className="text-gray-500 text-sm">Active Credit Customers</div>
                    <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                        {customers.length}
                    </div>
                </div>
            </div>

            {/* Customer Selector */}
            <div className="flex items-center gap-3 mb-6">
                <select
                    className="border rounded-lg px-3 py-2 w-64 dark:bg-gray-800 dark:text-gray-100"
                    onChange={(e) => fetchCreditInfo(e.target.value)}
                    defaultValue=""
                >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={() => selectedCustomer && fetchCreditInfo(selectedCustomer.id)}
                    className="bg-gray-200 dark:bg-gray-700 p-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    title="Refresh"
                >
                    <RefreshCw className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                </button>
            </div>

            {/* Credit Summary */}
            {loading ? (
                <p className="text-gray-500">Loading credit details...</p>
            ) : credit ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 w-full max-w-3xl mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {credit.customer?.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                                Outstanding Balance:{" "}
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    ₹ {Number(credit.currentOutstandingBalance || 0).toFixed(2)}
                                </span>
                            </p>
                            {Number(credit.partPayment || 0) > 0 && (
                                <p className="text-xs text-gray-500">
                                    Last Payment: ₹ {Number(credit.partPayment).toFixed(2)} on{" "}
                                    {credit.paymentDate
                                        ? new Date(credit.paymentDate).toLocaleDateString()
                                        : "-"}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
                        >
                            <IndianRupee className="w-4 h-4" /> Record Payment
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">
                    Select a customer to view credit details.
                </p>
            )}

            {/* Credit + Invoice History */}
            {creditHistory.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 w-full max-w-5xl">
                    <div className="flex items-center gap-2 mb-3">
                        <History className="text-indigo-500 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Credit & Invoice History
                        </h2>
                    </div>

                    <table className="w-full text-sm border border-gray-200 dark:border-gray-700 border-collapse">
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <tr>
                            <th className="text-left px-3 py-2 border">Date</th>
                            <th className="text-left px-3 py-2 border">Description</th>
                            <th className="text-right px-3 py-2 border">Debit (₹)</th>
                            <th className="text-right px-3 py-2 border">Credit (₹)</th>
                            <th className="text-right px-3 py-2 border">Balance (₹)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {creditHistory.map((entry, idx) => (
                            <tr
                                key={idx}
                                className="border-t border-gray-200 dark:border-gray-700"
                            >
                                <td className="px-3 py-2">
                                    {entry.date
                                        ? new Date(entry.date).toLocaleDateString("en-IN")
                                        : "-"}
                                </td>
                                <td className="px-3 py-2">
                                    {entry.type === "INVOICE"
                                        ? `Invoice #${entry.referenceno || "-"}`
                                        : "Payment Received"}
                                </td>
                                <td className="px-3 py-2 text-right text-red-500">
                                    {entry.debit ? Number(entry.debit).toFixed(2) : "-"}
                                </td>
                                <td className="px-3 py-2 text-right text-green-600">
                                    {entry.credit ? Number(entry.credit).toFixed(2) : "-"}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-100">
                                    {entry.balanceafter ? Number(entry.balanceafter).toFixed(2) : "-"}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showModal && selectedCustomer && (
                <CreditModal
                    party={selectedCustomer}
                    onClose={() => setShowModal(false)}
                    onUpdated={() => fetchCreditInfo(selectedCustomer.id)}
                />
            )}
        </div>
    );
}
