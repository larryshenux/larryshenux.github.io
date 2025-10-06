document.addEventListener('DOMContentLoaded', function() {
    const heroSection = document.querySelector('.hero-section');
    const heroOverlay = document.querySelector('.hero-overlay');
    const projectTitle = document.querySelector('.project-title');
    
    function updateHeroEffects() {
        // Get the hero section's position relative to viewport
        const heroRect = heroSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Calculate how much of the hero section has been scrolled past
        // This will be 0 when the hero is fully visible at the top
        // and 1 when it's scrolled halfway out of view
        const scrolledPercent = -heroRect.top / (heroRect.height / 2);
        
        // Clamp the value between 0 and 1
        const overlayOpacity = Math.min(Math.max(scrolledPercent, 0), 1);
        
        // Apply the overlay opacity
        heroOverlay.style.opacity = overlayOpacity;
        
        // Handle title visibility
        // Start showing title at 40% scroll progress
        if (scrolledPercent >= 0.4) {
            const titleProgress = Math.min((scrolledPercent - 0.4) / 0.1, 1);
            projectTitle.style.opacity = titleProgress;
            if (titleProgress > 0) {
                projectTitle.classList.add('visible');
            }
        } else {
            projectTitle.style.opacity = 0;
            projectTitle.classList.remove('visible');
        }
    }
    
    // Update on scroll
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateHeroEffects);
    });
    
    // Initial update
    updateHeroEffects();
    
    // Add theme change observer
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
