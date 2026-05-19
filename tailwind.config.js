/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Override the entire blue scale with #00255a as the primary brand
        // blue-600 = brand primary, lighter shades for variety, darker for hover/overlay
        blue: {
          50:  '#eef3fb',
          100: '#d5e3f5',
          200: '#abc7eb',
          300: '#6699d4', // lighter blue — for icons, tags on dark bg
          400: '#2e6cbf', // medium blue — accents, hover on light
          500: '#0047a1', // near-brand lighter — subtle CTAs
          600: '#00255a', // ← PRIMARY brand color
          700: '#001c47', // hover state for primary CTA
          800: '#0d1b3e', // dark navy — hero overlay, footer bg
          900: '#060f27', // deeper navy
          950: '#03091a', // near-black navy
        },

        // Yellow accent — UBL brand yellow #feef00
        accent: {
          50:  '#fffde6',
          100: '#fffab8',
          200: '#fff575',
          300: '#feef33',
          400: '#feef00', // ← main accent (buttons, highlights)
          500: '#cdc100', // hover
          600: '#a09500',
          700: '#746b00',
          800: '#484200',
          900: '#1c1a00',
        },
      },
    },
  },
  plugins: [],
}
