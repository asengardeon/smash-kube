/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./renderer/**/*.{js,jsx,html}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#111827',
        'dark-sidebar': '#1f2937',
        'accent': '#3b82f6',
      }
    },
  },
  plugins: [],
}
