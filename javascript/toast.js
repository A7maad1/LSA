// ============================================
// TOAST NOTIFICATION SYSTEM
// ============================================

class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type; // 'success', 'error', 'info', 'warning'
        this.duration = duration;
        this.init();
    }

    init() {
        // Get or create toast container
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        // Create toast element
        this.element = document.createElement('div');
        this.element.className = `toast toast-${this.type}`;
        this.element.setAttribute('role', 'alert');
        
        // Add icon based on type
        const icons = {
            'success': '✓',
            'error': '✕',
            'warning': '⚠',
            'info': 'ℹ'
        };

        this.element.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[this.type] || '•'}</span>
                <span class="toast-message">${this.escapeHtml(this.message)}</span>
            </div>
            <button class="toast-close" aria-label="Close notification">×</button>
        `;

        // Add close button functionality
        this.element.querySelector('.toast-close').addEventListener('click', () => {
            this.remove();
        });

        // Add to container
        container.appendChild(this.element);

        // Trigger animation
        setTimeout(() => {
            this.element.classList.add('show');
        }, 10);

        // Auto remove after duration
        if (this.duration > 0) {
            this.timeout = setTimeout(() => {
                this.remove();
            }, this.duration);
        }
    }

    remove() {
        if (!this.element) return;

        this.element.classList.remove('show');
        clearTimeout(this.timeout);

        setTimeout(() => {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Helper functions for easier usage
window.showToast = function(message, type = 'info', duration = 3000) {
    return new Toast(message, type, duration);
};

window.showSuccessToast = function(message, duration = 3000) {
    return new Toast(message, 'success', duration);
};

window.showErrorToast = function(message, duration = 4000) {
    return new Toast(message, 'error', duration);
};

window.showWarningToast = function(message, duration = 3500) {
    return new Toast(message, 'warning', duration);
};

window.showInfoToast = function(message, duration = 3000) {
    return new Toast(message, 'info', duration);
};
