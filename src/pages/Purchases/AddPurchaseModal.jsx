import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import api from "../../api/apiClient";

const AddPurchaseModal = ({ isOpen, onClose, onSuccess, editingStock }) => {
    const [products, setProducts] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        stockId: null,
        productId: '',
        batchNumber: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        purchasedQuantity: '',
        unitPurchasePrice: '',
        unitSellingPrice: '',
        gstRate: '',
        taxableValue: 0,
        gstValue: 0,
    });

    // 🔹 Load products
    useEffect(() => {
        api.get('/products')
            .then(setProducts)
            .catch(() => toast.error('Failed to load product list'));
    }, []);

    // 🔹 When editing, populate form
    useEffect(() => {
        if (editingStock) {
            setFormData({
                stockId: editingStock.stockId,
                productId: editingStock.product.productId,
                batchNumber: editingStock.batchNumber,
                purchaseDate: editingStock.purchaseDate,
                expiryDate: editingStock.expiryDate || '',
                purchasedQuantity: editingStock.quantity,
                unitPurchasePrice: editingStock.purchasePrice,
                unitSellingPrice: editingStock.sellingPrice,
                gstRate: editingStock.product.gstRate,
                taxableValue: editingStock.taxableValue ?? 0,
                gstValue: editingStock.gstValue ?? 0,
            });
        }
    }, [editingStock]);

    // 🔹 Auto-calculate taxableValue and gstValue
    useEffect(() => {
        const qty = parseFloat(formData.purchasedQuantity || 0);
        const price = parseFloat(formData.unitPurchasePrice || 0);
        const gstRate = parseFloat(formData.gstRate || 0);

        const taxable = qty * price;
        const gst = taxable * (gstRate / 100);

        setFormData(prev => ({
            ...prev,
            taxableValue: isNaN(taxable) ? 0 : taxable,
            gstValue: isNaN(gst) ? 0 : gst,
        }));
    }, [formData.purchasedQuantity, formData.unitPurchasePrice, formData.gstRate]);

    // 🔹 Handle form changes
    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto set GST when product changes
        if (name === 'productId') {
            const selected = products.find(p => p.productId === parseInt(value));
            if (selected) {
                setFormData(prev => ({ ...prev, gstRate: selected.gstRate }));
            }
        }
    };

    // 🔹 Submit form
    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const payload = {
                productId: parseInt(formData.productId),
                batchNumber: formData.batchNumber,
                expiryDate: formData.expiryDate || null,
                purchaseDate: formData.purchaseDate,
                purchasedQuantity: parseFloat(formData.purchasedQuantity),
                unitPurchasePrice: parseFloat(formData.unitPurchasePrice),
                unitSellingPrice: parseFloat(formData.unitSellingPrice),
                gstRate: parseFloat(formData.gstRate),
                taxableValue: parseFloat(formData.taxableValue),
                gstValue: parseFloat(formData.gstValue),
            };

            if (editingStock) {
                await api.put(`/stocks/${formData.stockId}`, payload);
                toast.success('Invoice updated successfully');
            } else {
                await api.post('/stocks', payload);
                toast.success('Invoice added successfully');
            }

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error saving invoice:', err);
            toast.error('Failed to save invoice');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

            <motion.section
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
                    <h2 className="text-xl font-bold text-gray-800">
                        {editingStock ? 'Edit Purchase Invoice' : 'Add Purchase Invoice'}
                    </h2>
                    <button onClick={onClose}>
                        <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
                    {/* Product */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product</label>
                        <select
                            name="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                        >
                            <option value="">-- Select Product --</option>
                            {products.map(p => (
                                <option key={p.productId} value={p.productId}>
                                    {p.name} ({p.uom})
                                </option>
                            ))}
                        </select>
                        {formData.gstRate && (
                            <p className="mt-1 text-xs text-gray-500">GST: {formData.gstRate}%</p>
                        )}
                    </div>

                    {/* Batch & Purchase Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Batch No</label>
                            <input
                                name="batchNumber"
                                value={formData.batchNumber}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Quantity + Price */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quantity</label>
                            <input
                                type="number"
                                name="purchasedQuantity"
                                value={formData.purchasedQuantity}
                                onChange={handleChange}
                                min="1"
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                            <input
                                type="number"
                                name="unitPurchasePrice"
                                value={formData.unitPurchasePrice}
                                onChange={handleChange}
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Selling Price</label>
                            <input
                                type="number"
                                name="unitSellingPrice"
                                value={formData.unitSellingPrice}
                                onChange={handleChange}
                                step="0.01"
                                required
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Expiry */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="date"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm"
                        />
                    </div>

                    {/* Computed Fields */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Taxable Value</p>
                            <p className="text-lg font-semibold text-gray-800">
                                ₹ {formData.taxableValue.toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">GST Value</p>
                            <p className="text-lg font-semibold text-green-700">
                                ₹ {formData.gstValue.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="ml-3 flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        <CheckIcon className="w-5 h-5 mr-1" />
                        {submitting ? 'Saving...' : editingStock ? 'Update Invoice' : 'Save Invoice'}
                    </button>
                </div>
            </motion.section>
        </div>
    );
};

export default AddPurchaseModal;
