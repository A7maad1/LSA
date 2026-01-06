// ============================================
// APP.JS - HOME PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    // Load latest activities
    loadLatestActivities();
    
    // Load latest announcements
    loadLatestAnnouncements();
    
    // Setup navigation
    setupNavigation();
    
    // Setup CTA button
    setupCTAButton();
}

// ============================================
// LOAD ACTIVITIES
// ============================================

function showActivitySkeleton(container) {
    container.innerHTML = Array(4).fill(0).map(() => `
        <div class="activity-card skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="activity-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 70%;"></div>
                <div class="skeleton skeleton-text" style="width: 80%; margin-top: 10px;"></div>
            </div>
        </div>
    `).join('');
}

async function loadLatestActivities() {
    const container = document.getElementById('activitiesGrid');
    
    if (!container) {
        console.warn('Activities container not found');
        return;
    }
    
    // Show skeleton loading
    showActivitySkeleton(container);
    
    try {
        const activities = await API.activities.getAll();
        const latest = activities.slice(0, 4);
        
        if (latest.length === 0) {
            container.innerHTML = '<p class="empty-message">لا توجد أنشطة حالياً</p>';
            return;
        }
        
        container.innerHTML = latest.map(activity => {
            const gradients = [
                'linear-gradient(135deg, #1A73E8 0%, #2ECC71 100%)',
                'linear-gradient(135deg, #2ECC71 0%, #1A73E8 100%)',
                'linear-gradient(135deg, #F5A623 0%, #1A73E8 100%)'
            ];
            const gradient = gradients[Math.floor(Math.random() * gradients.length)];
            
            return `
                <div class="activity-card">
                    <div class="activity-image" style="background: ${activity.image_url ? 'none' : gradient};">
                        ${activity.image_url ? `<img src="${activity.image_url}" alt="${activity.title}">` : ''}
                    </div>
                    <div class="activity-content">
                        <h3>${activity.title}</h3>
                        <p class="activity-date">📅 ${formatDate(activity.date)}</p>
                        <p class="activity-description">${truncateText(activity.description, 100)}</p>
                        <button class="read-more-btn">اقرأ المزيد →</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="error-message">خطأ في تحميل الأنشطة</p>';
    }
}

// ============================================
// LOAD ANNOUNCEMENTS
// ============================================

function showMemoSkeleton(container) {
    container.innerHTML = Array(4).fill(0).map(() => `
        <div class="memo-card skeleton-memo">
            <div class="memo-icon skeleton skeleton-icon"></div>
            <div class="memo-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text" style="width: 60%;"></div>
                <div class="skeleton skeleton-text" style="width: 90%; margin-top: 10px;"></div>
            </div>
        </div>
    `).join('');
}

async function loadLatestAnnouncements() {
    const container = document.getElementById('memosList');
    
    if (!container) {
        console.warn('Announcements container not found');
        return;
    }
    
    // Show skeleton loading
    showMemoSkeleton(container);
    
    try {
        const announcements = await API.announcements.getAll();
        const latest = announcements.slice(0, 4);
        
        if (latest.length === 0) {
            container.innerHTML = '<p class="empty-message">لا توجد إعلانات حالياً</p>';
            return;
        }
        
        const iconMap = {
            'امتحانات': '📄',
            'ministry': '📋',
            'competitions': '🏆',
            'مسابقات': '🏆',
            'مذكرات وزارية': '📋'
        };
        
        container.innerHTML = latest.map(ann => {
            const icon = iconMap[ann.category] || '📢';
            return `
                <div class="memo-card">
                    <div class="memo-icon">${icon}</div>
                    <div class="memo-content">
                        <h3>${ann.title}</h3>
                        <p>تاريخ الإصدار: ${formatDate(ann.created_at)}</p>
                        <p class="memo-description">${truncateText(ann.content, 120)}</p>
                        ${ann.file_url ? `<a href="${ann.file_url}" target="_blank" class="download-btn">📄 تحميل PDF</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="error-message">خطأ في تحميل الإعلانات</p>';
    }
}

// ============================================
// NAVIGATION SETUP
// ============================================

function setupNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        // Close menu when clicking on a link
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('show');
            });
        });
    }
}

// ============================================
// CTA BUTTON SETUP
// ============================================

function setupCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            document.querySelector('.latest-activities').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}
