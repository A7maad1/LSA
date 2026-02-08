/**
 * NAVBAR.JS - Handles mobile menu toggle and navigation behavior
 */

document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');

    if (menuToggle && navMenu) {
        // Toggle menu on button click
        menuToggle.addEventListener('click', function (e) {
            e.stopPropagation();
            navMenu.classList.toggle('show');
            const isExpanded = navMenu.classList.contains('show');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });

        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (navbar && !navbar.contains(e.target) && navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
