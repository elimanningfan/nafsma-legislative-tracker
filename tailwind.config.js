/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
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
        'heading': ['var(--font-source-sans)', 'sans-serif'],
        'body': ['var(--font-source-sans)', 'sans-serif'],
      },
      fontSize: {
        // NAFSMA typography scale
        'h1': ['44px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1-mobile': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['30px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2-mobile': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3-mobile': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.7', fontWeight: '400' }],
      },
      colors: {
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
        // NAFSMA brand colors
        'nafsma-blue': '#1B4B82',
        'nafsma-teal': '#2A8080',
        'nafsma-light-blue': '#EBF4FA',
        'nafsma-warm-gray': '#4A4A4A',
        'nafsma-light-gray': '#F5F5F5',
        'nafsma-dark-navy': '#0D2B4E',
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: theme('colors.nafsma-warm-gray'),
            fontSize: '1.0625rem',
            lineHeight: '1.7',
            p: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
            },
            h2: {
              color: theme('colors.nafsma-blue'),
              fontWeight: '600',
              fontSize: '1.875rem',
              marginTop: '2.5rem',
              marginBottom: '1rem',
            },
            h3: {
              color: theme('colors.nafsma-blue'),
              fontWeight: '600',
              fontSize: '1.25rem',
              marginTop: '2rem',
              marginBottom: '0.75rem',
            },
            a: {
              color: theme('colors.nafsma-teal'),
              fontWeight: '600',
              textDecoration: 'none',
              '&:hover': {
                color: theme('colors.nafsma-blue'),
                textDecoration: 'underline',
              },
            },
            ul: {
              marginTop: '1.25rem',
              marginBottom: '1.25rem',
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
            },
            li: {
              marginTop: '0.375rem',
              marginBottom: '0.375rem',
            },
            table: {
              marginTop: '2rem',
              marginBottom: '2rem',
              width: '100%',
              fontSize: '0.875rem',
            },
            thead: {
              backgroundColor: theme('colors.nafsma-light-blue'),
              borderBottomWidth: '2px',
              borderColor: theme('colors.nafsma-blue'),
            },
            'thead th': {
              color: theme('colors.nafsma-blue'),
              fontWeight: '600',
              textAlign: 'left',
              padding: '0.75rem 1rem',
            },
            'tbody tr': {
              borderBottomWidth: '1px',
              borderColor: '#e5e7eb',
            },
            'tbody td': {
              padding: '0.75rem 1rem',
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
  ],
}
