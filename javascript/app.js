// ============================================
// APP.JS - HOME PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

async function initializeApp() {
    // Load latest activities
    loadLatestActivities();

    // Load latest announcements
    loadLatestAnnouncements();

    // Load gallery images
    loadGallery();

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
                        <a href="activities.html" class="read-more-btn">اقرأ المزيد →</a>
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
    const listContainers = {
        'عام': document.getElementById('announcementsList'),
        'امتحانات': document.getElementById('examsList'),
        'مسابقات': document.getElementById('competitionsList'),
        'مذكرات وزارية': document.getElementById('ministryList')
    };

    try {
        const announcements = await API.announcements.getAll();

        // Group by category
        const grouped = {
            'عام': [],
            'امتحانات': [],
            'مسابقات': [],
            'مذكرات وزارية': []
        };

        announcements.forEach(ann => {
            if (grouped[ann.category]) {
                grouped[ann.category].push(ann);
            } else {
                grouped['عام'].push(ann);
            }
        });

        const iconMap = {
            'امتحانات': '📄',
            'مسابقات': '🏆',
            'مذكرات وزارية': '📋',
            'عام': '📢'
        };

        // Render each category
        Object.keys(listContainers).forEach(category => {
            const container = listContainers[category];
            if (!container) return;

            const items = grouped[category].slice(0, 4); // Limit to 4 items per section

            if (items.length === 0) {
                container.innerHTML = `<p class="empty-message">لا توجد ${category} حالياً</p>`;
                return;
            }

            container.innerHTML = items.map(ann => {
                const icon = iconMap[ann.category] || '📢';
                const pageMap = {
                    'عام': 'announcements.html',
                    'امتحانات': 'exams.html',
                    'مسابقات': 'competitions.html',
                    'مذكرات وزارية': 'memos.html'
                };
                const targetPage = pageMap[ann.category] || 'announcements.html';

                return `
                    <div class="memo-card" data-category="${ann.category}">
                        <div class="memo-icon">${icon}</div>
                        <div class="memo-content">
                            <h3>${ann.title}</h3>
                            <p>تاريخ الإصدار: ${formatDate(ann.created_at)}</p>
                            <p class="memo-description">${truncateText(ann.content, 120)}</p>
                            <div class="memo-footer" style="display: flex; gap: 10px; margin-top: 15px;">
                                <a href="${targetPage}" class="read-more-btn">اقرأ المزيد →</a>
                                ${ann.file_url ? `<a href="${ann.file_url}" target="_blank" class="download-btn">📄 PDF</a>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        });

    } catch (error) {
        console.error('Error loading announcements:', error);
        Object.values(listContainers).forEach(container => {
            if (container) container.innerHTML = '<p class="error-message">خطأ في تحميل البيانات</p>';
        });
    }
}

// ============================================
// LOAD GALLERY
// ============================================

async function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    const homeGalleryGrid = document.getElementById('homeGalleryGrid');

    if (!galleryGrid && !homeGalleryGrid) {
        // console.warn('Gallery container not found');
        return;
    }

    try {
        const galleryItems = await API.gallery.getAll();

        if (galleryItems.length === 0) {
            console.log('No gallery items found, keeping default placeholders');
            return;
        }

        // If on full gallery page
        if (galleryGrid && galleryManager) {
            galleryManager.setGalleryItems(galleryItems);
            console.log('Full gallery loaded:', galleryItems.length, 'items');
        }

        // If on home page
        if (homeGalleryGrid) {
            const latest = galleryItems.slice(0, 4);
            homeGalleryGrid.innerHTML = latest.map((item, index) => `
                <div class="gallery-item" data-index="${index}" style="cursor: pointer;" tabindex="0" role="button" aria-label="انقر لفتح ${item.title}">
                    <img 
                        src="${item.image_url}" 
                        alt="${item.title}"
                        loading="lazy"
                        style="width: 100%; height: 100%; object-fit: cover;"
                    />
                    <div class="gallery-overlay">
                        <p>${item.title}</p>
                    </div>
                </div>
            `).join('');

            // Attach lightbox functionality if galleryManager is available
            if (galleryManager) {
                // Initialize gallery items in manager for lightbox context
                galleryManager.galleryItems = latest;
                galleryManager.filteredItems = latest;
                galleryManager.attachLightboxListener(homeGalleryGrid);
            }
            console.log('Home gallery loaded:', latest.length, 'items');
        }

    } catch (error) {
        console.error('Error loading gallery:', error);
        // Keep default placeholders if there's an error
    }
}

// ============================================
// CTA BUTTON SETUP
// ============================================

function setupCTAButton() {
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function () {
            const section = document.getElementById('activities');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', options);
}

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}
