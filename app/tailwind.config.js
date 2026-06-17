/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "surface-container-lowest": "#ffffff",
                "inverse-primary": "#ffb4ab",
                "secondary-fixed-dim": "#ffb4ab",
                "on-secondary-fixed-variant": "#7e2a24",
                "surface-container": "#eeeeee",
                "primary-container": "#bb2221",
                "surface-tint": "#b81f1f",
                "surface-dim": "#dadada",
                "on-primary-fixed-variant": "#93000c",
                "outline-variant": "#e3beb9",
                "on-tertiary-container": "#c1dfff",
                "inverse-surface": "#2f3131",
                "secondary": "#9d4139",
                "on-surface-variant": "#5b403d",
                "on-tertiary-fixed-variant": "#004a76",
                "on-primary": "#ffffff",
                "surface-container-low": "#f3f3f3",
                "on-surface": "#1a1c1c",
                "on-error-container": "#93000a",
                "error": "#ba1a1a",
                "primary": "#97000d",
                "on-secondary-fixed": "#410002",
                "tertiary-fixed-dim": "#96cbff",
                "on-background": "#1a1c1c",
                "secondary-container": "#fd8b7f",
                "on-primary-container": "#ffd2cc",
                "surface-container-highest": "#e2e2e2",
                "tertiary": "#004c79",
                "on-tertiary": "#ffffff",
                "surface-variant": "#e2e2e2",
                "on-tertiary-fixed": "#001d33",
                "tertiary-fixed": "#cee5ff",
                "surface-bright": "#f9f9f9",
                "on-primary-fixed": "#410002",
                "background": "#f9f9f9",
                "tertiary-container": "#00659e",
                "error-container": "#ffdad6",
                "on-error": "#ffffff",
                "primary-fixed": "#ffdad6",
                "on-secondary-container": "#74231e",
                "outline": "#8f706c",
                "surface-container-high": "#e8e8e8",
                "secondary-fixed": "#ffdad6",
                "on-secondary": "#ffffff",
                "inverse-on-surface": "#f0f1f1",
                "surface": "#f9f9f9",
                "primary-fixed-dim": "#ffb4ab"
            },
            fontFamily: {
                "headline": ["Manrope", "sans-serif"],
                "body": ["Inter", "sans-serif"],
                "label": ["Inter", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "0.75rem"
            }
        }
    },
    plugins: []
}
