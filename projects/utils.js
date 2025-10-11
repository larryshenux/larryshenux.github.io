// Color utilities
function invertHexColor(hex) {
    // Remove the hash if present
    hex = hex.replace('#', '');
    
    // Convert to RGB
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    
    // Invert colors
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    
    // Convert back to hex
    const invertedHex = '#' + 
        r.toString(16).padStart(2, '0') +
        g.toString(16).padStart(2, '0') +
        b.toString(16).padStart(2, '0');
    
    return invertedHex;
}

function updateColoredSections() {
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const coloredSections = document.querySelectorAll('[data-base-color]');
    
    coloredSections.forEach(section => {
        const baseColor = section.getAttribute('data-base-color');
        const borderColor = section.getAttribute('data-border-color');
        const bgColor = isDarkMode ? invertHexColor(baseColor) : baseColor;
        section.style.backgroundColor = bgColor;
        if (borderColor) {
            const border = isDarkMode ? invertHexColor(borderColor) : borderColor;
            section.style.borderColor = border;
        } else {
            section.style.borderColor = bgColor;
        }
    });
}

// Set up theme change observer
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-bs-theme') {
                updateColoredSections();
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-bs-theme']
    });
    
    // Initial color update
    updateColoredSections();
});
