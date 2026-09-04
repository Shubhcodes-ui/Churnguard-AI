/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        'cg-base': '#0B0E14',
        'cg-surface': '#12161F',
        'cg-border': '#232838',
        'cg-primary': '#E8EAF0',
        'cg-muted': '#8891A6',
        'cg-risk': '#FF6B4A',
        'cg-safe': '#3ECF8E',
        'cg-brand': '#E8B450',

        background: "#0B0E14",
        foreground: "#E8EAF0",
        card: {
          DEFAULT: "#12161F",
          foreground: "#E8EAF0",
        },
        popover: {
          DEFAULT: "#12161F",
          foreground: "#E8EAF0",
        },
        primary: {
          DEFAULT: "#E8B450",
          foreground: "#0B0E14",
        },
        secondary: {
          DEFAULT: "#1A202C",
          foreground: "#E8EAF0",
        },
        muted: {
          DEFAULT: "#1A202C",
          foreground: "#8891A6",
        },
        accent: {
          DEFAULT: "#1A202C",
          foreground: "#E8EAF0",
        },
        destructive: {
          DEFAULT: "#FF6B4A",
          foreground: "#FFFFFF",
        },
        border: "#232838",
        input: "#232838",
        ring: "#E8B450",
        chart: {
          "1": "#E8B450",
          "2": "#3ECF8E",
          "3": "#FF6B4A",
          "4": "#8B5CF6",
          "5": "#38BDF8",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      keyframes: {
        'row-pulse': {
          '0%': { backgroundColor: 'rgba(232, 180, 80, 0.25)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'row-pulse': 'row-pulse 1.8s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
