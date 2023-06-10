/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    corePlugins: { preflight: false, },
    theme: {
    extend: {
        fontFamily: {
            sans: ['var(--font-montserrat)'],
            mono: ['var(--font-montserrat)'],
        },
    },
    },
    plugins: [require("tailwindcss-animate")],
}