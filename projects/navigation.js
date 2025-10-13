document.addEventListener('DOMContentLoaded', function() {
    const navButton = document.getElementById('floatingNavBtn');
    const navOverlay = document.getElementById('navOverlay');
    const navMenu = document.getElementById('outlineMenu');
    let isAnyActive = false;

    // Function to check if any nav item is active
    function checkActiveNavItems() {
        const activeItems = navMenu.querySelectorAll('.nav-link.active');
        isAnyActive = activeItems.length > 0;
        updateNavigationVisibility();
    }
    
    // Function to update visibility of navigation elements
    function updateNavigationVisibility() {
        const isMobile = window.innerWidth < 992;
        navButton.style.opacity = isAnyActive ? '1' : '0';
        navButton.style.pointerEvents = isAnyActive ? 'auto' : 'none';
        
        if (!isMobile) {
            navMenu.style.opacity = isAnyActive ? '1' : '0';
            navMenu.style.pointerEvents = isAnyActive ? 'auto' : 'none';
        }
    }
    
    function toggleMenu() {
        const isVisible = navMenu.style.display === 'block';
        navMenu.style.display = isVisible ? 'none' : 'block';
        navMenu.style.opacity = isVisible ? '0' : '1';
        navOverlay.style.display = isVisible ? 'none' : 'block';
    }
    
    // Toggle menu when button is clicked
    navButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking overlay
    navOverlay.addEventListener('click', toggleMenu);
    
    // Close menu when clicking a nav link (mobile only)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) { // mobile breakpoint
                toggleMenu();
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 992) {
            navMenu.style.display = 'block';
            navOverlay.style.display = 'none';
        } else {
            navMenu.style.display = 'none';
            navOverlay.style.display = 'none';
        }
        updateNavigationVisibility();
    });

    // Watch for scrollspy updates
    document.addEventListener('scroll', function() {
        checkActiveNavItems();
    });

    // Initial check
    checkActiveNavItems();
});
