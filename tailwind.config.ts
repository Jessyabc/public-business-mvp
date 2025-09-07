import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        // PB Brand Colors - New system
        pb: {
          blue: "hsl(var(--pb-blue))",
          blueSoft: "hsl(var(--pb-blue-soft))",
        },
        ink: {
          base: "hsl(var(--text-ink))",
          dark: "hsl(var(--text-ink-d))",
        },
        
        // Post Type Accents
        accent: {
          open: "hsl(var(--pb-accent-open))",
          brainstorm: "hsl(var(--pb-accent-brainstorm))",
          insight: "hsl(var(--pb-accent-insight))",
          video: "hsl(var(--pb-accent-video))",
        },
        
        // Score Tones
        tone: {
          t: "hsl(var(--tone-t))",
          u: "hsl(var(--tone-u))",
        },

        // Legacy support for existing components
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "var(--radius)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        pbmd: "var(--shadow-md)",
        pblg: "var(--shadow-lg)",
      },
      // Soft emissive logo glows
      dropShadow: {
        brand: "0 0 40px rgba(59,130,246,0.35)",           // blue-ish
        "brand-strong": "0 0 60px rgba(99,102,241,0.40)",  // indigo-ish
      },
      transitionTimingFunction: {
        pb: "var(--ease)",
      },
      transitionDuration: {
        fast: "120ms",
        med: "220ms",
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
        // Center glow (keeps translate baked-in)
        "glow-center": {
          "0%, 100%": {
            transform: "translate(-50%, -50%) scale(1)",
            opacity: "0.9",
          },
          "50%": {
            transform: "translate(-50%, -50%) scale(1.06)",
            opacity: "1",
          },
        },
        // Corner blobs
        glow: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.06)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "glow-center": "glow-center 7s ease-in-out infinite",
        glow: "glow 8.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
