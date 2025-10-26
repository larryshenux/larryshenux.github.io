// Sticky navbar with show/hide on scroll
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let scrollThreshold = 0;
    let accumulatedScroll = 0;
    
    // Calculate 50% of viewport height as threshold
    const updateThreshold = () => {
        scrollThreshold = window.innerHeight * 0.5;
    };
    
    // Initial calculation
    updateThreshold();
    
    // Recalculate on window resize
    window.addEventListener('resize', updateThreshold);
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // If at the very top, always show navbar
        if (currentScroll <= 0) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-visible');
            accumulatedScroll = 0;
            lastScroll = currentScroll;
            return;
        }
        
        // Calculate scroll difference
        const scrollDiff = currentScroll - lastScroll;
        
        // Accumulate scroll in the same direction
        if ((scrollDiff > 0 && accumulatedScroll > 0) || (scrollDiff < 0 && accumulatedScroll < 0)) {
            // Same direction, add to accumulated
            accumulatedScroll += scrollDiff;
        } else {
            // Direction changed, reset accumulated scroll
            accumulatedScroll = scrollDiff;
        }
        
        // Check if accumulated scroll exceeds threshold
        if (Math.abs(accumulatedScroll) >= scrollThreshold) {
            if (accumulatedScroll > 0) {
                // Scrolled down past threshold - hide navbar
                navbar.classList.remove('navbar-visible');
                navbar.classList.add('navbar-hidden');
            } else {
                // Scrolled up past threshold - show navbar
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-visible');
            }
            accumulatedScroll = 0; // Reset after action
        }
        
        lastScroll = currentScroll;
    });
});
