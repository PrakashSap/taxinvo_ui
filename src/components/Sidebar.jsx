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
    Wallet2,
} from "lucide-react";

export default function Sidebar({ collapsed }) {
    const menu = [
        { to: "/", label: "Dashboard", icon: LayoutDashboard },
        { to: "/products", label: "Products", icon: Package },
        { to: "/sales", label: "Sales", icon: BadgeIndianRupee },
        { to: "/purchases", label: "Purchases", icon: ShoppingCart },
        { to: "/parties", label: "Parties", icon: Contact },
        { to: "/suppliers", label: "Suppliers", icon: Truck },
        { to: "/credit", label: "Credit Mgmt", icon: Wallet2 },
    ];

    return (
        <aside
            className={`${
                collapsed ? "w-20" : "w-64"
            } h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 flex flex-col transition-all duration-300`}
        >
            {/* Logo */}
            <div className="flex items-center gap-2 mb-6">
                <ReceiptIndianRupee
                    className="text-primary-600 dark:text-primary-400"
                    size={26}
                />
                {!collapsed && (
                    <h1 className="text-xl font-extrabold text-gray-800 dark:text-gray-200">
                        TAXINVO
                    </h1>
                )}
            </div>

            {/* Menu */}
            <nav className="space-y-2">
                {menu.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                                isActive
                                    ? "bg-primary-50 dark:bg-primary-700/30 text-primary-700 dark:text-primary-300 font-semibold"
                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`
                        }
                    >
                        <Icon size={18} />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}
