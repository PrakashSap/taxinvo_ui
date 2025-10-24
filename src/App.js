import './App.css';
import AppLayout from "./layout/AppLayout";
import {BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import {ToastContainer} from "react-toastify";
import Purchases from "./pages/Purchases/Purchases";
import Sales from "./pages/Sales/Sales";
import Products from "./pages/Products/Products";
import Parties from "./pages/Customers/parties";
import Toaster from "react-hot-toast";
import Suppliers from "./pages/Suppliers/Suppliers";
import CreditManagement from "./pages/Customers/CreditManagement";
import Login from "./Auth/Login";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Auth/firebase";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

// ✅ Track Firebase auth state
    useEffect(() => {
// Note: Assuming './Auth/firebase' is the correct path to the firebase config file.
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-600">Loading authentication state...</p>
            </div>
        );
    }


    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />
            <BrowserRouter>
                <Routes>
                    {user ? (
                        <Route element={<AppLayout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/purchases" element={<Purchases />} />
                            <Route path="/sales" element={<Sales />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/parties" element={<Parties />} />
                            <Route path="/suppliers" element={<Suppliers />} />
                            <Route path="/credit" element={<CreditManagement />} />
                            <Route path="/login" element={<Navigate to="/" replace/>} />
                            <Route path="*" element={<Navigate to="/" replace/>} />
                        </Route>
                    ) : (
// 🔓 Public route for login only
                        <>
                            <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
                            <Route path="*" element={<Navigate to="/login" />} />
                        </>
                    )}
                </Routes>
            </BrowserRouter>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#333",
                        color: "#fff",
                        fontSize: "14px",
                    },
                    success: {
                        iconTheme: {
                            primary: "#22c55e",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#ef4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
        </>
    );
}

export default App;