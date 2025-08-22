/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      'white': '#ffffff',
      'baclk': '#000000',
      'azul': '#1446A0',
      'rojo': '#ff0000',
      'gris': '#e2e8f0',
      'verde' : "#22C55E"
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'ui-sans-serif', 'system-ui'], 
      },
    },
  },
  plugins: [],
}