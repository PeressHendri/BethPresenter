/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /*─── Colors ──────────────────────────────────────────────────────*/
      colors: {
        /* Surfaces */
        surface: {
          base:     'var(--surface-base)',
          primary:  'var(--surface-primary)',
          elevated: 'var(--surface-elevated)',
          sidebar:  'var(--surface-sidebar)',
          popover:  'var(--surface-popover)',
          input:    'var(--surface-input)',
          hover:    'var(--surface-hover)',
          active:   'var(--surface-active)',
        },

        /* Legacy aliases (backward compatibility) */
        bg: {
          primary:   'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          sidebar:   'var(--bg-sidebar)',
          hover:     'var(--bg-hover)',
        },

        /* Text */
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          100: 'var(--text-100)',
          200: 'var(--text-200)',
          400: 'var(--text-400)',
          600: 'var(--text-600)',
          muted: 'var(--text-muted)',
        },

        /* Accent – Maroon */
        accent: {
          DEFAULT: 'var(--accent)',
          hover:   'var(--accent-hover)',
          success: 'var(--accent-success)',
          50:  'var(--accent-50)',
          100: 'var(--accent-100)',
          400: 'var(--accent-400)',
          500: 'var(--accent-500)',
          600: 'var(--accent-600)',
          700: 'var(--accent-700)',
        },

        /* Status colors */
        live:    { DEFAULT: 'var(--success-500)', 400: 'var(--success-400)' },
        warn:    { DEFAULT: 'var(--warning-500)', 400: 'var(--warning-400)' },
        danger:  { DEFAULT: 'var(--danger-500)',  400: 'var(--danger-400)', 600: 'var(--danger-600)' },
        info:    { DEFAULT: 'var(--info-500)',    400: 'var(--info-400)' },

        /* Border single value for Tailwind's border-{color} utilities */
        border: 'var(--border)',
      },

      /*─── Typography ─────────────────────────────────────────────────*/
      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1rem' }],
      },
      letterSpacing: {
        widest: '0.1em',
      },

      /*─── Box Shadow ─────────────────────────────────────────────────*/
      boxShadow: {
        'custom':       'var(--shadow)',
        'sm':           'var(--shadow-sm)',
        'card':         'var(--shadow-md)',
        'panel':        'var(--shadow-lg)',
        'modal':        'var(--shadow-xl)',
        'glow-accent':  'var(--shadow-glow-accent)',
        'glow-live':    'var(--shadow-glow-live)',
        'inner-subtle': 'inset 0 1px 0 rgba(255,255,255,0.05)',
        'press':        'inset 0 2px 4px rgba(0,0,0,0.3)',
      },

      /*─── Border Radius ──────────────────────────────────────────────*/
      borderRadius: {
        'xs': '3px',
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },

      /*─── Spacing ─────────────────────────────────────────────────────*/
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '72': '18rem',
        '76': '19rem',
        '80': '20rem',
        'sidebar': 'var(--sidebar-width)',
        'control-bar': 'var(--control-bar-height)',
      },

      /*─── Width ───────────────────────────────────────────────────────*/
      width: {
        'sidebar':       'var(--sidebar-width)',
        'service-order': 'var(--service-order-width)',
        'slide-panel':   'var(--slide-panel-width)',
      },

      /*─── Transition ──────────────────────────────────────────────────*/
      transitionDuration: {
        '50':  '50ms',
        '100': '100ms',
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /*─── Animation ───────────────────────────────────────────────────*/
      animation: {
        'fade-in':        'fadeIn 0.2s ease-out forwards',
        'slide-up':       'slideUp 0.25s cubic-bezier(0, 0, 0.2, 1) forwards',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0, 0, 0.2, 1) forwards',
        'live-pulse':     'livePulse 1.5s ease-in-out infinite',
        'shimmer':        'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        livePulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },

      /*─── Z-Index ─────────────────────────────────────────────────────*/
      zIndex: {
        'dropdown': '1000',
        'sticky':   '1020',
        'fixed':    '1030',
        'modal':    '1050',
        'popover':  '1060',
        'tooltip':  '1070',
      },
    },
  },
  plugins: [],
}
