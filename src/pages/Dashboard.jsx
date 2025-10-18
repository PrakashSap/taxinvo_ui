// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    BarChart3, ShoppingCart, IndianRupee, Package, AlertTriangle,
} from "lucide-react";

export default function Dashboard() {
    const [salesData, setSalesData] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [recentPurchases, setRecentPurchases] = useState([]);

    useEffect(() => {
        // Mock data
        setSalesData([
            { date: "Oct 6", sales: 4000 },
            { date: "Oct 7", sales: 5000 },
            { date: "Oct 8", sales: 6200 },
            { date: "Oct 9", sales: 7200 },
            { date: "Oct 10", sales: 6900 },
            { date: "Oct 11", sales: 8300 },
            { date: "Oct 12", sales: 9400 },
        ]);

        setLowStock([
            { id: 1, name: "Premium Basmati Rice – 5KG", stock: 8, reorderLevel: 20 },
            { id: 2, name: "Refined Oil – 1L", stock: 10, reorderLevel: 25 },
            { id: 3, name: "Sugar – 5KG", stock: 3, reorderLevel: 15 },
        ]);

        setRecentPurchases([
            { id: 1, ref: "PUR-0021", supplier: "A1 Suppliers", total: 12250, date: "2025-10-10" },
            { id: 2, ref: "PUR-0022", supplier: "Lakshmi Distributors", total: 7800, date: "2025-10-11" },
            { id: 3, ref: "PUR-0023", supplier: "Rajesh Traders", total: 9450, date: "2025-10-11" },
            { id: 4, ref: "PUR-0024", supplier: "ABC Wholesale", total: 11200, date: "2025-10-12" },
            { id: 5, ref: "PUR-0025", supplier: "SuperMart Supply", total: 8650, date: "2025-10-12" },
        ]);
    }, []);

    // Summary mock data
    const summary = {
        todaysSales: 9400,
        todaysPurchases: 8650,
        monthlyRevenue: 178000,
        totalProducts: 248,
    };

    return (
        <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                Business & Inventory Dashboard
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <SummaryCard
                    title="Today's Sales"
                    value={`₹ ${summary.todaysSales.toLocaleString()}`}
                    icon={<BarChart3 />}
                    color="from-indigo-500 to-blue-500"
                />
                <SummaryCard
                    title="Today's Purchases"
                    value={`₹ ${summary.todaysPurchases.toLocaleString()}`}
                    icon={<ShoppingCart />}
                    color="from-emerald-500 to-teal-500"
                />
                <SummaryCard
                    title="This Month's Revenue"
                    value={`₹ ${summary.monthlyRevenue.toLocaleString()}`}
                    icon={<IndianRupee />}
                    color="from-orange-400 to-yellow-500"
                />
                <SummaryCard
                    title="Total Products"
                    value={summary.totalProducts}
                    icon={<Package />}
                    color="from-pink-500 to-rose-500"
                />
            </div>

            {/* Sales Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 mb-8">
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">
                    Sales Trend (Last 7 Days)
                </h2>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                            <XAxis dataKey="date" stroke="#888" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Low Stock & Recent Purchases */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Items */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="text-yellow-500 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Low Stock Items
                        </h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="border-b text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="text-left py-1">Product</th>
                            <th className="text-right py-1">Stock</th>
                            <th className="text-right py-1">Reorder Level</th>
                        </tr>
                        </thead>
                        <tbody>
                        {lowStock.map((item) => (
                            <tr key={item.id} className="border-b last:border-none">
                                <td className="py-1 text-gray-800 dark:text-gray-100">{item.name}</td>
                                <td className="py-1 text-right text-red-500">{item.stock}</td>
                                <td className="py-1 text-right text-gray-500">{item.reorderLevel}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Recent Purchases */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <ShoppingCart className="text-green-500 w-5 h-5" />
                        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                            Recent Purchases
                        </h2>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="border-b text-gray-600 dark:text-gray-300">
                        <tr>
                            <th className="text-left py-1">Ref</th>
                            <th className="text-left py-1">Supplier</th>
                            <th className="text-right py-1">Date</th>
                            <th className="text-right py-1">Amount</th>
                        </tr>
                        </thead>
                        <tbody>
                        {recentPurchases.map((p) => (
                            <tr key={p.id} className="border-b last:border-none">
                                <td className="py-1 text-gray-800 dark:text-gray-100">{p.ref}</td>
                                <td className="py-1 text-gray-700 dark:text-gray-200">{p.supplier}</td>
                                <td className="py-1 text-right text-gray-500">
                                    {new Date(p.date).toLocaleDateString("en-IN")}
                                </td>
                                <td className="py-1 text-right font-semibold text-gray-800 dark:text-gray-100">
                                    ₹ {p.total.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Small Card Component
const SummaryCard = ({ title, value, icon, color }) => (
    <div className={`rounded-2xl shadow p-5 bg-gradient-to-r ${color} text-white flex justify-between items-center`}>
        <div>
            <p className="text-sm opacity-90">{title}</p>
            <h3 className="text-xl font-bold">{value}</h3>
        </div>
        <div className="opacity-90">{icon}</div>
    </div>
);
