const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@apideck/components/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        'basier-circle': ['Basier Circle', ...defaultTheme.fontFamily.sans],
        'united': ['Chakra Petch', 'sans-serif'],
        'pixelify': ['Pixelify Sans', 'sans-serif'],
      },
      letterSpacing: {
        'widest': '.25em'
      },
      colors: {
        gray: colors.slate,
        primary: {
          DEFAULT: '#1E755C',
          light: '#66DCB7',
          bright: '#00FF9F'
        },
        rokobot: {
          50: '#00FF9F',
          100: '#66DCB7',
          200: '#1E755C'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
