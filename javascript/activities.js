// ============================================
// ACTIVITIES.JS - PUBLIC ACTIVITIES PAGE
// ============================================

let allActivities = [];
let filteredActivities = [];

document.addEventListener('DOMContentLoaded', function () {
    initializeActivitiesPage();
});

async function initializeActivitiesPage() {
    setupEventListeners();
    await loadActivitiesData();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
}

async function loadActivitiesData() {
    const container = document.getElementById('activitiesContainer');

    try {
        container.innerHTML = '<p class="loading">جاري تحميل الأنشطة...</p>';

        allActivities = await API.activities.getAll();
        filteredActivities = [...allActivities];

        if (allActivities.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد أنشطة متاحة حالياً</p>';
            return;
        }

        renderActivities(filteredActivities);
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="loading">حدث خطأ في تحميل البيانات</p>';
    }
}

function renderActivities(activities) {
    const container = document.getElementById('activitiesContainer');

    if (activities.length === 0) {
        container.innerHTML = '<p class="loading">لم يتم العثور على أنشطة</p>';
        return;
    }

    container.innerHTML = activities.map(activity => `
        <div class="activity-card">
            ${activity.image_url ? `<img src="${activity.image_url}" alt="${activity.title}">` : '<div class="activity-placeholder">📸</div>'}
            <div class="activity-content">
                <h3>${activity.title}</h3>
                <p class="activity-date">📅 ${formatDate(activity.date)}</p>
                <p class="activity-description">${activity.description}</p>
            </div>
        </div>
    `).join('');
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    filteredActivities = allActivities.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm) ||
        activity.description.toLowerCase().includes(searchTerm)
    );

    renderActivities(filteredActivities);
}

function handleSort(e) {
    const sortValue = e.target.value;

    if (sortValue === 'date-newest') {
        filteredActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortValue === 'date-oldest') {
        filteredActivities.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortValue === 'name-asc') {
        filteredActivities.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    } else if (sortValue === 'name-desc') {
        filteredActivities.sort((a, b) => b.title.localeCompare(a.title, 'ar'));
    }

    renderActivities(filteredActivities);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', options);
}
