// Function to update theme icons
function updateThemeIcons(theme) {
    const icons = ['theme-icon', 'theme-icon-mobile'];
    icons.forEach(iconId => {
        const icon = document.getElementById(iconId);
        if (icon) {
            if (theme === 'dark') {
                icon.classList.remove('bi-sun-fill');
                icon.classList.add('bi-moon-fill');
            } else {
                icon.classList.remove('bi-moon-fill');
                icon.classList.add('bi-sun-fill');
            }
        }
    });
}

// Function to update theme
function setTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcons(theme);
}

document.addEventListener('DOMContentLoaded', () => {
    const themeToggles = ['theme-toggle', 'theme-toggle-mobile'];
    
    // Load saved theme or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
    
    // Handle theme toggle clicks for both desktop and mobile
    themeToggles.forEach(toggleId => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
            toggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-bs-theme');
                setTheme(currentTheme === 'dark' ? 'light' : 'dark');
            });
        }
    });
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
});
