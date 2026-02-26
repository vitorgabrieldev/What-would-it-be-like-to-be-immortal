/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 10px 40px rgba(2,6,23,0.4)",
      },
    },
  },
  plugins: [],
};
