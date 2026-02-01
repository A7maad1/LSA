/* ============================================
   MODERN UI COMPONENTS & ENHANCEMENTS
   ============================================ */

// ============================================
// NOTIFICATION CENTER
// ============================================

class NotificationCenter {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 5;
        this.createContainer();
    }
    
    createContainer() {
        if (!document.getElementById('notificationCenter')) {
            const container = document.createElement('div');
            container.id = 'notificationCenter';
            container.className = 'notification-center';
            document.body.appendChild(container);
        }
    }
    
    notify(title, message, type = 'info', duration = 5000) {
        const id = 'notification-' + Date.now();
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.id = id;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="document.getElementById('${id}').remove()">✕</button>
        `;
        
        const container = document.getElementById('notificationCenter');
        container.appendChild(notification);
        
        if (this.notifications.length >= this.maxNotifications) {
            const oldest = this.notifications.shift();
            oldest.remove();
        }
        
        this.notifications.push(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                    this.notifications = this.notifications.filter(n => n !== notification);
                }
            }, duration);
        }
        
        return notification;
    }
}

// Initialize global notification center
const notificationCenter = new NotificationCenter();

// ============================================
// MODAL DIALOG WITH ANIMATIONS
// ============================================

class Modal {
    static show(title, content, buttons = []) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            
            const btnHtml = buttons.map(btn => `
                <button class="btn btn-${btn.type || 'secondary'}" data-action="${btn.action}">
                    ${btn.label}
                </button>
            `).join('');
            
            modal.innerHTML = `
                <div class="modal-box">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${btnHtml}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Handle button clicks
            modal.querySelectorAll('[data-action]').forEach(btn => {
                btn.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    modal.remove();
                    resolve(action);
                });
            });
            
            // Close on backdrop click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(null);
                }
            });
        });
    }
    
    static confirm(title, message) {
        return this.show(title, `<p>${message}</p>`, [
            { label: 'إلغاء', type: 'secondary', action: 'cancel' },
            { label: 'تأكيد', type: 'primary', action: 'confirm' }
        ]).then(action => action === 'confirm');
    }
    
    static alert(title, message) {
        return this.show(title, `<p>${message}</p>`, [
            { label: 'حسناً', type: 'primary', action: 'ok' }
        ]);
    }
}

// ============================================
// PROGRESS TRACKER
// ============================================

class ProgressTracker {
    constructor(container, initialValue = 0, max = 100) {
        this.container = document.querySelector(container);
        this.value = initialValue;
        this.max = max;
        this.render();
    }
    
    render() {
        if (!this.container) return;
        
        const percentage = (this.value / this.max) * 100;
        
        if (!this.container.querySelector('.progress-bar')) {
            this.container.innerHTML = `
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text">
                        <span class="progress-value">0%</span>
                    </div>
                </div>
            `;
        }
        
        const fill = this.container.querySelector('.progress-bar-fill');
        const text = this.container.querySelector('.progress-value');
        
        fill.style.width = percentage + '%';
        text.textContent = Math.round(percentage) + '%';
    }
    
    update(value) {
        this.value = Math.min(value, this.max);
        this.render();
    }
    
    increment(amount = 1) {
        this.update(this.value + amount);
    }
    
    complete() {
        this.update(this.max);
    }
}

// ============================================
// SEARCH & FILTER COMPONENT
// ============================================

class SearchFilter {
    constructor(containerSelector, dataArray, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.dataArray = dataArray;
        this.filteredData = [...dataArray];
        this.searchFields = options.searchFields || [];
        this.filterFields = options.filterFields || {};
        this.onFilterChange = options.onFilterChange || (() => {});
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.attachListeners();
    }
    
    createUI() {
        const searchHTML = `
            <div class="search-filter-container">
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="ابحث...">
                    <span class="search-icon">🔍</span>
                </div>
                <div class="filter-options">
                    ${Object.entries(this.filterFields).map(([key, options]) => `
                        <select class="filter-select" data-filter="${key}">
                            <option value="">جميع ${key}</option>
                            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                        </select>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforebegin', searchHTML);
        this.searchContainer = this.container.previousElementSibling;
    }
    
    attachListeners() {
        // Search input
        const searchInput = this.searchContainer.querySelector('.search-input');
        searchInput?.addEventListener('input', (e) => this.performSearch(e.target.value));
        
        // Filter selects
        this.searchContainer.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => this.applyFilters());
        });
    }
    
    performSearch(query) {
        if (!query.trim()) {
            this.filteredData = [...this.dataArray];
        } else {
            this.filteredData = this.dataArray.filter(item => {
                return this.searchFields.some(field => {
                    const value = this.getNestedValue(item, field);
                    return value && value.toString().includes(query);
                });
            });
        }
        
        this.applyFilters();
    }
    
    applyFilters() {
        // Apply additional filters
        this.searchContainer.querySelectorAll('.filter-select').forEach(select => {
            const filterKey = select.getAttribute('data-filter');
            const filterValue = select.value;
            
            if (filterValue) {
                this.filteredData = this.filteredData.filter(item => {
                    return this.getNestedValue(item, filterKey) === filterValue;
                });
            }
        });
        
        this.onFilterChange(this.filteredData);
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    }
}

// ============================================
// PAGINATION COMPONENT
// ============================================

class Pagination {
    constructor(containerSelector, totalItems, itemsPerPage = 10) {
        this.container = document.querySelector(containerSelector);
        this.totalItems = totalItems;
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.totalPages = Math.ceil(totalItems / itemsPerPage);
        this.onPageChange = () => {};
        
        this.render();
    }
    
    render() {
        if (this.totalPages <= 1) return;
        
        const html = `
            <nav class="pagination">
                <button class="pagination-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev">
                    ← السابق
                </button>
                
                <div class="pagination-pages">
                    ${this.getPageNumbers().map(page => `
                        <button class="pagination-number ${page === this.currentPage ? 'active' : ''}" 
                                data-page="${page}">
                            ${page}
                        </button>
                    `).join('')}
                </div>
                
                <button class="pagination-btn" ${this.currentPage === this.totalPages ? 'disabled' : ''} data-page="next">
                    التالي →
                </button>
                
                <span class="pagination-info">
                    الصفحة ${this.currentPage} من ${this.totalPages}
                </span>
            </nav>
        `;
        
        this.container.innerHTML = html;
        
        // Attach listeners
        this.container.querySelectorAll('[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => this.goToPage(e.target.dataset.page));
        });
    }
    
    getPageNumbers() {
        const pages = [];
        const maxVisible = 5;
        
        if (this.totalPages <= maxVisible) {
            for (let i = 1; i <= this.totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            
            const start = Math.max(2, this.currentPage - 1);
            const end = Math.min(this.totalPages - 1, this.currentPage + 1);
            
            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < this.totalPages - 1) pages.push('...');
            
            pages.push(this.totalPages);
        }
        
        return pages;
    }
    
    goToPage(page) {
        if (page === 'prev') {
            if (this.currentPage > 1) this.currentPage--;
        } else if (page === 'next') {
            if (this.currentPage < this.totalPages) this.currentPage++;
        } else if (page !== '...') {
            this.currentPage = parseInt(page);
        }
        
        this.render();
        this.onPageChange(this.currentPage);
    }
}

// ============================================
// TABS COMPONENT
// ============================================

class Tabs {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.activeTab = null;
        this.init();
    }
    
    init() {
        const tabs = this.container.querySelectorAll('[data-tab]');
        const contents = this.container.querySelectorAll('[data-tab-content]');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab, tabs, contents);
            });
        });
        
        // Activate first tab
        if (tabs.length > 0) {
            this.switchTab(tabs[0].dataset.tab, tabs, contents);
        }
    }
    
    switchTab(tabName, tabs, contents) {
        // Deactivate all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));
        
        // Activate selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-tab-content="${tabName}"]`).classList.add('active');
        
        this.activeTab = tabName;
    }
}

// ============================================
// TOGGLE & COLLAPSE COMPONENTS
// ============================================

class Collapsible {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.init();
    }
    
    init() {
        const triggers = this.container.querySelectorAll('[data-collapse-trigger]');
        
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                const targetId = trigger.dataset.collapseTrigger;
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.classList.toggle('collapsed');
                    trigger.classList.toggle('active');
                }
            });
        });
    }
}

// ============================================
// TOAST NOTIFICATION ENHANCED
// ============================================

class Toast {
    constructor(message, type = 'info', duration = 3000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.show();
    }
    
    show() {
        const toast = document.createElement('div');
        toast.className = `toast toast-${this.type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getIcon()}</span>
                <span class="toast-message">${this.message}</span>
            </div>
            <button class="toast-close" onclick="this.closest('.toast').remove()">✕</button>
        `;
        
        document.body.appendChild(toast);
        
        if (this.duration > 0) {
            setTimeout(() => {
                toast.classList.add('fade-out');
                setTimeout(() => toast.remove(), 300);
            }, this.duration);
        }
        
        return toast;
    }
    
    getIcon() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[this.type] || icons.info;
    }
}

// ============================================
// EXPORT UTILITIES
// ============================================

class DataExport {
    static toCSV(data, filename = 'export.csv') {
        const headers = Object.keys(data[0]);
        const rows = data.map(item => 
            headers.map(header => this.escapeCSV(item[header])).join(',')
        );
        
        const csv = [headers.join(','), ...rows].join('\n');
        this.download(csv, filename, 'text/csv');
    }
    
    static toJSON(data, filename = 'export.json') {
        const json = JSON.stringify(data, null, 2);
        this.download(json, filename, 'application/json');
    }
    
    static download(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    static escapeCSV(value) {
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
    }
}

