// src/layout/AppLayout.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import NavIcon from "../components/NavIcon";
import { Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    BadgeIndianRupee,
    ShoppingCart,
    Package,
    Contact,
    Truck,
    Wallet2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const getInitialCollapsedState = () => window.innerWidth < 1024;

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(getInitialCollapsedState);

    return (
        <div className="flex h-screen overflow-hidden bg-surface-light dark:bg-surface-dark">
            {/* 🧭 Sidebar (Animated) */}
            <AnimatePresence mode="wait">
                {!collapsed && (
                    <motion.aside
                        key="sidebar"
                        initial={{ x: -260, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -260, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden md:block"
                    >
                        <Sidebar collapsed={collapsed} />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* 🧩 Main Section */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header onToggleSidebar={() => setCollapsed(!collapsed)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all">
                    <Outlet />
                </main>

                {/* 📱 Bottom Navigation for Mobile */}
                <motion.nav
                    initial={{ y: 80 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 flex justify-around py-2 shadow-soft z-50"
                >
                    <NavIcon to="/" icon={<LayoutDashboard size={20} />} label="Home" />
                    <NavIcon to="/sales" icon={<BadgeIndianRupee size={20} />} label="Sales" />
                    <NavIcon to="/purchases" icon={<ShoppingCart size={20} />} label="Purchases" />
                    <NavIcon to="/products" icon={<Package size={20} />} label="Products" />
                    <NavIcon to="/parties" icon={<Contact size={20} />} label="Parties" />
                    <NavIcon to="/suppliers" icon={<Truck size={20} />} label="Suppliers" />
                    <NavIcon to="/credit" icon={<Wallet2 size={20} />} label="Credit" />
                </motion.nav>
            </div>
        </div>
    );
}
