module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LUXURY WARM PALETTE
        'cream': '#fdfcfb',           // Main background - brighter/clearer
        'ivory': '#f4f1ee',           // Secondary background
        'beige': '#e8e4df',           // Tertiary background
        'warm-gray': '#ccc4bc',       // Borders & dividers - darker
        'stone': '#a39992',           // Muted accents
        'charcoal': '#1a1817',        // Text - dark - increased contrast
        'deep-brown': '#121110',      // Text - darker
        'warm-taupe': '#5c5550',      // Secondary text - much darker for readability
        'gold-accent': '#ca8a04',     // Vivid amber-orange
        'sage': '#5a6a4d',            // Darker sage
        'powder-blue': '#7a8ba3',     // Darker powder
        'rose-dust': '#947585',       // Darker rose
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.4)',
        'glass-dark': 'rgba(0, 0, 0, 0.04)',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '24px',
        'xl': '40px',
      },
      boxShadow: {
        'luxury': '0 8px 24px rgba(0, 0, 0, 0.08)',
        'luxury-lg': '0 12px 48px rgba(0, 0, 0, 0.1)',
        'premium': '0 4px 12px rgba(196, 169, 98, 0.1)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
        'fade-in': 'fadeIn 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'system-ui', 'sans-serif'],
        'display': ['Sohne', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
