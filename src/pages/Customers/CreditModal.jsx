// src/components/CreditManagement/CreditModal.jsx
import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { recordPayment } from "./partyService"; // same service file

export default function CreditModal({ party, onClose, onUpdated }) {
    const [amount, setAmount] = useState("");

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount)) return toast.error("Enter valid amount");

        try {
            const res = await recordPayment(party.id, { paymentAmount: Number(amount) });
            toast.success("Payment recorded successfully!");
            onUpdated(res.data);
            onClose();
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                "Failed to record payment";
            toast.error(msg);
        }
    };

    const currentBal = Number(party?.currentOutstandingBalance || party?.balance || 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">
                    <XMarkIcon className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-semibold mb-4">Record Payment</h2>
                <p className="text-sm text-gray-600 mb-2">
                    Customer: <strong>{party?.name}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                    Current Balance: ₹ {currentBal.toFixed(2)}
                </p>

                <form onSubmit={handlePayment} className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Payment Amount
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            className="w-full border rounded-lg px-3 py-2 focus:ring focus:ring-indigo-200"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter payment amount"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                    >
                        Record Payment
                    </button>
                </form>
            </div>
        </div>
    );
}
