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
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      // Map design tokens to Tailwind theme
      colors: {
        // PB Brand Colors
        pb: {
          blue: 'var(--pb-blue)',
          'blue-soft': 'var(--pb-blue-soft)',
          'blue-dark': 'var(--pb-blue-dark)',
          'blue-light': 'var(--pb-blue-light)',
          bg0: 'var(--bg-0)',
          bg1: 'var(--bg-1)',
          text0: 'var(--text-0)',
          text1: 'var(--text-1)',
          text2: 'var(--text-2)',
          text3: 'var(--text-3)',
        },
        
        // Legacy support for existing components
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      
      // Design system radius
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'var(--radius)',      // Maps to --radius (20px)
        '2xl': 'var(--radius-xl)',
        '3xl': 'var(--radius-2xl)',
      },
      
      // Design system shadows
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        glass: 'var(--shadow-glass)',
      },
      
      // Design system spacing (extends Tailwind defaults)
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
      },
      
      // Animation system
      transitionTimingFunction: {
        'pb': 'var(--ease)',
        'pb-out': 'var(--ease-out)',
        'pb-in': 'var(--ease-in)',
      },
      
      transitionDuration: {
        fast: 'var(--t-fast)',
        med: 'var(--t-med)',
        slow: 'var(--t-slow)',
      },
      
      // Backdrop blur system
      backdropBlur: {
        glass: 'var(--glass-blur)',
      },
      
      // Typography system
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
        mono: 'var(--font-mono)',
        raleway: ['Raleway', 'sans-serif'], // Legacy support
      },
      
      // Z-index system
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Enhanced keyframes for glass effects
      keyframes: {
        // Existing accordion animations
        'accordion-down': {
          from: { height: "0", opacity: "0" },
          to: { height: 'var(--radix-accordion-content-height)', opacity: "1" }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        
        // Glass-specific animations
        'glass-shimmer': {
          '0%, 100%': { 
            transform: 'scale(var(--glass-refraction-scale)) translateX(-100%)',
            opacity: '0'
          },
          '50%': { 
            transform: 'scale(var(--glass-refraction-scale)) translateX(0)',
            opacity: '1'
          }
        },
        
        'glass-float': {
          '0%, 100%': { 
            transform: 'translateY(0px) rotateZ(0deg)' 
          },
          '50%': { 
            transform: 'translateY(-8px) rotateZ(1deg)' 
          }
        },
        
        // Fade animations
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        
        'fade-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' }
        },
        
        // Scale animations
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' }
        },
        
        // Slide animations
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      
      animation: {
        // Basic animations
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        
        // Glass animations
        'glass-shimmer': 'glass-shimmer 2s ease-in-out infinite',
        'glass-float': 'glass-float 6s ease-in-out infinite',
        
        // Interaction animations
        'fade-in': 'fade-in 0.3s var(--ease-out)',
        'fade-out': 'fade-out 0.3s var(--ease-out)',
        'scale-in': 'scale-in 0.2s var(--ease-out)',
        'scale-out': 'scale-out 0.2s var(--ease-out)',
        'slide-in-right': 'slide-in-right 0.3s var(--ease-out)',
        'slide-out-right': 'slide-out-right 0.3s var(--ease-out)',
        
        // Combined animations
        'enter': 'fade-in 0.3s var(--ease-out), scale-in 0.2s var(--ease-out)',
        'exit': 'fade-out 0.3s var(--ease-out), scale-out 0.2s var(--ease-out)'
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    
    // Custom utilities for glass system
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Interactive glass effects
        '.hover-glass': {
          transition: 'all var(--t-med) var(--ease)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: theme('boxShadow.lg')
          }
        },
        
        // Glass content protection
        '.glass-content': {
          position: 'relative',
          zIndex: '2'
        },
        
        // Story link animation
        '.story-link': {
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            transform: 'scaleX(0)',
            height: '2px',
            bottom: '0',
            left: '0',
            backgroundColor: 'var(--pb-blue)',
            transformOrigin: 'bottom right',
            transition: 'transform var(--t-fast) var(--ease)'
          },
          '&:hover::after': {
            transform: 'scaleX(1)',
            transformOrigin: 'bottom left'
          }
        }
      };
      
      addUtilities(newUtilities);
    }
  ],
} satisfies Config;
