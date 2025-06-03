// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // BUNDA SIZNING JSX FAYLLARINGIZ BO‘LISHI KERAK
    "./app/**/*.{js,ts,jsx,tsx}", // AGAR Next.js ishlatilayotgan bo‘lsa
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px", // ✅ 400px breakpoint
      },
    },
  },
  plugins: [],
};
