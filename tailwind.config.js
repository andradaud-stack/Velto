/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F4F2FA',
        surface: '#FFFFFF',
        'surface-border': '#ECE8F6',
        primary: {
          DEFAULT: '#7C4DFF',
          dark: '#6633EE',
          light: '#8054F6',
          soft: '#F3EEFF',
          hover: '#6A37FF'
        },
        slate: {
          deep: '#1E1B2E',
          muted: '#6B7280',
          subtle: '#7E7A9B',
          soft: '#A19DB8'
        },
        financial: {
          gain: '#10B981',
          'gain-soft': '#ECFDF5',
          loss: '#EF4444',
          'loss-soft': '#FEF2F2',
          warning: '#F59E0B',
          'warning-soft': '#FEF3C7',
          info: '#6366F1',
          'info-soft': '#EEF2FF',
          gold: '#EAB308',
          'gold-soft': '#FEF9C3'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft-card': '0 4px 20px -2px rgba(124, 77, 255, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'hero-card': '0 12px 32px -4px rgba(124, 77, 255, 0.35)',
        'bottom-bar': '0 -4px 24px rgba(0, 0, 0, 0.08)',
        'glow-primary': '0 0 20px rgba(124, 77, 255, 0.25)',
      },
      borderRadius: {
        '28px': '28px',
      }
    },
  },
  plugins: [],
}
