/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#050505',
          surface: 'rgba(255, 255, 255, 0.03)',
          card: 'rgba(255, 255, 255, 0.05)',
        },
        accent: {
          primary: '#00f3ff',     // Cyan
          secondary: '#ff00c1',   // Pink (Magenta)
          third: '#9d00ff',       // Purple
        },
        text: {
          primary: '#ffffff',
          secondary: 'rgba(255, 255, 255, 0.65)',
        },
        border: {
          color: 'rgba(255, 255, 255, 0.10)',
        },
        success: '#00ff9d',
        warning: '#ffc857',
        danger: '#ff4d6d',
      },
      fontFamily: {
        archivo: ['Archivo', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        card: '32px',
        'product-card': '40px',
        input: '16px',
        dialog: '24px',
      },
      backdropBlur: {
        glass: '12px',
      },
      transitionDuration: {
        'default': '600ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
        'spin-slow': 'spin 20s linear infinite',
        'spin-reverse-slow': 'spin-reverse 25s linear infinite',
        'spin-fast': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
