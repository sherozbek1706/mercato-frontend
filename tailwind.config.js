export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0f1c', // Deep dark blue/black
        surface: 'rgba(30, 41, 59, 0.65)', // Dark glassmorphism
        surfaceSolid: '#1e293b', 
        primary: '#3b82f6', // Bright neon blue
        'primary-hover': '#60a5fa',
        secondary: '#8b5cf6', // Neon purple
        accent: '#fbbf24', // Bright gold
        'accent-hover': '#fcd34d',
        danger: '#ef4444',
        success: '#10b981',
      },
      backdropBlur: {
        md: '16px',
      }
    },
  },
  plugins: [],
}
