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
        primary: {
          DEFAULT: '#003354',
          dark: '#002B49',
          light: '#004A70',
        },
        secondary: {
          DEFAULT: '#007DA8',
          light: '#16B8C8',
        },
        accent: {
          DEFAULT: '#FFC43D',
          hover: '#F4B426',
        },
        ice: '#F0F9FD',
        lightBlue: '#E8F5FB',
        borderBlue: '#D5EDF7',
        textBlue: '#285C7D',
        mutedBlue: '#6797B4',
        success: '#1FC98A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        caveat: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '0 4px 18px rgba(0, 83, 130, 0.08)',
        'card-hover': '0 8px 25px rgba(0, 83, 130, 0.12)',
        progress: '0 10px 30px rgba(0, 32, 58, 0.15)',
      },
      borderRadius: {
        'pill': '999px',
      },
    },
  },
  plugins: [],
}
