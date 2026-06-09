/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        paper: '#EEE8DC',
        cream: '#FBF8F1',
        ink: { DEFAULT: '#23201A', soft: '#5C534A' },
        muted: '#9A8F80',
        ember: { DEFAULT: '#B5532A', dark: '#964123', soft: '#EBDDD2' },
        olive: '#6C6A48',
        line: { DEFAULT: '#D8D0C1', soft: '#E7DFD1' },
        creamlight: '#FBF6EE',
      },
      fontFamily: {
        display: ['Marcellus', 'Georgia', 'serif'],
        body: ['Spectral', 'Georgia', 'serif'],
        label: ['Archivo', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        kicker: '0.16em',
      },
    },
  },
  plugins: [],
}