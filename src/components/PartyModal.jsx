import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function PartyModal({ open, onClose, form, onChange, onSave, editing }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Background overlay */}
            <div
                className="absolute inset-0 bg-gray-900/60"
                onClick={onClose}
            />
            {/* Slide-over drawer */}
            <section className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
                        <h2 className="text-lg font-bold text-gray-800">
                            {editing ? "Edit Party" : "Add Party"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={onSave}
                        className="p-6 space-y-4 overflow-y-auto"
                    >
                        {[
                            ["name", "Name"],
                            ["contact", "Contact Number"],
                            ["address", "Address"],
                            ["gstin", "GSTIN"],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-1">
                                    {label}
                                </label>
                                <input
                                    name={key}
                                    value={form[key] || ""}
                                    onChange={onChange}
                                    className="w-full border rounded p-2"
                                    required={key === "name"}
                                />
                            </div>
                        ))}

                        {/* Type (readonly display) */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Party Type</label>
                            <input
                                readOnly
                                value={form.type}
                                className="w-full border rounded p-2 bg-gray-100 text-gray-700"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white rounded py-2 mt-2 hover:bg-indigo-700 transition"
                        >
                            {editing ? "Update" : "Save"}
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
