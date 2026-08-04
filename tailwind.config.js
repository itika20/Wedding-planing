/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FFF8F2',
        offwhite: '#FBF7F4',
        champagne: {
          DEFAULT: '#D4AF37',
          soft: '#E7D3A1',
          deep: '#B8912A',
        },
        rose: {
          DEFAULT: '#D89CA4',
          soft: '#F0D7DB',
          deep: '#B87883',
        },
        sage: {
          DEFAULT: '#8CA98C',
          soft: '#DDE8DD',
          deep: '#5F7A5F',
        },
        amber: {
          DEFAULT: '#E0A458',
          soft: '#F6E4CC',
        },
        clay: {
          DEFAULT: '#D98A7B',
          soft: '#F3D9D3',
        },
        ink: {
          DEFAULT: '#2B2622',
          soft: '#6B6259',
          faint: '#9A9088',
        },
        line: '#EFE6DD',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(43,38,34,0.04), 0 8px 24px rgba(43,38,34,0.06)',
        lift: '0 2px 4px rgba(43,38,34,0.05), 0 16px 40px rgba(43,38,34,0.10)',
        glow: '0 0 0 1px rgba(212,175,55,0.25), 0 8px 30px rgba(212,175,55,0.15)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
}
