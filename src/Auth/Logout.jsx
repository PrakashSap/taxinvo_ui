import { signOut } from "firebase/auth";
import toast from "react-hot-toast";
// Assuming firebase.js is in the same directory or accessible via './firebase'
import { auth } from './firebase';

export const logoutUser = async () => {
// Use the pre-initialized 'auth' instance imported from firebase.js
    try {
        await signOut(auth); // 🔐 Firebase logout
        localStorage.removeItem("authToken");
        toast.success("Logged out successfully");
    } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed, please try again");
    }
};