/** @type {import('tailwindcss').Config} */
module.exports = {
  content:  [`./views/**/*.html`], // should watchall .html files
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ["fantasy", "dark", "cupcake", "light", "aqua"],
  },
}


