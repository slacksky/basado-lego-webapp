/** @type {import('tailwindcss').Config} */
module.exports = {
  content:  [`./views/**/*.ejs`], // now tracking the ejs files
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ["cupcake","fantasy", "dark",  "light", "aqua"],
  },
}


