/*
 * Project: Krish Goyal Personal Portfolio
 * File: script.js
 * Description: Contains all JavaScript for interactive elements, animations,
 *              and dynamic behavior across the multi-page portfolio.
 */

// Define the base URL for your Flask API
const BASE_API_URL = 'https://portfolio-backend-0biq.onrender.com/api'; // Adjust if your Flask server runs on a different host/port

document.addEventListener('DOMContentLoaded', () => {
    // Add a class to body once JS is loaded, useful for CSS to prevent flicker
    document.body.classList.add('js-loaded');

    // Initialize AOS (Animate On Scroll) library
    AOS.init({
        duration: 1000,
        easing: 'ease-out-quad',
        once: true, // Only animate once
        mirror: false, // Do not repeat animations on scroll back
        offset: 100, // Offset (in px) from the top of the browser to trigger animations
    });

    // --- Preloader Functionality ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        // Ensure preloader hides after load (or a short timeout if 'load' is delayed)
        window.addEventListener('load', () => {
            preloader.classList.add('hidden');
            document.body.style.overflow = ''; // Re-enable scrolling after preloader
        });
        // Set a fallback timeout in case the 'load' event doesn't fire as expected
        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                preloader.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 3000); // Hide preloader after 3 seconds forcefully if needed
        document.body.style.overflow = 'hidden'; // Disable scrolling during preloader
    }

    // --- Page Transition Overlay ---
    const pageTransitionOverlay = document.getElementById('page-transition-overlay');

    /**
     * Handles smooth page transitions by fading out current content and then navigating.
     * @param {string} url - The URL to navigate to.
     */
    function smoothPageTransition(url) {
        if (pageTransitionOverlay) {
            pageTransitionOverlay.classList.add('active');
            setTimeout(() => {
                window.location.href = url;
            }, 500); // Match this duration with the CSS transition speed for overlay
        } else {
            window.location.href = url; // Fallback if overlay is not found
        }
    }

    // Apply smooth transitions to all internal links
    document.querySelectorAll('a[href^="./"], a[href^="../"], a[href^="#"], a[href^="index.html"], a[href^="about.html"], a[href^="projects.html"], a[href^="resume.html"], a[href^="contact.html"], a[href^="notifications.html"], a[href^="admin.html"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        // Exclude external links, download links, mailto links, and the admin login trigger
        if (anchor.hasAttribute('download') || anchor.getAttribute('target') === '_blank' || href.startsWith('mailto:') || anchor.id === 'adminLoginTrigger') {
            return;
        }

        anchor.addEventListener('click', function(e) {
            const currentPath = window.location.pathname.split('/').pop() || 'index.html';
            const targetPath = href.split('/').pop().split('#')[0] || 'index.html';
            const targetHash = href.includes('#') ? '#' + href.split('#')[1] : '';

            // If it's a hash link on the *same* page, let default smooth scroll handle it
            if (currentPath === targetPath && targetHash) {
                // Ensure the hash scroll is smooth if not already
                e.preventDefault();
                const targetElement = document.querySelector(targetHash);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (currentPath !== targetPath || !targetHash) {
                // For navigating to a different page or a root of another page
                e.preventDefault();
                smoothPageTransition(href);
            }
        });
    });


    // On page load or navigation (pageshow event)
    window.addEventListener('pageshow', (event) => {
        if (pageTransitionOverlay) {
            // If the page is loaded from bfcache (back/forward navigation) or a fresh load
            pageTransitionOverlay.classList.remove('active');
        }
        // Re-initialize AOS on pageshow for cached pages if needed (AOS already handles this normally)
        AOS.refresh();
        // Set active nav link
        setActiveNavLink();
        updateNotificationCountBadge(); // Ensure badge is updated on pageshow
    });

    // --- Custom Cursor ---
    const customCursor = document.querySelector('.custom-cursor');
    const customCursorFollower = document.querySelector('.custom-cursor-follower');

    if (customCursor && customCursorFollower) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            customCursor.style.left = `${mouseX}px`;
            customCursor.style.top = `${mouseY}px`;
        });

        function animateFollower() {
            const delay = 0.1; // Lower value for faster follow
            followerX += (mouseX - followerX) * delay;
            followerY += (mouseY - followerY) * delay;

            customCursorFollower.style.left = `${followerX}px`;
            customCursorFollower.style.top = `${followerY}px`;

            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Cursor hover effects
        const hoverTargets = 'a, button, .nav-item, .project-card, .skill-badge, .glowing-social-icon, .profile-photo, input, textarea, select, .hamburger, .notification-card'; // Added .hamburger, .notification-card, and select
        document.querySelectorAll(hoverTargets).forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.classList.add('link-hover');
                customCursorFollower.classList.add('link-hover');
                if (el.tagName === 'BUTTON' || el.classList.contains('btn') || el.classList.contains('hamburger')) {
                    customCursor.classList.add('button-hover');
                    customCursorFollower.classList.add('button-hover');
                }
            });
            el.addEventListener('mouseleave', () => {
                customCursor.classList.remove('link-hover', 'button-hover');
                customCursorFollower.classList.remove('link-hover', 'button-hover');
            });
        });
    }

    // --- Navbar Scroll Effect ---
    const mainHeader = document.querySelector('.main-header');
    if (mainHeader) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        });
    }

    // --- Mobile Navigation (Hamburger) ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.parentNode.classList.toggle('active'); // Toggle class on parent navbar for hamburger animation
        });

        // Close nav when a link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.parentNode.classList.remove('active');
            });
        });
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- Typing Animation (Typewriter.js) ---
    /**
     * Initializes the Typewriter effect on specified elements.
     * Looks for elements with `class="typewriter-text"` and `data-type-strings` attribute.
     */
    function initializeTypewriter() {
        document.querySelectorAll('.typewriter-text').forEach(element => {
            const strings = JSON.parse(element.dataset.typeStrings);
            
            let typewriterInstance = new Typewriter(element, {
                loop: true,
                delay: 75,
                deleteSpeed: 40,
            });

            strings.forEach(str => {
                typewriterInstance = typewriterInstance
                    .typeString(str)
                    .pauseFor(1500)
                    .deleteAll();
            });

            typewriterInstance.start();
        });
    }
    initializeTypewriter();

    // --- Button Ripple Effect ---
    document.querySelectorAll('.ripple-effect').forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            ripple.addEventListener('animationend', () => {
                ripple.remove();
            });
        });
    });


    // --- Active Navbar Link on Load ---
    /**
     * Sets the 'active' class on the current page's navigation link.
     */
    function setActiveNavLink() {
        const path = window.location.pathname.split('/').pop() || 'index.html'; // Get filename, default to index.html
        document.querySelectorAll('.nav-links .nav-item').forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href').split('/').pop().split('#')[0] || 'index.html'; // Remove hash from link href
            if (path === linkPath) {
                link.classList.add('active');
            }
        });
    }
    setActiveNavLink();

    // --- Notification Count Badge on Navbar ---
    /**
     * Updates the notification count badge next to the "Updates" nav item.
     * The badge shows the number of new notifications based on 'newUpdatesCounter' in localStorage.
     * This counter is incremented when admin adds a new notification and reset to 0 when
     * the 'notifications.html' page is visited.
     */
    window.updateNotificationCountBadge = function() { // Made global for admin.html to access
        const notificationsLink = document.querySelector('a[href="notifications.html"]');
        if (!notificationsLink) return;

        const newUpdatesCount = parseInt(localStorage.getItem('newUpdatesCounter') || '0');

        let badge = notificationsLink.querySelector('.notification-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.classList.add('notification-badge');
            notificationsLink.appendChild(badge);
        }

        if (newUpdatesCount > 0) {
            badge.textContent = newUpdatesCount;
            badge.style.display = 'inline-flex'; // Use flex for centering
            badge.classList.add('pulse-badge'); // Add pulse animation
        } else {
            badge.textContent = '';
            badge.style.display = 'none';
            badge.classList.remove('pulse-badge');
        }
    }
    updateNotificationCountBadge(); // Initial call on page load

    // --- Admin Panel Login Trigger ---
    const adminLoginTrigger = document.getElementById('adminLoginTrigger');

    if (adminLoginTrigger) {
        adminLoginTrigger.addEventListener('click', (e) => {
            e.preventDefault();

            // Check if already logged in (for a persistent session, using sessionStorage)
            if (sessionStorage.getItem('isAdmin') === 'true') {
                smoothPageTransition('admin.html');
                return;
            }

            // Create login modal elements
            const modalOverlay = document.createElement('div');
            modalOverlay.classList.add('login-modal-overlay');

            const modalContent = document.createElement('div');
            modalContent.classList.add('login-modal-content', 'glowing-border', 'glassmorphism');

            modalContent.innerHTML = `
                <button class="close-modal-btn"><i class="fas fa-times"></i></button>
                <h3>Admin Login</h3>
                <form id="adminLoginForm" class="login-form">
                    <div class="form-group">
                        <label for="adminUsername">Username</label>
                        <input type="text" id="adminUsername" name="adminUsername" required autocomplete="username">
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" name="adminPassword" required autocomplete="current-password">
                    </div>
                    <p id="loginError" class="login-error-message"></p>
                    <button type="submit" class="btn btn-primary animate-btn ripple-effect">Login</button>
                </form>
                <p class="security-note">
                    <i class="fas fa-exclamation-triangle"></i> Note: This is a frontend-only demonstration with hardcoded credentials and no backend. Not secure for production.
                </p>
            `;

            document.body.appendChild(modalOverlay);
            modalOverlay.appendChild(modalContent);

            // Show modal
            setTimeout(() => {
                modalOverlay.classList.add('show');
                modalContent.classList.add('show');
            }, 10); // Small delay to allow CSS transition

            // Close modal functionality
            const closeModal = () => {
                modalOverlay.classList.remove('show');
                modalContent.classList.remove('show');
                setTimeout(() => {
                    modalOverlay.remove();
                }, 300); // Match CSS transition duration
            };
            modalOverlay.querySelector('.close-modal-btn').addEventListener('click', closeModal);
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            });

            // Handle login form submission
            const adminLoginForm = modalContent.querySelector('#adminLoginForm');
            const loginError = modalContent.querySelector('#loginError');

            adminLoginForm.addEventListener('submit', async (formEvent) => {
                formEvent.preventDefault();
                const username = adminLoginForm.adminUsername.value;
                const password = adminLoginForm.adminPassword.value;

                loginError.textContent = ''; // Clear previous errors

                try {
                    const response = await fetch(`${BASE_API_URL}/admin/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (response.ok) { // Check for 2xx status code
                        sessionStorage.setItem('isAdmin', 'true'); // Store login status
                        closeModal();
                        smoothPageTransition('admin.html'); // Redirect to admin panel
                    } else {
                        loginError.textContent = data.message || 'Login failed. Please try again.';
                    }
                } catch (error) {
                    console.error('Login request failed:', error);
                    loginError.textContent = 'Network error or server unavailable.';
                }
            });
        });
    }
});
