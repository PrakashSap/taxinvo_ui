import axios from "axios";
import toast from "react-hot-toast";
import { getAuth } from "firebase/auth";

// 💡 CRITICAL CHANGE: Determine BASE_URL conditionally
let BASE_URL;

// Check if the application is running in the local development environment
if (process.env.NODE_ENV === 'development') {
    // Use the local URL for development
    // Note: The dev server (e.g., create-react-app) handles proxying or uses this directly
    BASE_URL = 'http://localhost:8080/api';
} else {
    // Use the URL specified in the .env file for production builds
    BASE_URL = process.env.REACT_APP_API_URL;
}

// Ensure BASE_URL is available
if (!BASE_URL) {
    console.error("BASE_URL is not defined! Check your .env setup.");
}
console.log("API Base URL:", BASE_URL);
const api = axios.create({
    baseURL: BASE_URL,
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
