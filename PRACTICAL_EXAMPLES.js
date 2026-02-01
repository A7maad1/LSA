/* ============================================
   PRACTICAL INTEGRATION EXAMPLES
   ============================================ */

// ============================================
// EXAMPLE 1: Replace Activity Message with Toast
// ============================================

// BEFORE (Old way):
function showActivityMessage(message, type = 'success') {
    const messageElement = document.getElementById('activityMessage');
    messageElement.classList.remove('success', 'error', 'show');
    messageElement.textContent = message;
    messageElement.classList.add(type, 'show');
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 4000);
}

// AFTER (New way):
// Simply replace with:
// new Toast('✓ تم إضافة النشاط بنجاح!', 'success', 4000);

// Implementation in handleAddActivity():
async function handleAddActivity(e) {
    e.preventDefault();
    
    const title = document.getElementById('actTitle').value;
    const description = document.getElementById('actDesc').value;
    const date = document.getElementById('actDate').value;
    const imageFile = document.getElementById('actImage').files[0];
    
    try {
        let image_url = null;
        
        if (imageFile) {
            const uploadResult = await API.storage.uploadFile(imageFile, 'activities');
            image_url = uploadResult.publicUrl;
        }
        
        await API.activities.create({
            title,
            description,
            date,
            image_url,
        });
        
        document.getElementById('addActivityForm').reset();
        await loadActivities();
        
        // NEW: Use Toast instead
        new Toast('✓ تم إضافة النشاط بنجاح!', 'success', 4000);
        
    } catch (error) {
        console.error('Error adding activity:', error);
        // NEW: Use Toast for errors
        new Toast('✕ حدث خطأ في إضافة النشاط', 'error', 5000);
    }
}

// ============================================
// EXAMPLE 2: Add Search to Activities List
// ============================================

async function loadActivities() {
    const container = document.getElementById('activitiesList');
    
    try {
        const activities = await API.activities.getAll();
        window.allActivities = activities;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد أنشطة حالياً</p>';
            return;
        }
        
        // Render activities
        renderActivityCards(activities);
        setupActivityActionListeners();
        
        // NEW: Add search functionality
        new SearchFilter('#activitiesList', activities, {
            searchFields: ['title', 'description'],
            filterFields: {
                'month': ['January', 'February', 'March', /* ... */]
            },
            onFilterChange: (filteredActivities) => {
                // Update activities list with filtered results
                renderActivityCards(filteredActivities);
                setupActivityActionListeners();
            }
        });
        
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

function renderActivityCards(activities) {
    const container = document.getElementById('activitiesList');
    container.innerHTML = activities.map(activity => `
        <div class="item">
            <div class="item-info">
                <h4>${activity.title}</h4>
                <p>📅 ${formatDate(activity.date)}</p>
                <p>${truncateText(activity.description, 80)}</p>
            </div>
            <div class="item-actions">
                <button class="item-edit" data-action="edit" data-id="${activity.id}">✏️ تعديل</button>
                <button class="item-delete" data-action="delete" data-id="${activity.id}">🗑️ حذف</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// EXAMPLE 3: Replace confirm() with Modal
// ============================================

// BEFORE (Old way):
async function deleteActivity(id) {
    if (confirm('هل تريد حذف هذا النشاط؟')) {
        try {
            await API.activities.delete(id);
            await loadActivities();
            showActivityMessage('تم حذف النشاط بنجاح!', 'success');
        } catch (error) {
            console.error('Error deleting activity:', error);
            showActivityMessage('حدث خطأ في حذف النشاط', 'error');
        }
    }
}

// AFTER (New way):
async function deleteActivity(id) {
    // NEW: Use Modal.confirm instead of confirm()
    const confirmed = await Modal.confirm(
        'حذف النشاط',
        'هل أنت متأكد من حذف هذا النشاط؟ لا يمكن التراجع عن هذا الإجراء.'
    );
    
    if (confirmed) {
        try {
            await API.activities.delete(id);
            await loadActivities();
            new Toast('✓ تم حذف النشاط بنجاح!', 'success');
        } catch (error) {
            console.error('Error deleting activity:', error);
            new Toast('✕ خطأ في حذف النشاط', 'error', 5000);
        }
    }
}

// ============================================
// EXAMPLE 4: Add Pagination to Contacts
// ============================================

async function loadContactMessages() {
    const container = document.getElementById('contactsList');
    
    if (!container) return;
    
    try {
        const messages = await API.contacts.getAll();
        window.allContacts = messages || [];
        
        if (!messages || messages.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد رسائل حالياً</p>';
            return;
        }
        
        // NEW: Add pagination
        const itemsPerPage = 10;
        const pagination = new Pagination(
            '#contactsPagination',
            messages.length,
            itemsPerPage
        );
        
        const renderPage = (page) => {
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageMessages = messages.slice(start, end);
            renderContactMessages(pageMessages);
            setupContactEventListeners();
        };
        
        pagination.onPageChange = renderPage;
        
        // Render first page
        renderPage(1);
        
    } catch (error) {
        console.error('Error loading contact messages:', error);
        container.innerHTML = `<p class="error">خطأ في تحميل الرسائل: ${error.message}</p>`;
    }
}

// Add this to your HTML where you want pagination:
// <div id="contactsPagination"></div>

// ============================================
// EXAMPLE 5: Add Progress Tracker for Uploads
// ============================================

async function handleAddGalleryImage(e) {
    e.preventDefault();
    
    const title = document.getElementById('galleryTitle').value;
    const description = document.getElementById('galleryDescription').value;
    const imageFile = document.getElementById('galleryImage').files[0];
    const formContainer = document.getElementById('addGalleryForm');
    
    try {
        let image_url = null;
        
        if (imageFile) {
            // NEW: Create progress tracker
            const progressContainer = document.createElement('div');
            progressContainer.id = 'uploadProgress';
            formContainer.appendChild(progressContainer);
            
            const progress = new ProgressTracker('#uploadProgress', 0, 100);
            
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                const current = Math.min(
                    parseInt(progressContainer.querySelector('.progress-bar-fill').style.width) + Math.random() * 30,
                    90
                );
                progress.update(current);
            }, 200);
            
            const compressedFile = await ImageCompressor.compress(imageFile);
            const uploadResult = await API.storage.uploadFile(compressedFile, 'gallery');
            image_url = uploadResult.publicUrl;
            
            clearInterval(progressInterval);
            progress.complete();
            
            // Clean up after delay
            setTimeout(() => {
                progressContainer.remove();
            }, 1000);
        }
        
        await API.gallery.create({
            title,
            description,
            image_url,
        });
        
        document.getElementById('addGalleryForm').reset();
        await loadGallery();
        
        new Toast('✓ تم إضافة الصورة بنجاح!', 'success');
        
    } catch (error) {
        console.error('Error adding gallery image:', error);
        new Toast('✕ حدث خطأ في إضافة الصورة', 'error', 5000);
    }
}

// ============================================
// EXAMPLE 6: Add Tabs to Announcements Section
// ============================================

// HTML Structure:
/*
<div class="tabs-container">
    <div class="tabs-header">
        <button data-tab="all">جميع الإعلانات</button>
        <button data-tab="important">مهم</button>
        <button data-tab="scheduled">مجدول</button>
    </div>
    <div class="tabs-content">
        <div data-tab-content="all" id="allAnnouncements"></div>
        <div data-tab-content="important" id="importantAnnouncements"></div>
        <div data-tab-content="scheduled" id="scheduledAnnouncements"></div>
    </div>
</div>
*/

async function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    
    try {
        const announcements = await API.announcements.getAll();
        
        if (announcements.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد إعلانات</p>';
            return;
        }
        
        // Initialize tabs
        new Tabs('.tabs-container');
        
        // Categorize announcements
        const allAnnouncements = document.getElementById('allAnnouncements');
        const importantAnnouncements = document.getElementById('importantAnnouncements');
        const scheduledAnnouncements = document.getElementById('scheduledAnnouncements');
        
        const important = announcements.filter(a => a.category === 'مهم');
        const scheduled = announcements.filter(a => a.category === 'مجدول');
        
        // Render each tab
        allAnnouncements.innerHTML = renderAnnouncements(announcements);
        importantAnnouncements.innerHTML = renderAnnouncements(important);
        scheduledAnnouncements.innerHTML = renderAnnouncements(scheduled);
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

function renderAnnouncements(announcements) {
    return announcements.map(ann => `
        <div class="item">
            <div class="item-info">
                <h4>${ann.title}</h4>
                <p>📅 ${formatDate(ann.created_at)}</p>
                <span class="badge badge-${ann.category === 'مهم' ? 'danger' : 'info'}">${ann.category}</span>
            </div>
            <div class="item-actions">
                <button class="item-delete" data-action="delete-announcement" data-id="${ann.id}">🗑️ حذف</button>
            </div>
        </div>
    `).join('');
}

// ============================================
// EXAMPLE 7: Enhanced Certificate Management with Modals
// ============================================

async function updateCertificateStatus(id, newStatus) {
    try {
        // NEW: Show confirmation modal
        const message = `هل تريد تغيير حالة الطلب إلى: ${getStatusLabel(newStatus)}?`;
        const confirmed = await Modal.confirm('تحديث الحالة', message);
        
        if (!confirmed) return;
        
        await API.certificates.update(id, { 
            status: newStatus, 
            updated_at: new Date().toISOString() 
        });
        
        await loadCertificateRequests();
        new Toast(`✓ تم تحديث الحالة إلى ${getStatusLabel(newStatus)}`, 'success');
        
    } catch (error) {
        console.error('Error updating certificate:', error);
        new Toast('✕ خطأ في تحديث الحالة', 'error', 5000);
    }
}

// ============================================
// EXAMPLE 8: Export Data Feature
// ============================================

// Add button to your HTML:
// <button id="exportContactsBtn" class="btn btn-secondary">📥 تصدير البيانات</button>

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('exportContactsBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', async () => {
            try {
                const contacts = await API.contacts.getAll();
                
                // Show export options modal
                const format = await Modal.show(
                    'تصدير البيانات',
                    '<p>اختر صيغة التصدير:</p>',
                    [
                        { label: 'CSV', type: 'primary', action: 'csv' },
                        { label: 'JSON', type: 'primary', action: 'json' },
                        { label: 'إلغاء', type: 'secondary', action: 'cancel' }
                    ]
                );
                
                if (format === 'csv') {
                    DataExport.toCSV(contacts, 'contacts.csv');
                } else if (format === 'json') {
                    DataExport.toJSON(contacts, 'contacts.json');
                }
                
            } catch (error) {
                console.error('Export error:', error);
                new Toast('✕ خطأ في تصدير البيانات', 'error', 5000);
            }
        });
    }
});

// ============================================
// EXAMPLE 9: Add Notification Center Alert
// ============================================

// Show important notifications in notification center:
function notifyAdmins(title, message, type = 'info') {
    notificationCenter.notify(title, message, type, 0); // 0 = never auto-close
}

// Usage:
// notifyAdmins('🔴 تنبيه', 'لديك 5 رسائل جديدة', 'warning');

// ============================================
// EXAMPLE 10: Add Collapsible Sections
// ============================================

/*
HTML Structure:
<div class="collapsible-item">
    <button data-collapse-trigger="filterSection">🔍 خيارات البحث المتقدم</button>
    <div class="collapsible-content" id="filterSection">
        <div class="search-filter-container">
            <!-- Search and filters here -->
        </div>
    </div>
</div>

JavaScript:
*/
new Collapsible('.collapsible-item');

