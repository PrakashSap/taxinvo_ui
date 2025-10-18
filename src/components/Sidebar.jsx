// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    BadgeIndianRupee,
    Contact,
    ReceiptIndianRupee,
    Wallet2
} from "lucide-react";

export default function Sidebar({ collapsed }) {
    const menu = [
        { to: "/", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { to: "/products", label: "Products", icon: <Package size={18} /> },
        { to: "/sales", label: "Sales", icon: <BadgeIndianRupee size={18} /> },
        { to: "/purchases", label: "Purchases", icon: <ShoppingCart size={18} /> },
        { to: "/parties", label: "Parties", icon: <Contact size={18} /> },
        { to: "/suppliers", label: "Suppliers", icon: <Truck size={18} /> },
        { to: "/credit", label: "CreditManagement", icon: <Wallet2 size={18} /> },
    ];

    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } h-full bg-gradient-to-b from-green-200 to-green-400 text-white shadow-xl shadow-md p-4 flex flex-col transition-all duration-300`}
        >
            {/* Logo */}
            <div className="flex items-center mb-4">
                <ReceiptIndianRupee
                    className="text-green-600 dark:text-green-400"
                    size={28}
                />
                {!collapsed && (
                    <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 ml-2 tracking-wider">
                        TAXINVO
                    </h1>
                )}
            </div>

            {!collapsed && (
                <h2 className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4 text-center">
                    Tax Made Easy for Every Business
                </h2>
            )}

            {/* Navigation */}
            <nav className="space-y-2">
                {menu.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`
                        }
                    >
                        {item.icon}
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
