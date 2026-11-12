/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#292720",
          950: "#F3EBDD",
          900: "#FFFCF5",
          800: "#E4DBCB",
          700: "#81735E",
        },
        canvas: "#F3EBDD",
        muted: "#625A4C",
        amber: {
          DEFAULT: "#A74E2E",
          soft: "#873D25",
        },
        teal: {
          DEFAULT: "#355843",
          deep: "#294434",
        },
        flag: {
          DEFAULT: "#A34134",
          soft: "#F1DDD7",
        },
        ivory: "#292720",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Space Grotesk'", "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "7px",
        lg: "12px",
      },
    },
  },
  plugins: [],
}

