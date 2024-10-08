/** @type {import('tailwindcss').Config} */
module.exports = {
  content:  [`./views/**/*.html`], // should watchall .html files
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ["cupcake","fantasy", "dark",  "light", "aqua"],
  },
}


