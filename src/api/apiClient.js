import axios from "axios";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// ✅ Automatically attach Firebase ID Token to every request
api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        try {
            const token = await user.getIdToken(); // get latest valid token
            config.headers.Authorization = `Bearer ${token}`;
        } catch (err) {
            console.warn("⚠️ Unable to get Firebase token:", err);
        }
    }

    return config;
});

// ✅ Global error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const status = error.response?.status;
        const msg =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Something went wrong";

        // 🎯 Handle error messages globally
        if (status >= 400 && status < 500) {
            toast.error(msg || "Client error");
        } else if (status >= 500) {
            toast.error("Server error, please try again later");
        } else {
            toast.error(msg);
        }

        // 🔐 Redirect to login on unauthorized
        if (status === 401) {
            console.warn("Unauthorized — redirecting to login...");
            localStorage.removeItem("authToken");
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
