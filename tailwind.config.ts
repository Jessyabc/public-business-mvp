/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        pb: {
          deep: '#061425',   // deep PublicBusiness blue
          deeper: '#030a14', // deeper background
        }
      },
      boxShadow: {
        glass: '0 1px 0 rgba(255,255,255,.05) inset, 0 10px 30px rgba(0,0,0,.35)'
      },
      backdropBlur: {
        12: '12px'
      }
    }
  },
  plugins: []
}
