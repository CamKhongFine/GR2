/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1677FF',
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // Disable preflight to avoid conflict with Ant Design
  },
}
