/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support manual dark mode toggling
  theme: {
    extend: {
       colors: {
        darknavy: '#0B1220',
        emeraldGreen: '#22C55E',
        emeraldGreenHover: '#16A34A',
        whiteBg: '#FFFFFF',
        lightgraySec: '#F3F4F6',
        cardBg: '#FFFFFF',
        borderCol: '#E5E7EB',
        primaryTxt: '#111827',
        secondaryTxt: '#6B7280',
        mutedTxt: '#9CA3AF',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
