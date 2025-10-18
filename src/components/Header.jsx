// src/components/Header.jsx
import { useNavigate } from "react-router-dom";
import {ArrowLeft, Home, LogOut, Menu,ChevronDown} from "lucide-react";
import {logoutUser} from "../Auth/Logout";
import {getAuth} from "firebase/auth";
import {useEffect, useRef, useState} from "react";

export default function Header({ onToggleSidebar }) {
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // ✅ Get Firebase user info
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });
        return () => unsubscribe();
    }, []);

    // ✅ Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    return (
        <header className="h-14 bg-gradient-to-b from-green-200 to-green-400 shadow-sm flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Toggle Sidebar"
                >
                    <Menu size={20} />
                </button>

                {/* Back and Home */}
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Go Back"
                >
                    <ArrowLeft size={20} />
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    title="Home"
                >
                    <Home size={20} />
                </button>
            </div>
                {user && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <img
                                src={
                                    user.photoURL ||
                                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                        user.displayName || user.email
                                    )}`
                                }
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full border object-cover"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
              {user.displayName || user.email.split("@")[0]}
            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-500 transition-transform ${
                                    open ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                        {user.displayName || "User"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </p>
                                </div>

                                {/* Logout */}
                                <button
                                    onClick={() => {
                                        logoutUser();
                                        setOpen(false);
                                    }}
                                    className="flex items-center justify-start w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </header>
    );}
