/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#050505',
        'bg-card': '#0F0F11',
        'bg-card-hover': '#161619',
        'brand-primary': '#00E5FF',
        'brand-primary-dark': '#00BBD4',
        'brand-secondary': '#FF3D00',
        'brand-accent': '#FBBF24',
        'text-main': '#F8FAFC',
        'text-muted': '#94A3B8',
        'text-dark': '#0f172a',
      },
      fontFamily: {
        outfit: ['var(--font-outfit)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
