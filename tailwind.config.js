/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            colors: {
                brand: {
                    dark: '#2c000e', // vinho escuro
                    primary: '#8a1c37', // vinho
                    accent: '#e6a8b5', // rosa claro
                }
            }
        },
    },
    plugins: [],
}
