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
    let isMenuVisible = window.innerWidth >= 992;
    let scrollSpyInstance;
    let lastActiveSection = null;
    let manuallyExpandedGroups = new Set();

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
        const isMobile = window.innerWidth < 992;
        isMenuVisible = show !== undefined ? show : !isMenuVisible;

        if (isMobile) {
            navMenu.style.display = isMenuVisible ? 'block' : 'none';
            navOverlay.style.display = isMenuVisible ? 'block' : 'none';
            body.classList.toggle('no-scroll', isMenuVisible);
        } else {
            navMenu.style.display = 'block';
            navOverlay.style.display = 'none';
            body.classList.remove('no-scroll');
        }

        requestAnimationFrame(() => {
            navMenu.style.opacity = isMenuVisible ? '1' : '0';
            navMenu.style.pointerEvents = isMenuVisible ? 'auto' : 'none';
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
        const currentTopLevelSection = currentActiveLink.closest('.nav-group[data-section-level="1"]');

        // Handle section transitions
        if (currentTopLevelSection !== lastActiveSection) {
            if (lastActiveSection && !currentTopLevelSection?.contains(lastActiveSection)) {
                const oldGroups = lastActiveSection.querySelectorAll('.nav-group.expanded');
                oldGroups.forEach(group => {
                    if (!currentActiveLink.closest('.nav-group')?.contains(group) &&
                        !manuallyExpandedGroups.has(group)) {
                        toggleDropdown(group, false);
                    }
                });
            }
            lastActiveSection = currentTopLevelSection;
        }

        // Expand dropdowns in active path
        let currentGroup = currentActiveLink.closest('.nav-group');
        while (currentGroup) {
            toggleDropdown(currentGroup, true);
            currentGroup = currentGroup.parentElement.closest('.nav-group');
        }
    }

    // Dropdown handling
    function toggleDropdown(group, expand, isManual = false) {
        if (!group) return;

        const isExpanded = expand !== undefined ? expand : !group.classList.contains('expanded');
        group.classList.toggle('expanded', isExpanded);

        const toggle = group.querySelector('.has-children');
        if (toggle) toggle.classList.toggle('expanded', isExpanded);

        if (isManual) {
            if (isExpanded) {
                manuallyExpandedGroups.add(group);
            } else {
                manuallyExpandedGroups.delete(group);
                // Close nested dropdowns when manually closing
                group.querySelectorAll('.nav-group').forEach(nested => {
                    manuallyExpandedGroups.delete(nested);
                    toggleDropdown(nested, false);
                });
            }
        }

        // Only close nested dropdowns when closing automatically
        if (!isExpanded && !isManual) {
            group.querySelectorAll('.nav-group').forEach(nested => {
                if (!manuallyExpandedGroups.has(nested)) {
                    toggleDropdown(nested, false);
                }
            });
        }
    }

    // Event Listeners
    navButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
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
