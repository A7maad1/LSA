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

async function loadLatestActivities() {
    const container = document.getElementById('activitiesContainer');
    
    try {
        const activities = await activitiesAPI.getAll();
        const latest = activities.slice(0, 3);
        
        if (latest.length === 0) {
            container.innerHTML = '<p class="empty-message">لا توجد أنشطة حالياً</p>';
            return;
        }
        
        container.innerHTML = latest.map(activity => `
            <div class="activity-card">
                ${activity.image_url ? `<img src="${activity.image_url}" alt="${activity.title}" class="activity-image">` : '<div class="activity-image" style="background: #ddd;"></div>'}
                <div class="activity-content">
                    <h3>${activity.title}</h3>
                    <p class="activity-date">📅 ${formatDate(activity.date)}</p>
                    <p>${truncateText(activity.description, 100)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="error-message">خطأ في تحميل الأنشطة</p>';
    }
}

// ============================================
// LOAD ANNOUNCEMENTS
// ============================================

async function loadLatestAnnouncements() {
    const container = document.getElementById('announcementsContainer');
    
    try {
        const announcements = await announcementsAPI.getAll();
        const latest = announcements.slice(0, 3);
        
        if (latest.length === 0) {
            container.innerHTML = '<p class="empty-message">لا توجد إعلانات حالياً</p>';
            return;
        }
        
        container.innerHTML = latest.map(ann => `
            <div class="announcement-item">
                <h3>${ann.title}</h3>
                <div class="announcement-meta">
                    <span>📅 ${formatDate(ann.created_at)}</span>
                    <span class="announcement-category">${ann.category}</span>
                </div>
                <p class="announcement-content">${truncateText(ann.content, 150)}</p>
                ${ann.file_url ? `<a href="${ann.file_url}" target="_blank" class="announcement-file">📄 تحميل PDF</a>` : ''}
            </div>
        `).join('');
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
