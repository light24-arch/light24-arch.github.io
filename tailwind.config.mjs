/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Helvetica Neue"', 'Helvetica', '"Nimbus Sans"', 'Arial', '"PingFang SC"', '"Noto Sans SC"', '"Source Han Sans CN"', 'sans-serif'],
        display: ['"Helvetica Neue"', 'Helvetica', '"Nimbus Sans"', 'Arial', 'sans-serif'],
      },
      colors: {
        background: '#FFFFFF',
        surface: '#F5F5F5',
        border: '#E5E5E5',
        'text-primary': '#0A0A0A',
        'text-secondary': '#737373',
        'text-tertiary': '#A3A3A3',
        accent: '#1A1A1A',
        arch: {
          0: '#FFFFFF',
          1: '#E4E4E4',
          2: '#B6B6B6',
          3: '#8C8C8C',
          4: '#585858',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.05em' }],
        'massive': ['clamp(4rem, 10vw, 8rem)', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'hero': ['clamp(3rem, 8vw, 6rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
