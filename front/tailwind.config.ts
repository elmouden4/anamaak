import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
      colors: {
        // Couleurs de Marrakech
        marrakech: {
          red: "#C4302B", // Rouge terracotta emblématique
          orange: "#E67E22", // Ocre des murs
          gold: "#F39C12", // Or des détails
          blue: "#2E86AB", // Bleu majorelle
          green: "#27AE60", // Vert des jardins
          sand: "#F4E4BC", // Beige sable
          terracotta: "#CD853F", // Terracotta clair
          sunset: "#FF6B35", // Orange coucher de soleil
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#C4302B", // Rouge Marrakech
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F4E4BC", // Sable
          foreground: "#C4302B",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#F39C12", // Or
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        "marrakech-gradient": "linear-gradient(135deg, #C4302B 0%, #E67E22 50%, #F39C12 100%)",
        "sunset-gradient": "linear-gradient(135deg, #FF6B35 0%, #F39C12 50%, #E67E22 100%)",
        "desert-gradient": "linear-gradient(135deg, #F4E4BC 0%, #CD853F 100%)",
        "majorelle-gradient": "linear-gradient(135deg, #2E86AB 0%, #27AE60 100%)",
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
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
