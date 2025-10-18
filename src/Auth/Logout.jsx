import { getAuth, signOut } from "firebase/auth";
import toast from "react-hot-toast";

export const logoutUser = async () => {
    const auth = getAuth();
    try {
        await signOut(auth); // 🔐 Firebase logout
        localStorage.removeItem("authToken");
        toast.success("Logged out successfully");
    } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed, please try again");
    }
};
