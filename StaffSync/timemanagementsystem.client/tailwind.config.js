/** @type {import('tailwindcss').Config} */
import  colors from "tailwindcss/colors"
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
        colors: {
          background: {
            100: "#D9D9D9",
          }, 

          primary:"#242E56",
          
          secondary: "#e76818",
          tertiary:"#249ca7"
        },
      },
  
  },
  plugins: [],
}

