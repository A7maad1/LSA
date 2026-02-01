// ============================================
// ACCESSIBILITY IMPROVEMENTS MODULE
// ============================================

/**
 * This module enhances accessibility of the site for users with disabilities
 * Includes: ARIA labels, keyboard navigation, screen reader support, color contrast
 */

class AccessibilityManager {
    static init() {
        this.addAriaLabels();
        this.improveKeyboardNavigation();
        // this.addSkipLink(); // Disabled - skip link removed
        this.improveFormAccessibility();
        this.addLiveRegions();
        this.improveColorContrast();
        console.log('Accessibility features initialized');
    }

    /**
     * Add descriptive ARIA labels throughout the site
     */
    static addAriaLabels() {
        // Images should have alt text (checked in HTML)
        // Buttons should have aria-label or visible text
        // Links should be descriptive
        
        // Gallery items
        document.querySelectorAll('.gallery-item').forEach((item, index) => {
            if (!item.getAttribute('aria-label')) {
                item.setAttribute('aria-label', `صورة معرض ${index + 1}`);
            }
        });

        // Form inputs
        document.querySelectorAll('input[type="search"], input[type="text"]').forEach(input => {
            if (!input.getAttribute('aria-label') && input.placeholder) {
                input.setAttribute('aria-label', input.placeholder);
            }
        });

        // Navigation menu
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            navMenu.setAttribute('role', 'navigation');
            navMenu.setAttribute('aria-label', 'القائمة الرئيسية');
        }

        // Forms
        document.querySelectorAll('form').forEach(form => {
            if (!form.getAttribute('aria-label')) {
                form.setAttribute('aria-label', 'نموذج');
            }
        });
    }

    /**
     * Improve keyboard navigation
     */
    static improveKeyboardNavigation() {
        // Make interactive elements focusable
        document.querySelectorAll('[role="button"]').forEach(btn => {
            if (btn.tagName !== 'BUTTON' && btn.tagName !== 'A') {
                btn.setAttribute('tabindex', '0');
            }
        });

        // Add focus visible styles
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });

        // Trap focus in modals
        this.trapFocusInModals();
    }

    /**
     * Trap focus inside modal dialogs
     */
    static trapFocusInModals() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.lightbox-overlay.active, .confirm-dialog.active');
                if (modal) {
                    const focusableElements = modal.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    );
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
            }
        });
    }

    /**
     * Add skip to main content link
     */
    static addSkipLink() {
        if (document.querySelector('.skip-to-main')) return;

        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-to-main';
        skipLink.textContent = 'انتقل إلى المحتوى الرئيسي';
        skipLink.setAttribute('aria-label', 'انتقل إلى المحتوى الرئيسي');

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Mark main content
        const main = document.querySelector('main');
        if (main) {
            main.id = 'main-content';
            main.setAttribute('role', 'main');
        }
    }

    /**
     * Improve form accessibility
     */
    static improveFormAccessibility() {
        document.querySelectorAll('form').forEach(form => {
            // Connect labels with inputs
            form.querySelectorAll('label').forEach(label => {
                if (!label.getAttribute('for')) {
                    const input = label.nextElementSibling;
                    if (input && !input.id) {
                        input.id = 'input-' + Math.random().toString(36).substr(2, 9);
                    }
                    if (input && input.id) {
                        label.setAttribute('for', input.id);
                    }
                }
            });

            // Add error messages
            form.querySelectorAll('[required]').forEach(field => {
                field.addEventListener('invalid', (e) => {
                    e.preventDefault();
                    field.setAttribute('aria-invalid', 'true');
                    const error = field.nextElementSibling;
                    if (error && error.classList.contains('error-message')) {
                        error.setAttribute('role', 'alert');
                    }
                });

                field.addEventListener('input', () => {
                    if (field.checkValidity()) {
                        field.setAttribute('aria-invalid', 'false');
                    }
                });
            });
        });
    }

    /**
     * Add live regions for dynamic content updates
     */
    static addLiveRegions() {
        // Create live region for messages
        if (!document.querySelector('[aria-live="polite"]')) {
            const liveRegion = document.createElement('div');
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            liveRegion.id = 'live-region';
            document.body.appendChild(liveRegion);
        }
    }

    /**
     * Announce messages to screen readers
     */
    static announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    /**
     * Ensure sufficient color contrast
     */
    static improveColorContrast() {
        // Add high contrast mode support
        if (window.matchMedia('(prefers-contrast: more)').matches) {
            document.body.classList.add('high-contrast');
        }

        // Listen for contrast preference changes
        window.matchMedia('(prefers-contrast: more)').addEventListener('change', (e) => {
            if (e.matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        });
    }

    /**
     * Respect user's reduced motion preference
     */
    static respectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.scrollBehavior = 'auto';
            document.querySelectorAll('*').forEach(el => {
                el.style.animationDuration = '0.01ms !important';
                el.style.animationIterationCount = '1 !important';
                el.style.transitionDuration = '0.01ms !important';
            });
        }
    }

    /**
     * Improve text readability
     */
    static improveReadability() {
        // Ensure sufficient font size (minimum 12px)
        // Ensure sufficient line height (minimum 1.5)
        // These should be set in CSS, but this validates

        document.querySelectorAll('body, p, span, div').forEach(el => {
            const fontSize = window.getComputedStyle(el).fontSize;
            const lineHeight = window.getComputedStyle(el).lineHeight;

            if (fontSize < '12px') {
                console.warn('Font size too small:', fontSize, el);
            }
        });
    }

    /**
     * Add text size adjustment controls
     */
    static addTextSizeControls() {
        if (document.querySelector('.text-size-controls')) return;

        const controls = document.createElement('div');
        controls.className = 'text-size-controls';
        controls.setAttribute('aria-label', 'أدوات تحديد حجم النص');
        controls.innerHTML = `
            <button id="text-size-decrease" aria-label="تقليل حجم النص">ا</button>
            <button id="text-size-reset" aria-label="إعادة تعيين حجم النص">ا</button>
            <button id="text-size-increase" aria-label="زيادة حجم النص">ا</button>
        `;

        document.body.appendChild(controls);

        let currentSize = 100;

        document.getElementById('text-size-decrease').addEventListener('click', () => {
            currentSize = Math.max(80, currentSize - 10);
            document.documentElement.style.fontSize = (currentSize / 100 * 16) + 'px';
            this.announce(`حجم النص: ${currentSize}%`);
        });

        document.getElementById('text-size-reset').addEventListener('click', () => {
            currentSize = 100;
            document.documentElement.style.fontSize = '16px';
            this.announce('تم إعادة تعيين حجم النص');
        });

        document.getElementById('text-size-increase').addEventListener('click', () => {
            currentSize = Math.min(150, currentSize + 10);
            document.documentElement.style.fontSize = (currentSize / 100 * 16) + 'px';
            this.announce(`حجم النص: ${currentSize}%`);
        });
    }
}

// CSS for accessibility improvements
const accessibilityCss = `
    .skip-to-main {
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--primary-blue);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 100;
    }

    .skip-to-main:focus {
        top: 0;
    }

    body.keyboard-nav *:focus {
        outline: 2px solid var(--primary-blue);
        outline-offset: 2px;
    }

    body.high-contrast {
        --primary-blue: #0000ff;
        --primary-green: #008000;
        --dark-gray: #000000;
        --text-color: #000000;
    }

    .text-size-controls {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: white;
        border: 2px solid var(--primary-blue);
        border-radius: 8px;
        padding: 10px;
        display: flex;
        gap: 5px;
        z-index: 999;
    }

    .text-size-controls button {
        width: 36px;
        height: 36px;
        border: 1px solid var(--primary-blue);
        background: white;
        color: var(--primary-blue);
        cursor: pointer;
        border-radius: 4px;
        font-weight: bold;
        font-size: 16px;
    }

    .text-size-controls button:hover,
    .text-size-controls button:focus {
        background: var(--primary-blue);
        color: white;
    }
`;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AccessibilityManager.init();
    AccessibilityManager.respectReducedMotion();
    AccessibilityManager.improveReadability();
    
    // Uncomment to add text size controls
    // AccessibilityManager.addTextSizeControls();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
