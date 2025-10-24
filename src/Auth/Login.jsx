import React, { useState } from "react";
import { auth } from "./firebase";
import {
    // Only keeping signInWithEmailAndPassword
    signInWithEmailAndPassword,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // --- Authentication Handler for Email/Password ---

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCred.user.getIdToken();
            // Using localStorage for token persistence
            localStorage.setItem("authToken", token);
            toast.success("Login successful!");
            // Notify the parent component of the login
            setTimeout(() => onLogin(userCred.user), 100);
        } catch (err) {
            console.error(err);
            toast.error("Invalid credentials or user not found.");
        }
    };

    // Removed handleSendCode and handleVerifyCode functions

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm space-y-6">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700">Welcome to Taxinvo App</h2>

                {/* Email/Password Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-700">Login with Email & Password</h3>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-gray-300 w-full px-4 py-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-gray-300 w-full px-4 py-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 shadow-md transition duration-200"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}