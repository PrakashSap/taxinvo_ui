import React from "react";

export default function Modal({ open, title, children, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96 relative">
                <h2 className="text-lg font-bold mb-4">{title}</h2>
                {children}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
                >
                    ✖
                </button>
            </div>
        </div>
    );
}
