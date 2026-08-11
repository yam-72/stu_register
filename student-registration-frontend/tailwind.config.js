/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#EEF2F8",
          100: "#D6E0EE",
          200: "#AEC1DD",
          300: "#7F9BC3",
          400: "#4E6FA0",
          500: "#2E4E7C",
          600: "#1F3A5F",
          700: "#172C49",
          800: "#101F35",
          900: "#0B1524"
        },
        gold: {
          50: "#FBF4E4",
          100: "#F3E3BC",
          200: "#E6C784",
          300: "#D8AC56",
          400: "#C89B3C",
          500: "#B0842E",
          600: "#8C6822"
        },
        ink: "#1A2233",
        muted: "#64748B",
        paper: "#F6F7FB",
        line: "#E3E7EF"
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,21,36,0.04), 0 8px 24px -8px rgba(11,21,36,0.10)",
        pop: "0 12px 32px -8px rgba(11,21,36,0.22)"
      },
      borderRadius: {
        xl2: "1.1rem"
      }
    }
  },
  plugins: []
};
