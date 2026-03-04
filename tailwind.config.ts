import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'hsl(245, 80%, 97%)',
          100: 'hsl(245, 75%, 93%)',
          200: 'hsl(245, 70%, 85%)',
          300: 'hsl(245, 65%, 75%)',
          400: 'hsl(240, 60%, 65%)',
          500: 'hsl(235, 55%, 55%)',
          600: 'hsl(232, 60%, 48%)',
          700: 'hsl(230, 65%, 40%)',
          800: 'hsl(228, 60%, 30%)',
          900: 'hsl(226, 55%, 20%)',
        },
        accent: {
          purple: 'hsl(262, 52%, 47%)',
          blue: 'hsl(228, 83%, 66%)',
        },
        surface: {
          DEFAULT: 'hsl(0, 0%, 100%)',
          muted: 'hsl(240, 10%, 97%)',
          dark: 'hsl(230, 25%, 10%)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
