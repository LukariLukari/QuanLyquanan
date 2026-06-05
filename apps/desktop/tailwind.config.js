/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          pressed: 'var(--color-primary-pressed)',
        },
        canvas: 'var(--color-canvas)',
        surface: {
          soft: 'var(--color-surface-soft)',
          card: 'var(--color-surface-card)',
        },
        secondary: 'var(--color-secondary)',
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: 'var(--color-muted)',
        hairline: 'var(--color-hairline)',
        success: {
          deep: 'var(--color-success-deep)',
          pale: 'var(--color-success-pale)',
        },
        error: 'var(--color-error)',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'lg': '16px',
        'xl': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}
