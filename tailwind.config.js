/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{html,ts,scss}', 
    './src/app/components/**/*.{html,ts,scss}', 
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      screens: {
        'print': {'raw': 'print'},
      },
    },
  },
  plugins: [],
};
