/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backgroundImage: {
                'game-bg': "url('/background.png')",
                'game-table': "url('/table.png')",
                'game-home': "url('/home.png')",
            }
        },
    },
    plugins: [],
}
