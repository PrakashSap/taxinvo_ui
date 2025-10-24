/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        base: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
      },
      spacing: {
        18: '4.5rem',
      },
      screens: {
        xs: '360px',
      },
      colors: {
        primary: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        surface: {
          light: "#f9fafb",
          dark: "#1f2937",
        },
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.06)",
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}