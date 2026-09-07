/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        border: "var(--border)",
        text: "var(--text)",
        muted: "var(--text-secondary)",
        amber: "var(--accent-amber)",
        teal: "var(--accent-teal)",
        danger: "var(--danger)",
        platform: {
          tiktok: "var(--platform-tiktok)",
          instagram: "var(--platform-instagram)",
          youtube: "var(--platform-youtube)",
        },
      },
      fontFamily: {
        sans: ["var(--font-public-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};
