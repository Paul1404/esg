import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0b0d12',
          elev: '#11141b',
          card: '#161a23',
        },
        border: {
          DEFAULT: '#262a35',
          strong: '#363b48',
        },
        accent: {
          DEFAULT: '#7c5cff',
          hover: '#6b4ef5',
          soft: 'rgba(124, 92, 255, 0.15)',
        },
        text: {
          DEFAULT: '#e6e8ee',
          muted: '#9aa3b2',
          dim: '#6b7385',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)',
        glow: '0 0 0 1px rgba(124,92,255,0.4), 0 8px 24px rgba(124,92,255,0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
