import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import {
    signInWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCred.user.getIdToken();
            localStorage.setItem("authToken", token);
            toast.success("Login successful!");
            // delay setting state slightly for smooth rerender
            setTimeout(() => onLogin(userCred.user), 100);
        } catch (err) {
            console.error(err);
            toast.error("Invalid credentials");
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const token = await result.user.getIdToken();
            localStorage.setItem("authToken", token);
            toast.success("Logged in with Google!");
            setTimeout(() =>onLogin(result.user),100);
        } catch (err) {
            console.error(err);
            toast.error("Google login failed");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <form
                onSubmit={handleEmailLogin}
                className="bg-white p-6 rounded-xl shadow-md w-80 space-y-4"
            >
                <h2 className="text-xl font-semibold text-center">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                    Login
                </button>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
                >
                    Sign in with Google
                </button>
            </form>
        </div>
    );
}
