// ============================================
// ANNOUNCEMENTS.JS - PUBLIC ANNOUNCEMENTS PAGE
// ============================================

let allAnnouncements = [];
let filteredAnnouncements = [];
const categories = ['الكل', 'عام', 'امتحانات', 'مسابقات', 'مذكرات وزارية'];

document.addEventListener('DOMContentLoaded', function () {
    initializeAnnouncementsPage();
});

async function initializeAnnouncementsPage() {
    setupEventListeners();
    await loadAnnouncementsData();

    // Check if this is a dedicated category page
    const forcedCategory = document.body.getAttribute('data-page-category');
    if (forcedCategory) {
        // Hide standard filters if they exist (they shouldn't be in the HTML but just in case)
        const filtersDiv = document.querySelector('.category-filters');
        if (filtersDiv) filtersDiv.style.display = 'none';

        // Apply the filter
        const normalizedForced = forcedCategory.trim();
        const specificCategories = ['امتحانات', 'مسابقات', 'مذكرات وزارية'];

        if (normalizedForced === 'عام') {
            // "General" page should show items marked as 'عام' OR items with unknown/missing categories
            filteredAnnouncements = allAnnouncements.filter(ann => {
                const cat = ann.category ? ann.category.trim() : '';
                return cat === 'عام' || !specificCategories.includes(cat);
            });
        } else {
            // Specific category pages
            filteredAnnouncements = allAnnouncements.filter(ann => {
                const cat = ann.category ? ann.category.trim() : '';
                return cat === normalizedForced;
            });
        }

        console.log(`Filtering for: '${normalizedForced}', found ${filteredAnnouncements.length} items`);
        renderAnnouncements(filteredAnnouncements);
    } else {
        checkURLParameters();
    }
}

function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        const filterBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
        if (filterBtn) {
            filterBtn.click();
        }
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const categoryButtons = document.querySelectorAll('.filter-btn');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    categoryButtons.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
}

async function loadAnnouncementsData() {
    const container = document.getElementById('announcementsContainer');

    try {
        container.innerHTML = '<p class="loading">جاري تحميل الإعلانات...</p>';

        allAnnouncements = await API.announcements.getAll();
        // Sort by newest first
        allAnnouncements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        filteredAnnouncements = [...allAnnouncements];

        if (allAnnouncements.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد إعلانات متاحة حالياً</p>';
            return;
        }

        renderAnnouncements(filteredAnnouncements);
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="loading">حدث خطأ في تحميل البيانات</p>';
    }
}

function renderAnnouncements(announcements) {
    const container = document.getElementById('announcementsContainer');

    if (announcements.length === 0) {
        let forcedCategory = document.body.getAttribute('data-page-category') || 'إعلانات';

        // Improve display name for "General" category
        if (forcedCategory === 'عام') {
            forcedCategory = 'إعلانات عامة';
        }

        container.innerHTML = `
            <div class="empty-state">
                <p>لم يتم العثور على ${forcedCategory} حالياً</p>
                <button onclick="window.location.reload()" class="retry-btn">تحديث الصفحة</button>
            </div>
        `;
        return;
    }

    container.innerHTML = announcements.map(ann => `
        <div class="announcement-item">
            <div class="announcement-header">
                <h3>${ann.title}</h3>
                <span class="announcement-category">${ann.category}</span>
            </div>
            <p class="announcement-date">📅 ${formatDate(ann.created_at)}</p>
            <p class="announcement-content">${ann.content}</p>
            <div class="announcement-actions">
                <button class="announcement-download-pdf" onclick="downloadAnnouncementPDF('${ann.id}', '${ann.title.replace(/'/g, "\\'")}')">📄 تحميل PDF</button>
                ${ann.file_url ? `<a href="${ann.file_url}" target="_blank" class="announcement-file">📎 تحميل الملف</a>` : ''}
            </div>
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const forcedCategory = document.body.getAttribute('data-page-category');
    const activeBtn = document.querySelector('.filter-btn.active');
    const currentCategory = forcedCategory || (activeBtn ? activeBtn.getAttribute('data-category') : 'all');

    filteredAnnouncements = allAnnouncements.filter(ann => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm) ||
            ann.content.toLowerCase().includes(searchTerm);

        const matchesCategory = currentCategory === 'all' || ann.category === currentCategory;

        return matchesSearch && matchesCategory;
    });

    renderAnnouncements(filteredAnnouncements);
}

function handleCategoryFilter(e) {
    // Remove active from all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active to clicked button
    e.target.classList.add('active');

    const category = e.target.getAttribute('data-category');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();

    filteredAnnouncements = allAnnouncements.filter(ann => {
        const matchesCategory = category === 'all' || ann.category === category;
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm) ||
            ann.content.toLowerCase().includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    renderAnnouncements(filteredAnnouncements);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', options);
}

// Professional PDF Download Function
async function downloadAnnouncementPDF(announcementId, title) {
    try {
        // Get the announcement details
        const announcement = allAnnouncements.find(a => a.id === announcementId);

        if (!announcement) {
            showToast('الإعلان غير متوفر', 'error');
            return;
        }

        // Show loading
        showToast(`جاري تحضير الملف: ${title}`, 'info');

        if (announcement.file_url) {
            // Download existing file
            downloadFile(announcement.file_url, title, announcement.created_at);
        } else {
            // Generate document from announcement content
            generateDocumentFromAnnouncement(announcement);
        }
    } catch (error) {
        console.error('Error downloading PDF:', error);
        showToast('حدث خطأ في تحميل الملف', 'error');
    }
}

// Download file with professional naming
function downloadFile(fileUrl, title, createdDate) {
    try {
        const link = document.createElement('a');
        link.href = fileUrl;

        // Generate professional filename
        const timestamp = new Date(createdDate).getTime();
        const sanitizedTitle = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50);
        link.download = `إعلان_${sanitizedTitle}_${timestamp}.pdf`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`تم تحميل: ${title}`, 'success');

        // Log download event for analytics
        console.log(`PDF Downloaded: ${title}`, {
            title: title,
            downloadedAt: new Date().toLocaleString('ar-EG-u-nu-latn'),
            fileUrl: fileUrl
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        showToast('حدث خطأ في تحميل الملف', 'error');
    }
}

// Generate HTML document from announcement content
function generateDocumentFromAnnouncement(announcement) {
    try {
        // Create professional HTML content
        const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${announcement.title}</title>
    <style>
        body {
            font-family: 'Cairo', Arial, sans-serif;
            direction: rtl;
            background: white;
            color: #333;
            margin: 40px;
            line-height: 1.8;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .school-name {
            font-size: 24px;
            font-weight: bold;
            color: #3498db;
            margin-bottom: 5px;
        }
        .school-address {
            font-size: 12px;
            color: #666;
        }
        h1 {
            color: #3498db;
            text-align: center;
            font-size: 22px;
            margin: 20px 0;
        }
        .meta-info {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            padding: 10px;
            background: #ecf0f1;
            border-radius: 5px;
            flex-direction: row-reverse;
        }
        .meta-item {
            font-size: 12px;
            color: #555;
        }
        .category {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin: 10px 5px 10px 0;
        }
        .content {
            font-size: 14px;
            color: #333;
            line-height: 2;
            margin: 20px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #bdc3c7;
            text-align: center;
            font-size: 11px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="school-name">ثانوية صلاح الدين الأيوبي</div>
        <div class="school-address">حي الفداء – الدار البيضاء</div>
    </div>
    <h1>${announcement.title}</h1>
    <div class="meta-info">
        <div class="meta-item">التاريخ: ${formatDate(announcement.created_at)}</div>
        <span class="category">${announcement.category}</span>
    </div>
    <div class="content">${announcement.content}</div>
    <div class="footer">
        <p>هذا الإعلان من ثانوية صلاح الدين الأيوبي</p>
        <p>تم الإنشاء بواسطة نظام إدارة المدرسة</p>
    </div>
</body>
</html>
        `;

        // Create blob from HTML
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);

        // Create download link
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date(announcement.created_at).getTime();
        const sanitizedTitle = announcement.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50);
        link.download = `إعلان_${sanitizedTitle}_${timestamp}.html`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        window.URL.revokeObjectURL(url);

        showToast(`تم تحميل: ${announcement.title}`, 'success');

        console.log(`Announcement Document Downloaded: ${announcement.title}`, {
            title: announcement.title,
            downloadedAt: new Date().toLocaleString('ar-EG-u-nu-latn')
        });
    } catch (error) {
        console.error('Error generating document:', error);
        showToast('حدث خطأ في إنشاء الملف', 'error');
    }
}

// Show toast notification (fallback if toast.js not available)
function showToast(message, type = 'info') {
    if (typeof toast === 'function') {
        toast(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}
