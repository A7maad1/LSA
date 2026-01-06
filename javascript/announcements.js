// ============================================
// ANNOUNCEMENTS.JS - PUBLIC ANNOUNCEMENTS PAGE
// ============================================

let allAnnouncements = [];
let filteredAnnouncements = [];
const categories = ['جميع التصنيفات', 'إعلانات', 'تنويهات', 'قرارات', 'أخرى'];

document.addEventListener('DOMContentLoaded', function() {
    initializeAnnouncementsPage();
});

async function initializeAnnouncementsPage() {
    setupEventListeners();
    await loadAnnouncementsData();
}

function setupEventListeners() {
    const searchInput = document.getElementById('announcementSearch');
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', handleCategoryFilter);
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
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
        container.innerHTML = '<p class="loading">لم يتم العثور على إعلانات</p>';
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
            ${ann.file_url ? `<a href="${ann.file_url}" target="_blank" class="announcement-file">📎 تحميل الملف</a>` : ''}
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const currentCategory = document.querySelector('.category-btn.active').textContent;
    
    filteredAnnouncements = allAnnouncements.filter(ann => {
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm) ||
                             ann.content.toLowerCase().includes(searchTerm);
        
        const matchesCategory = currentCategory === 'جميع التصنيفات' || ann.category === currentCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    renderAnnouncements(filteredAnnouncements);
}

function handleCategoryFilter(e) {
    // Remove active from all buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active to clicked button
    e.target.classList.add('active');
    
    const category = e.target.textContent;
    const searchTerm = document.getElementById('announcementSearch').value.toLowerCase();
    
    filteredAnnouncements = allAnnouncements.filter(ann => {
        const matchesCategory = category === 'جميع التصنيفات' || ann.category === category;
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm) ||
                             ann.content.toLowerCase().includes(searchTerm);
        
        return matchesCategory && matchesSearch;
    });
    
    renderAnnouncements(filteredAnnouncements);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}
