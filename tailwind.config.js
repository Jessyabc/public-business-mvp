/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        "pb-blue": "#0a1f3a",     // deep PB blue
        "pb-blue-2": "#091931"
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)"
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
}