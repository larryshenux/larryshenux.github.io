document.addEventListener('DOMContentLoaded', function() {
    // Core elements
    const navButton = document.getElementById('floatingNavBtn');
    const navOverlay = document.getElementById('navOverlay');
    const navMenu = document.getElementById('outlineMenu');
    const body = document.querySelector('body');
    
    if (!navButton || !navOverlay || !navMenu || !body) {
        console.error('Required navigation elements not found');
        return;
    }

    // Simple state
    let isMenuVisible = false; // Start with menu hidden
    let scrollSpyInstance;
    let lastActiveSection = null;
    let manuallyExpandedGroups = new Set();

    // Create observer for title and overview sections
    let isTitleVisible = true; // Start with title assumed visible
    let hasPassedOverview = false; // Track if we've passed the overview section
    
    const visibilityObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.target.id === 'title') {
                isTitleVisible = entry.isIntersecting;
            } else if (entry.target.id === 'overview') {
                // Once we see overview and it's intersecting, we've passed it
                if (entry.isIntersecting) {
                    hasPassedOverview = true;
                }
            }
            
            // Show menu if we've passed overview section AND title is not visible
            setMenuVisibility(hasPassedOverview && !isTitleVisible);
        });
    }, {
        threshold: [0, 0.2], // Track both entering and exiting
        rootMargin: '-10% 0px -10% 0px' // Add some margin to make transitions smoother
    });

    // Observe title and overview sections
    const titleSection = document.getElementById('title');
    const overviewSection = document.getElementById('overview');
    if (titleSection) visibilityObserver.observe(titleSection);
    if (overviewSection) visibilityObserver.observe(overviewSection);

    // Check initial scroll position
    function checkInitialScrollPosition() {
        if (!titleSection || !overviewSection) return;
        
        const titleRect = titleSection.getBoundingClientRect();
        const overviewRect = overviewSection.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // Check if title is not visible (above viewport)
        isTitleVisible = titleRect.top >= -titleRect.height && titleRect.bottom <= viewportHeight;
        
        // Check if we've passed overview (it's above the viewport or partially visible)
        hasPassedOverview = overviewRect.top <= viewportHeight * 0.5;
        
        // Update menu visibility based on initial position
        setMenuVisibility(hasPassedOverview && !isTitleVisible);
    }

    // Run initial check after a short delay to ensure accurate positions
    setTimeout(checkInitialScrollPosition, 100);

    function setMenuVisibility(show) {
        const isMobile = window.innerWidth < 992;

        requestAnimationFrame(() => {
            if (!isMobile) {
                // Desktop: Show/hide the menu directly
                isMenuVisible = show;
                navMenu.style.opacity = show ? '1' : '0';
                navMenu.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
                navMenu.style.pointerEvents = show ? 'auto' : 'none';
                navMenu.style.display = 'block';
                navOverlay.style.display = 'none';
            } else {
                // Mobile: Only control button visibility
                navButton.style.opacity = show ? '1' : '0';
                navButton.style.pointerEvents = show ? 'auto' : 'none';
                
                // Don't affect menu state if button is shown
                if (!show) {
                    isMenuVisible = false;
                    navMenu.style.display = 'none';
                    navOverlay.style.display = 'none';
                    body.classList.remove('no-scroll');
                }
            }
        });
    }

    // Initialize scrollspy with optimized settings
    function initScrollSpy() {
        // Dispose existing instance
        if (scrollSpyInstance && scrollSpyInstance.dispose) {
            scrollSpyInstance.dispose();
        }

        // Calculate offset
        const viewportHeight = window.innerHeight;
        const offset = Math.min(Math.max(viewportHeight * 0.2, 100), 150);

        // Initialize new instance
        scrollSpyInstance = new bootstrap.ScrollSpy(body, {
            target: '#outlineMenu',
            offset: offset,
            method: 'offset'
        });

        // Setup intersection observer for precise tracking
        const sections = document.querySelectorAll('h2[id], h3[id], h4[id]');
        const navLinks = navMenu.querySelectorAll('.nav-link');
        let visibleSections = new Map();
        let activeTimeout;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                visibleSections.set(entry.target.id, entry.intersectionRatio);
            });

            if (activeTimeout) clearTimeout(activeTimeout);
            activeTimeout = setTimeout(updateActiveSection, 100);
        }, {
            rootMargin: `-${offset}px 0px -${window.innerHeight - offset - 50}px 0px`,
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        sections.forEach(section => observer.observe(section));

        function updateActiveSection() {
            let maxRatio = 0;
            let currentSection = null;

            visibleSections.forEach((ratio, id) => {
                if (ratio > maxRatio) {
                    maxRatio = ratio;
                    currentSection = id;
                }
            });

            if (currentSection) {
                const targetLink = navMenu.querySelector(`[href="#${currentSection}"]`);
                if (targetLink && !targetLink.classList.contains('active')) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    targetLink.classList.add('active');
                    updateNavigation();
                }
            }
        }
    }

    // Initialize and refresh scrollspy
    initScrollSpy();
    window.addEventListener('load', initScrollSpy);
    window.addEventListener('resize', debounce(initScrollSpy, 100));

    // Navigation visibility and menu toggle
    function toggleMenu(show) {
        const menuShouldBeVisible = show !== undefined ? show : !isMenuVisible;
        
        // Only handle menu toggling, not button visibility
        isMenuVisible = menuShouldBeVisible;
        
        // Toggle menu display
        navMenu.style.display = 'block'; // Always keep in DOM for transitions
        navOverlay.style.display = menuShouldBeVisible ? 'block' : 'none';
        body.classList.toggle('no-scroll', menuShouldBeVisible);
        
        requestAnimationFrame(() => {
            navMenu.style.opacity = menuShouldBeVisible ? '1' : '0';
            navMenu.style.pointerEvents = menuShouldBeVisible ? 'auto' : 'none';
            navMenu.style.transform = menuShouldBeVisible ? 'translateX(0)' : 'translateX(20px)';
            
            // Hide menu from DOM only after transition
            if (!menuShouldBeVisible) {
                setTimeout(() => {
                    if (!isMenuVisible) { // Double check state hasn't changed
                        navMenu.style.display = 'none';
                    }
                }, 300); // Match transition duration
            }
        });
    }

    // Handle navigation updates
    function updateNavigation() {
        const activeLinks = navMenu.querySelectorAll('.nav-link.active');
        const hasActiveItems = activeLinks.length > 0;
        
        if (window.innerWidth < 992) {
            navButton.style.opacity = hasActiveItems ? '1' : '0';
            navButton.style.pointerEvents = hasActiveItems ? 'auto' : 'none';
            navMenu.classList.toggle('visible', isMenuVisible && hasActiveItems);
        } else {
            isMenuVisible = true;
            navMenu.style.display = 'block';
            navMenu.classList.toggle('visible', hasActiveItems);
        }

        if (!hasActiveItems) return;

        const currentActiveLink = activeLinks[activeLinks.length - 1];
        
        // Only update the active link styles, don't auto-expand dropdowns
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            if (link === currentActiveLink) {
                link.classList.add('active');
            } else if (!manuallyExpandedGroups.has(link.closest('.nav-group'))) {
                link.classList.remove('active');
            }
        });
    }

    // Dropdown handling - simplified for manual control only
    function toggleDropdown(group, expand) {
        if (!group) return;

        const isExpanded = expand !== undefined ? expand : !group.classList.contains('expanded');
        group.classList.toggle('expanded', isExpanded);

        const toggle = group.querySelector('.has-children');
        if (toggle) toggle.classList.toggle('expanded', isExpanded);

        if (isExpanded) {
            manuallyExpandedGroups.add(group);
            // Close sibling dropdowns at the same level
            const sectionLevel = group.getAttribute('data-section-level');
            const siblings = navMenu.querySelectorAll(`.nav-group[data-section-level="${sectionLevel}"]`);
            siblings.forEach(sibling => {
                if (sibling !== group) {
                    sibling.classList.remove('expanded');
                    const siblingToggle = sibling.querySelector('.has-children');
                    if (siblingToggle) siblingToggle.classList.remove('expanded');
                    manuallyExpandedGroups.delete(sibling);
                }
            });
        } else {
            manuallyExpandedGroups.delete(group);
            // Close nested dropdowns when closing
            group.querySelectorAll('.nav-group').forEach(nested => {
                nested.classList.remove('expanded');
                const nestedToggle = nested.querySelector('.has-children');
                if (nestedToggle) nestedToggle.classList.remove('expanded');
                manuallyExpandedGroups.delete(nested);
            });
        }
    }

    // Event Listeners
    let isClickProcessing = false;
    navButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double-clicks and race conditions
        if (isClickProcessing) return;
        isClickProcessing = true;
        
        toggleMenu();
        
        // Reset after transition
        setTimeout(() => {
            isClickProcessing = false;
        }, 300);
    });

    navOverlay.addEventListener('click', () => toggleMenu(false));

    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navButton.contains(e.target)) {
            if (window.innerWidth < 992) toggleMenu(false);
        }
    });

    navMenu.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        if (link.classList.contains('has-children')) {
            e.preventDefault();
            e.stopPropagation();
            
            const navGroup = link.closest('.nav-group');
            if (!navGroup) return;

            toggleDropdown(navGroup, undefined, true);
        } else if (window.innerWidth < 992) {
            toggleMenu(false);
        }
    });

    // Debounce helper
    function debounce(fn, delay) {
        let timeoutId;
        return function(...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // Set initial state
    if (window.innerWidth >= 992) {
        navMenu.style.display = 'block';
        navMenu.style.opacity = '1';
        navMenu.style.pointerEvents = 'auto';
    }

    updateNavigation();
});
