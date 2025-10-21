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
    },
  },
  plugins: [],
}