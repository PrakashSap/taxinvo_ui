// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Home,
    LogOut,
    Menu,
    ChevronDown,
    SunMedium,
    Moon,
} from "lucide-react";
import { logoutUser } from "../Auth/Logout";
import { getAuth } from "firebase/auth";
import { useEffect, useRef, useState } from "react";

export default function Header({ onToggleSidebar }) {
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState("light");
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // 🔐 Firebase user
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) =>
            setUser(firebaseUser)
        );
        return () => unsubscribe();
    }, []);

    // 🌓 Load + persist theme
    useEffect(() => {
        const stored = localStorage.getItem("theme") || "light";
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
    }, []);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        localStorage.setItem("theme", next);
        document.documentElement.classList.toggle("dark", next === "dark");
    };

    // 🧠 Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) =>
            dropdownRef.current && !dropdownRef.current.contains(e.target) && setOpen(false);
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="h-14 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-soft flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
                <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Menu size={20} />
                </button>
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <ArrowLeft size={20} />
                </button>
                <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Home size={20} />
                </button>
            </div>

            <div className="flex items-center gap-3">
                {/* 🌓 Theme toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
                >
                    {theme === "light" ? (
                        <Moon size={18} className="text-gray-700" />
                    ) : (
                        <SunMedium size={18} className="text-yellow-400" />
                    )}
                </button>

                {/* 👤 User dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <img
                            src={
                                user.photoURL ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    user.displayName || user.email
                                )}`
                            }
                            alt="avatar"
                            className="w-8 h-8 rounded-full border object-cover"
                        />
                        <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-200">
              {user.displayName || user.email.split("@")[0]}
            </span>
                        <ChevronDown
                            size={16}
                            className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-soft z-50">
                            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                    {user.displayName || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                            <button
                                onClick={logoutUser}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <LogOut size={16} className="mr-2" /> Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
