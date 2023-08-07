/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ["./views/**/*.pug"],
  // safelist: [
  //   {
  //     pattern: /./, // the "." means "everything"
  //   },
  // ],
  theme: {
    fontFamily: {
      sans: ["\"Open Sans\""],
      serif: ["Bitter"],
    },
    extend: {
      colors: {
        "back-blue": "#27313F",
        "primary": "#4DB7D1",
        "secondary": "#FF6392",
      },
    }
    
  },
  variants: {
  extend: {},
  },
  plugins: [],
};