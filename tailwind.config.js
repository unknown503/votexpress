/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/preline/dist/*.js',
  ],
  theme: {
    extend: {
      backgroundColor: {
        "blue-650": "#228be6",
        "blue-750": "#1c7ed6",
      },
      colors: {
        "admin": "#F6F8FC"
      }
    },
  },
  plugins: [
    require('preline/plugin'),
  ],
}
