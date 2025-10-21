import React, { useState, useEffect, useCallback } from 'react';
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    PrinterIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import AddPurchaseModal from '../Purchases/AddPurchaseModal';
import toast from 'react-hot-toast';
import api from "../../api/apiClient";
import PrintInvoice from '../Purchases/PrintInvoice';


const Purchases = () => {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStock, setEditingStock] = useState(null);

    // Pagination & Search
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [printId, setPrintId] = useState(null);

    const ITEMS_PER_PAGE = 10;

    // 🔹 Load Stock List
    const loadStocks = useCallback(async () => {
        setLoading(true);
        try {
            const allStocks = await api.get('/stocks');
            const filtered = allStocks.filter(
                s =>
                    s.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    s.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );

            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const end = start + ITEMS_PER_PAGE;
            setStocks(filtered.slice(start, end));
            setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
        } catch (err) {
            console.error('Failed to load stock list:', err);
            toast.error('Failed to load purchase invoices');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery]);

    useEffect(() => {
        loadStocks();
    }, [loadStocks]);

    // 🔹 Delete Stock
    const handleDelete = async stockId => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await api.delete(`/stocks/${stockId}`);
            toast.success('Invoice deleted');
            loadStocks();
        } catch (err) {
            console.error('Delete failed:', err);
            toast.error('Failed to delete invoice');
        }
    };

    // 🔹 After Add / Edit Success
    const handleAddOrUpdateSuccess = () => {
        setIsModalOpen(false);
        setEditingStock(null);
        loadStocks();
    };

    // 🔹 Handle Edit
    const handleEdit = stock => {
        setEditingStock(stock);
        setIsModalOpen(true);
    };

    if (loading)
        return (
            <div className="p-6 text-center text-gray-500">
                Loading Purchase Data...
            </div>
        );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Stock Purchases
            </h1>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search Batch No or Product..."
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"/>
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                    onClick={() => {
                        setEditingStock(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg shadow-md hover:bg-indigo-700 transition duration-150">
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Add Invoice
                </button>
            </div>

            {/* Table */}
            <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        {[
                            'Batch No',
                            'Product Name',
                            'Date',
                            'Qty',
                            'Unit P. Price',
                            'Taxable Value',
                            'GST Value',
                            'Expiry',
                            'Actions',
                        ].map(header => (
                            <th
                                key={header}
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {stocks.length > 0 ? (
                        stocks.map(stock => (
                            <tr
                                key={stock.stockId}
                                className="hover:bg-indigo-50/50 transition duration-150"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {stock.batchNumber}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {stock.product?.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {stock.purchaseDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {stock.quantity}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ₹ {stock.purchasePrice?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    ₹ {stock.taxableValue?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700">
                                    ₹ {stock.gstValue?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                    {stock.expiryDate}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(stock)}
                                        className="text-blue-600 hover:text-blue-800 p-1"
                                    >
                                        <PencilIcon className="w-5 h-5" title="Edit" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(stock.stockId)}
                                        className="text-red-600 hover:text-red-800 p-1 ml-2"
                                    >
                                        <TrashIcon className="w-5 h-5" title="Delete" />
                                    </button>
                                    <button
                                        onClick={() => setPrintId(stock.stockId)}
                                        className="text-gray-500 hover:text-gray-700 p-1 ml-2"
                                    >
                                        <PrinterIcon className="w-5 h-5" title="Print Invoice" />
                                    </button>
                                    {printId === stock.stockId && (
                                        <PrintInvoice
                                            stockId={stock.stockId}
                                            onClose={() => setPrintId(null)}
                                        />
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="9"
                                className="text-center py-10 text-gray-500"
                            >
                                No purchase invoices found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-end items-center mt-6 space-x-3">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition duration-150"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-700 font-medium">
          Page {currentPage} of {totalPages}
        </span>
                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition duration-150"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Add/Edit Modal */}
            <AddPurchaseModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingStock(null);
                }}
                onSuccess={handleAddOrUpdateSuccess}
                editingStock={editingStock}
            />
            {printId && (
                <PrintInvoice
                    stockId={printId}
                    onClose={() => setPrintId(null)}
                />
            )}
        </div>
    );
};

export default Purchases;
