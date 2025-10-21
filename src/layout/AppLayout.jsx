// src/layouts/AppLayout.jsx
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";

const getInitialCollapsedState = () => {
    // Check if window is defined (to avoid SSR errors) and if width is less than 1024px
    return window.innerWidth < 1024;
};

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(getInitialCollapsedState);
    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar collapsed={collapsed} />
            <div className="flex-1 flex flex-col">
                <Header onToggleSidebar={() => setCollapsed(!collapsed)} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
