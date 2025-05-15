/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        'primary-light': 'var(--color-primary-light)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
        'accent-alt': 'var(--color-accent-alt)',
        background: 'var(--color-background)',
        'background-alt': 'var(--color-background-alt)',
        'background-peach': 'var(--color-background-peach)',
        text: 'var(--color-text)',
        'text-light': 'var(--color-text-light)',
      },
      fontFamily: {
        sans: ['Nunito', 'DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'ui-serif', 'Georgia', 'serif'],
        handwriting: ['Dancing Script', 'cursive'],
      },
      boxShadow: {
        'glow-sm': '0 0 5px rgba(139, 92, 246, 0.5)',
        'glow-md': '0 0 15px rgba(139, 92, 246, 0.5)',
        'glow-lg': '0 0 25px rgba(139, 92, 246, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}