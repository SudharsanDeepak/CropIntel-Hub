export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7f0',
          100: '#e8edd9',
          200: '#d4ddb8',
          300: '#b8c88f',
          400: '#9fb36d',
          500: '#84994f', 
          600: '#6b7d3f',
          700: '#556335',
          800: '#46502d',
          900: '#3b4327',
        },
        secondary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#ffd54d',
          400: '#ffc520',
          500: '#fcb53b', 
          600: '#f59e0b',
          700: '#d97706',
          800: '#b45309',
          900: '#92400e',
        },
        accent: {
          50: '#fef9f3',
          100: '#fef3e7',
          200: '#fde4c3',
          300: '#fcd59f',
          400: '#ffc757',
          500: '#ffe797', 
          600: '#f0d77d',
          700: '#d4b85a',
          800: '#b89a3f',
          900: '#9c7f2a',
        },
        tertiary: {
          50: '#fdf2f2',
          100: '#fce4e4',
          200: '#f9c9c9',
          300: '#f4a3a3',
          400: '#ed7373',
          500: '#b45253', 
          600: '#9d3f40',
          700: '#7f3334',
          800: '#6a2b2c',
          900: '#5a2627',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}