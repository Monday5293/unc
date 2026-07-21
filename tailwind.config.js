/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,vue}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主调色板
        ink: {
          900: "#0F0E0C", // 墨黑
          800: "#1A1714",
          700: "#2A241F",
          600: "#3A322B",
          500: "#4A4036",
        },
        parchment: {
          50: "#F7F1E3",
          100: "#EFE5CE",
          200: "#E8DCC4", // 羊皮纸
          300: "#D9C9A3",
          400: "#C4B083",
        },
        // 规则强调色
        coc: "#3B6B4A", // 腐化绿
        dnd: "#C8A046", // 龙焰金
        daggerheart: "#9BA8B5", // 月银
      },
      fontFamily: {
        cinzel: ['"Cinzel"', "serif"],
        sans: ['"Noto Sans SC"', "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "parchment-texture":
          "radial-gradient(circle at 20% 30%, rgba(200,160,70,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59,107,74,0.06) 0%, transparent 50%), linear-gradient(135deg, #E8DCC4 0%, #DFD0B0 100%)",
        "ink-noise":
          "radial-gradient(circle at 30% 20%, rgba(200,160,70,0.05) 0%, transparent 40%), radial-gradient(circle at 70% 80%, rgba(59,107,74,0.04) 0%, transparent 40%), linear-gradient(180deg, #0F0E0C 0%, #1A1714 100%)",
      },
      boxShadow: {
        card: "0 8px 24px -8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)",
        "card-hover": "0 16px 40px -12px rgba(200,160,70,0.35), 0 4px 8px rgba(0,0,0,0.3)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "scale-in": "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.92)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
