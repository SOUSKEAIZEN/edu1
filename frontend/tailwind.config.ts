import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			surface: 'var(--surface)',
  			elevated: 'var(--elevated)',
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--surface)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--surface)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--foreground)'
  			},
  			border: 'var(--border)',
  			success: 'var(--success)',
  			warning: 'var(--warning)',
  			danger: 'var(--danger)',
  			info: 'var(--info)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      }
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
