/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#15142A",
          950: "#0F0E18",
          900: "#15142A",
          800: "#1F1E38",
          700: "#2A2948",
        },
        canvas: "#EEF2EF",
        amber: {
          DEFAULT: "#E6A930",
          soft: "#F3D9A0",
        },
        teal: {
          DEFAULT: "#3FB6A8",
          deep: "#2C8478",
        },
        flag: {
          DEFAULT: "#D8455B",
          soft: "#F3C3CB",
        },
        ivory: "#F5F1E6",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Space Grotesk'", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "18px",
      },
    },
  },
  plugins: [],
}

