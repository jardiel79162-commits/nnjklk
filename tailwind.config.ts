import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "white",
        input: "white",
        ring: "white",
        background: "white",
        foreground: "white",
        primary: {
          DEFAULT: "white",
          foreground: "white",
          glow: "white",
        },
        secondary: {
          DEFAULT: "white",
          foreground: "white",
        },
        destructive: {
          DEFAULT: "white",
          foreground: "white",
        },
        muted: {
          DEFAULT: "white",
          foreground: "white",
        },
        accent: {
          DEFAULT: "white",
          foreground: "white",
        },
        popover: {
          DEFAULT: "white",
          foreground: "white",
        },
        card: {
          DEFAULT: "white",
          foreground: "white",
        },
        sidebar: {
          DEFAULT: "white",
          foreground: "white",
          primary: "white",
          "primary-foreground": "white",
          accent: "white",
          "accent-foreground": "white",
          border: "white",
          ring: "white",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "progress": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress)" },
        },
        "gradient-bg": {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        "gradient-bg": "gradient-bg 15s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
