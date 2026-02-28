/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'his-green': {
                    50: '#f7fbe7',
                    100: '#edf7cc',
                    200: '#d9ef9f',
                    300: '#bedf67',
                    400: '#a3cc2b', // The core primary green
                    500: '#86b020',
                    600: '#688c18',
                    700: '#4f6b15',
                    800: '#405615',
                    900: '#384a17',
                },
                'his-slate': {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    500: '#64748b',
                    900: '#0f172a',
                },
            },
            boxShadow: {
                'sleek': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }
        },
    },
    plugins: [],
}
