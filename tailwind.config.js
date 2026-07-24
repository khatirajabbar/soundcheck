/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // one accent — electric blue — used sparingly against monochrome
        accent: {
          DEFAULT: '#2350e6',
          soft: '#e7ecfd',
          ink: '#1c3db3',
        },
        ink: {
          DEFAULT: '#0a0a0b',
          70: '#3d3d40',
          50: '#6b6b70',
          30: '#a3a3a8',
        },
        paper: '#fafafa',
        line: '#e6e6e8',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'pop-in': 'pop-in 0.14s ease-out',
      },
    },
  },
  plugins: [],
}
