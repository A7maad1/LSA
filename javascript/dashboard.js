// ============================================
// DASHBOARD.JS - ADMIN PANEL FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

let currentUser = null;

async function initializeDashboard() {
    // Check if user is authenticated
    const session = authManager.getSession();
    
    if (session) {
        // Show dashboard
        showDashboard();
        loadAllData();
        loadAdminStats();
    } else {
        // Show login
        showLoginPage();
    }
    
    // Setup event listeners
    setupEventListeners();
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function setupEventListeners() {
    // AUTH PAGES
    const loginForm = document.getElementById('loginForm');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // DASHBOARD NAVIGATION
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const section = this.dataset.section;
            switchSection(section);
        });
    });
    
    // ACTIVITY FORM
    const addActivityForm = document.getElementById('addActivityForm');
    if (addActivityForm) {
        addActivityForm.addEventListener('submit', handleAddActivity);
    }
    
    // ANNOUNCEMENT FORM
    const addAnnouncementForm = document.getElementById('addAnnouncementForm');
    if (addAnnouncementForm) {
        addAnnouncementForm.addEventListener('submit', handleAddAnnouncement);
    }
    
    // GALLERY FORM
    const addGalleryForm = document.getElementById('addGalleryForm');
    if (addGalleryForm) {
        addGalleryForm.addEventListener('submit', handleAddGalleryImage);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('authMessage');
    
    try {
        message.textContent = 'جاري تسجيل الدخول...';
        const response = await authManager.signIn(email, password);
        currentUser = response;
        
        message.textContent = 'تم تسجيل الدخول بنجاح!';
        message.classList.remove('error');
        
        setTimeout(() => {
            showDashboard();
            loadAllData();
        }, 1000);
    } catch (error) {
        message.textContent = 'خطأ في البريد الإلكتروني أو كلمة المرور';
        message.classList.add('error');
    }
}

// Signup removed - accounts are pre-created
// Users can only login with existing accounts

async function handleLogout() {
    await authManager.signOut();
    currentUser = null;
    showLoginPage();
    document.getElementById('loginForm').reset();
}

// ============================================
// PAGE SWITCHING
// ============================================

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
    const session = authManager.getSession();
    if (session) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        document.getElementById('userEmail').textContent = session.email || 'مدير النظام';
    }
}

function switchSection(section) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Remove active from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').classList.add('active');
    
    // Highlight nav item
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // Load data for section
    if (section === 'activities') {
        loadActivities();
    } else if (section === 'announcements') {
        loadAnnouncements();
    } else if (section === 'gallery') {
        loadGallery();
    } else if (section === 'certificates') {
        loadCertificateRequests();
    } else if (section === 'contacts') {
        loadContactMessages();
    }
}

// ============================================
// ACTIVITIES MANAGEMENT
// ============================================

async function loadAllData() {
    loadActivities();
    loadAnnouncements();
    loadGallery();
    loadContactMessages();
}

async function loadActivities() {
    const container = document.getElementById('activitiesList');
    
    try {
        const activities = await API.activities.getAll();
        
        // Store activities globally for edit functionality
        window.allActivities = activities;
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد أنشطة حالياً</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="item">
                <div class="item-info">
                    <h4>${activity.title}</h4>
                    <p>📅 ${activity.date}</p>
                    <p>${truncateText(activity.description, 80)}</p>
                </div>
                <div class="item-actions">
                    <button class="item-edit" data-action="edit" data-id="${activity.id}">✏️ تعديل</button>
                    <button class="item-delete" data-action="delete" data-id="${activity.id}">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners using event delegation
        setupActivityActionListeners();
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

function setupActivityActionListeners() {
    const container = document.getElementById('activitiesList');
    
    // Remove old listener if it exists
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('[data-action="delete"]');
        const editBtn = e.target.closest('[data-action="edit"]');
        
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            await deleteActivity(id);
        }
        
        if (editBtn) {
            const id = editBtn.getAttribute('data-id');
            editActivity(id);
        }
    });
}

// Display activity message above the activities list
function showActivityMessage(message, type = 'success') {
    const messageElement = document.getElementById('activityMessage');
    
    // Remove previous classes
    messageElement.classList.remove('success', 'error', 'show');
    
    // Add new message and type
    messageElement.textContent = message;
    messageElement.classList.add(type, 'show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 4000);
}

// Generic function to display messages in any section
function showSectionMessage(message, type = 'success', sectionId = 'activity') {
    const messageElementId = sectionId + 'Message';
    const messageElement = document.getElementById(messageElementId);
    
    if (!messageElement) {
        console.warn(`Message element with id "${messageElementId}" not found`);
        return;
    }
    
    // Remove previous classes
    messageElement.classList.remove('success', 'error', 'show');
    
    // Add new message and type
    messageElement.textContent = message;
    messageElement.classList.add(type, 'show');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        messageElement.classList.remove('show');
    }, 4000);
}

async function handleAddActivity(e) {
    e.preventDefault();
    
    const title = document.getElementById('actTitle').value;
    const description = document.getElementById('actDesc').value;
    const date = document.getElementById('actDate').value;
    const imageFile = document.getElementById('actImage').files[0];
    
    try {
        let image_url = null;
        
        // Upload image if provided (non-blocking)
        if (imageFile) {
            try {
                image_url = await storageAPI.uploadImage(imageFile, 'activities');
            } catch (uploadError) {
                console.warn('Image upload failed, proceeding without image:', uploadError);
                // Continue without image if upload fails
            }
        }
        
        await API.activities.create({
            title,
            description,
            date,
            image_url,
        });
        
        // Reset form
        document.getElementById('addActivityForm').reset();
        
        // Reload activities
        loadActivities();
        
        showActivityMessage('تم إضافة النشاط بنجاح!', 'success');
    } catch (error) {
        console.error('Error adding activity:', error);
        showActivityMessage('حدث خطأ في إضافة النشاط', 'error');
    }
}

async function deleteActivity(id) {
    console.log('Deleting activity with id:', id);
    if (confirm('هل تريد حذف هذا النشاط؟')) {
        try {
            const result = await API.activities.delete(id);
            console.log('Delete result:', result);
            await loadActivities();
            showActivityMessage('تم حذف النشاط بنجاح!', 'success');
        } catch (error) {
            console.error('Error deleting activity:', error);
            showActivityMessage('حدث خطأ في حذف النشاط: ' + error.message, 'error');
        }
    }
}

function editActivity(id) {
    // Find the activity to edit
    const activity = allActivities.find(a => a.id == id);
    
    if (!activity) {
        showErrorToast('لم يتم العثور على النشاط');
        return;
    }
    
    // Create edit form
    const formHTML = `
        <div class="edit-modal">
            <div class="edit-modal-content">
                <h3>تعديل النشاط</h3>
                <form id="editActivityForm">
                    <div class="form-group">
                        <label>العنوان</label>
                        <input type="text" id="editActTitle" value="${activity.title}" required>
                    </div>
                    <div class="form-group">
                        <label>الوصف</label>
                        <textarea id="editActDesc" required>${activity.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label>التاريخ</label>
                        <input type="date" id="editActDate" value="${activity.date ? activity.date.split('T')[0] : ''}" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                        <button type="button" class="btn btn-secondary" onclick="closeEditModal()">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Show modal
    document.body.insertAdjacentHTML('beforeend', formHTML);
    document.getElementById('editActivityForm').addEventListener('submit', (e) => saveActivityEdit(e, id));
}

async function saveActivityEdit(e, id) {
    e.preventDefault();
    
    const title = document.getElementById('editActTitle').value;
    const description = document.getElementById('editActDesc').value;
    const date = document.getElementById('editActDate').value;
    
    try {
        await API.activities.update(id, {
            title,
            description,
            date,
        });
        
        closeEditModal();
        await loadActivities();
        showSuccessToast('تم تحديث النشاط بنجاح!');
    } catch (error) {
        console.error('Error updating activity:', error);
        showErrorToast('حدث خطأ في تحديث النشاط: ' + error.message);
    }
}

function closeEditModal() {
    const modal = document.querySelector('.edit-modal');
    if (modal) {
        modal.remove();
    }
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

async function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    
    try {
        const announcements = await API.announcements.getAll();
        
        if (announcements.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد إعلانات حالياً</p>';
            return;
        }
        
        container.innerHTML = announcements.map(ann => `
            <div class="item">
                <div class="item-info">
                    <h4>${ann.title}</h4>
                    <p>📅 ${ann.created_at}</p>
                    <p>التصنيف: ${ann.category}</p>
                </div>
                <div class="item-actions">
                    <button class="item-delete" data-action="delete-announcement" data-id="${ann.id}">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners using event delegation
        setupAnnouncementActionListeners();
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

function setupAnnouncementActionListeners() {
    const container = document.getElementById('announcementsList');
    
    // Remove old listener if it exists
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('[data-action="delete-announcement"]');
        
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            await deleteAnnouncement(id);
        }
    });
}

async function handleAddAnnouncement(e) {
    e.preventDefault();
    
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const category = document.getElementById('annCategory').value;
    
    try {
        await API.announcements.create({
            title,
            content,
            category,
            file_url: null,
        });
        
        // Reset form
        document.getElementById('addAnnouncementForm').reset();
        
        // Reload announcements
        loadAnnouncements();
        
        showSectionMessage('تم نشر الإعلان بنجاح!', 'success', 'announcement');
    } catch (error) {
        console.error('Error adding announcement:', error);
        showSectionMessage('حدث خطأ في نشر الإعلان', 'error', 'announcement');
    }
}

async function deleteAnnouncement(id) {
    console.log('Deleting announcement with id:', id);
    if (confirm('هل تريد حذف هذا الإعلان؟')) {
        try {
            const result = await API.announcements.delete(id);
            console.log('Delete result:', result);
            await loadAnnouncements();
            showSectionMessage('تم حذف الإعلان بنجاح!', 'success', 'announcement');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            showSectionMessage('حدث خطأ في حذف الإعلان: ' + error.message, 'error', 'announcement');
        }
    }
}

// ============================================
// CERTIFICATE REQUESTS MANAGEMENT
// ============================================

async function loadCertificateRequests() {
    try {
        const certsList = document.getElementById('certificatesList');
        certsList.innerHTML = '<div class="loading">جاري التحميل...</div>';
        
        const requests = await API.certificates.getAll();
        
        if (!requests || requests.length === 0) {
            certsList.innerHTML = '<p class="no-data">لا توجد طلبات شهادات بعد</p>';
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'certificates-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>النسب</th>
                    <th>رقم المسار</th>
                    <th>تاريخ الميلاد</th>
                    <th>تاريخ الطلب</th>
                    <th>الحالة</th>
                    <th>الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${requests.map(request => `
                    <tr class="cert-row">
                        <td class="cert-name">${request.first_name}</td>
                        <td>${request.last_name}</td>
                        <td>${request.massar_number}</td>
                        <td>${request.birth_date}</td>
                        <td>${request.submission_date}</td>
                        <td>
                            <select class="status-select status-${request.status}" data-action="update-cert-status" data-id="${request.id}">
                                <option value="pending" ${request.status === 'pending' ? 'selected' : ''}>قيد الانتظار</option>
                                <option value="approved" ${request.status === 'approved' ? 'selected' : ''}>موافق عليه</option>
                                <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>مكتمل</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-danger" data-action="delete-cert" data-id="${request.id}">حذف</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        
        certsList.innerHTML = '';
        certsList.appendChild(table);
        
        // Add event listeners using event delegation
        setupCertificateActionListeners(table);
    } catch (error) {
        console.error('Error loading certificates:', error);
        document.getElementById('certificatesList').innerHTML = '<p class="error">خطأ في تحميل الطلبات</p>';
    }
}

function setupCertificateActionListeners(table) {
    // Remove old listeners by cloning and replacing the table
    const newTable = table.cloneNode(true);
    table.parentNode.replaceChild(newTable, table);
    
    newTable.addEventListener('change', async (e) => {
        const statusSelect = e.target.closest('[data-action="update-cert-status"]');
        
        if (statusSelect) {
            const id = statusSelect.getAttribute('data-id');
            const newStatus = statusSelect.value;
            await updateCertificateStatus(id, newStatus);
        }
    });
    
    newTable.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('[data-action="delete-cert"]');
        
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            await deleteCertificateRequest(id);
        }
    });
}

async function updateCertificateStatus(id, newStatus) {
    try {
        await API.certificates.updateStatus(id, newStatus);
        loadCertificateRequests();
        showSectionMessage('تم تحديث حالة الطلب بنجاح!', 'success', 'certificate');
    } catch (error) {
        console.error('Error updating certificate:', error);
        showSectionMessage('خطأ في تحديث الحالة', 'error', 'certificate');
    }
}

async function deleteCertificateRequest(id) {
    if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
        try {
            await API.certificates.delete(id);
            loadCertificateRequests();
            showSectionMessage('تم حذف الطلب بنجاح!', 'success', 'certificate');
        } catch (error) {
            console.error('Error deleting certificate:', error);
            showSectionMessage('خطأ في حذف الطلب', 'error', 'certificate');
        }
    }
}

function getStatusLabel(status) {
    const labels = {
        'pending': '⏳ قيد الانتظار',
        'approved': '✅ موافق عليه',
        'rejected': '❌ مرفوض',
        'completed': '✓ مكتمل'
    };
    return labels[status] || status;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// ============================================
// CONTACTS MANAGEMENT
// ============================================

async function loadContactMessages() {
    const container = document.getElementById('contactsList');
    
    if (!container) {
        console.error('Contacts container not found!');
        return;
    }
    
    try {
        console.log('Starting to load contacts...');
        console.log('API object:', typeof API);
        console.log('API.contacts:', typeof API?.contacts);
        console.log('API.contacts.getAll:', typeof API?.contacts?.getAll);
        
        const messages = await API.contacts.getAll();
        
        console.log('Loaded contacts:', messages);
        console.log('Number of messages:', messages ? messages.length : 'null');
        
        // Store messages globally for management
        window.allContacts = messages || [];
        
        if (!messages || messages.length === 0) {
            console.log('No messages found');
            container.innerHTML = '<p class="loading">لا توجد رسائل حالياً - تأكد من إنشاء جدول contacts في Supabase</p>';
            return;
        }
        
        console.log('Rendering', messages.length, 'messages');
        renderContactMessages(messages);
        setupContactEventListeners();
        
    } catch (error) {
        console.error('Error loading contact messages:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        container.innerHTML = `<p class="error">خطأ في تحميل الرسائل: ${error.message}</p>`;
    }
}

function renderContactMessages(messages) {
    const container = document.getElementById('contactsList');
    
    if (messages.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد رسائل</p>';
        return;
    }
    
    container.innerHTML = messages.map(msg => `
        <div class="contact-card ${!msg.is_read ? 'unread' : 'read'}">
            <div class="contact-header">
                <div class="contact-info">
                    <h4>${msg.name}</h4>
                    <p class="contact-email">${msg.email}</p>
                </div>
                <span class="contact-date">${msg.created_at}</span>
            </div>
            <div class="contact-subject">
                <strong>الموضوع:</strong> ${msg.subject}
            </div>
            ${msg.phone ? `<div class="contact-phone"><strong>الهاتف:</strong> ${msg.phone}</div>` : ''}
            <div class="contact-message">
                <strong>الرسالة:</strong>
                <p>${msg.message}</p>
            </div>
            <div class="contact-actions">
                <button class="btn btn-small mark-read-btn" data-id="${msg.id}" data-read="${msg.is_read}">
                    ${msg.is_read ? '✓ مقروء' : '� وضع علامة مقروء'}
                </button>
                <button class="btn btn-small btn-danger delete-contact-btn" data-id="${msg.id}">
                    🗑️ حذف
                </button>
            </div>
        </div>
    `).join('');
}

function setupContactEventListeners() {
    // Mark as read buttons
    document.querySelectorAll('.mark-read-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const contactId = this.getAttribute('data-id');
            
            try {
                await API.contacts.markAsRead(contactId);
                loadContactMessages();
            } catch (error) {
                console.error('Error updating contact:', error);
                new Toast('خطأ في تحديث الرسالة', 'error');
            }
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-contact-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const contactId = this.getAttribute('data-id');
            
            if (!confirm('هل تريد حذف هذه الرسالة؟')) return;
            
            try {
                await API.contacts.delete(contactId);
                new Toast('تم حذف الرسالة بنجاح', 'success');
                loadContactMessages();
            } catch (error) {
                console.error('Error deleting contact:', error);
                new Toast('خطأ في حذف الرسالة', 'error');
            }
        });
    });
    
    // Mark all as read
    const markAllBtn = document.getElementById('markAllReadBtn');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', async function() {
            try {
                const unreadMessages = window.allContacts.filter(m => !m.is_read);
                
                for (const msg of unreadMessages) {
                    await API.contacts.update(msg.id, { is_read: true });
                }
                
                new Toast('تم وضع علامة على جميع الرسائل', 'success');
                loadContactMessages();
            } catch (error) {
                console.error('Error marking all as read:', error);
                new Toast('خطأ في التحديث', 'error');
            }
        });
    }
    
    // Filter by status
    const filterSelect = document.getElementById('contactsStatusFilter');
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            const filterValue = this.value;
            let filtered = window.allContacts;
            
            if (filterValue === 'read') {
                filtered = window.allContacts.filter(m => m.is_read);
            } else if (filterValue === 'unread') {
                filtered = window.allContacts.filter(m => !m.is_read);
            }
            
            renderContactMessages(filtered);
            setupContactEventListeners();
        });
    }
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

async function loadGallery() {
    const container = document.getElementById('galleryList');
    
    try {
        const galleryItems = await API.gallery.getAll();
        
        // Store gallery items globally for edit functionality
        window.allGalleryItems = galleryItems;
        
        if (galleryItems.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد صور في المعرض</p>';
            return;
        }
        
        container.innerHTML = galleryItems.map(item => `
            <div class="gallery-item-card">
                <div class="gallery-item-image">
                    <img src="${item.image_url}" alt="${item.title}">
                </div>
                <div class="gallery-item-info">
                    <h4>${item.title}</h4>
                    ${item.description ? `<p>${item.description}</p>` : ''}
                    <p class="gallery-item-date">📅 ${item.created_at}</p>
                </div>
                <div class="item-actions">
                    <button class="item-delete" data-action="delete-gallery" data-id="${item.id}">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners using event delegation
        setupGalleryActionListeners();
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

function setupGalleryActionListeners() {
    const container = document.getElementById('galleryList');
    
    // Remove old listener if it exists
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    
    newContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('[data-action="delete-gallery"]');
        
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            await deleteGalleryImage(id);
        }
    });
}
async function handleAddGalleryImage(e) {
    e.preventDefault();
    
    const title = document.getElementById('galleryTitle').value;
    const description = document.getElementById('galleryDescription').value;
    const imageFile = document.getElementById('galleryImage').files[0];
    const formContainer = document.getElementById('addGalleryForm');
    
    try {
        let image_url = null;
        
        // Upload image if provided
        if (imageFile) {
            try {
                // Show preview
                FileUploadHelper.showPreview(formContainer, imageFile);
                
                // Compress image before upload
                const compressedFile = await ImageCompressor.compress(imageFile);
                
                // Show progress bar
                FileUploadHelper.showProgress(formContainer, 0);
                
                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    const current = Math.min(
                        parseInt(formContainer.querySelector('.upload-progress-fill').style.width) + Math.random() * 30,
                        90
                    );
                    FileUploadHelper.showProgress(formContainer, current);
                }, 200);
                
                // Upload compressed image
                image_url = await storageAPI.uploadImage(compressedFile, 'gallery');
                
                clearInterval(progressInterval);
                FileUploadHelper.showProgress(formContainer, 100);
                
                // Hide progress after delay
                setTimeout(() => {
                    FileUploadHelper.hideProgress(formContainer);
                    FileUploadHelper.removePreview(formContainer);
                }, 1000);
            } catch (uploadError) {
                console.warn('Image upload failed:', uploadError);
                FileUploadHelper.hideProgress(formContainer);
                showSectionMessage('فشل رفع الصورة، حاول مرة أخرى', 'error', 'gallery');
                return;
            }
        }
        
        await API.gallery.create({
            title,
            description,
            image_url,
        });
        
        // Reset form
        document.getElementById('addGalleryForm').reset();
        
        // Reload gallery
        loadGallery();
        
        showSectionMessage('تم إضافة الصورة بنجاح!', 'success', 'gallery');
    } catch (error) {
        console.error('Error adding gallery image:', error);
        showSectionMessage('حدث خطأ في إضافة الصورة', 'error', 'gallery');
    }
}

async function deleteGalleryImage(id) {
    console.log('Deleting gallery image with id:', id);
    
    // Show confirmation dialog
    const confirmed = await ConfirmDialog.show(
        'حذف الصورة',
        'هل تريد حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.'
    );
    
    if (!confirmed) return;
    
    try {
        const result = await API.gallery.delete(id);
        console.log('Delete result:', result);
        await loadGallery();
        loadAdminStats();
        showSectionMessage('تم حذف الصورة بنجاح!', 'success', 'gallery');
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        showSectionMessage('حدث خطأ في حذف الصورة: ' + error.message, 'error', 'gallery');
    }
}

// ============================================
// ADMIN STATISTICS
// ============================================

async function loadAdminStats() {
    try {
        const [activities, announcements, gallery, contacts] = await Promise.all([
            API.activities.getAll().catch(() => []),
            API.announcements.getAll().catch(() => []),
            API.gallery.getAll().catch(() => []),
            API.contacts.getAll().catch(() => [])
        ]);

        document.getElementById('statActivities').textContent = activities.length || 0;
        document.getElementById('statAnnouncements').textContent = announcements.length || 0;
        document.getElementById('statGallery').textContent = gallery.length || 0;
        document.getElementById('statContacts').textContent = contacts.length || 0;

        console.log('Admin stats updated:', {
            activities: activities.length,
            announcements: announcements.length,
            gallery: gallery.length,
            contacts: contacts.length
        });
    } catch (error) {
        console.error('Error loading admin stats:', error);
    }
}