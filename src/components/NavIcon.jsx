// src/components/NavIcon.jsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function NavIcon({ to, icon, label }) {
    return (
        <NavLink to={to}>
            {({ isActive }) => (
                <motion.div
                    whileTap={{ scale: 0.85 }}
                    animate={{
                        y: isActive ? -4 : 0,
                        scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`flex flex-col items-center justify-center text-xs ${
                        isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-500 dark:text-gray-400 hover:text-primary-500"
                    }`}
                >
                    {icon}
                    <span className="text-[10px] mt-0.5">{label}</span>
                </motion.div>
            )}
        </NavLink>
    );
}
