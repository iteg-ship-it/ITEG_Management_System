/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Add this line
      },
      colors: {
        // Main brand color (fully opaque)
        brandYellow: '#FDA92D',

        // Optional: with 7.84% opacity using rgba
        brandYellowOpacity: 'rgba(253, 169, 45, 0.0784)',
      },
      animation: {
        'spin-slow': 'spin 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};