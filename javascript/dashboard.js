// ============================================
// DASHBOARD.JS - ADMIN PANEL FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

let currentUser = null;

async function initializeDashboard() {
    // Check if user is authenticated
    const session = authAPI.getSession();
    
    if (session) {
        // Show dashboard
        showDashboard();
        loadAllData();
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
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('signupPage').classList.remove('hidden');
        });
    }
    
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signupPage').classList.add('hidden');
            document.getElementById('loginPage').classList.remove('hidden');
        });
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
    
    // MEETING FORM
    const addMeetingForm = document.getElementById('addMeetingForm');
    if (addMeetingForm) {
        addMeetingForm.addEventListener('submit', handleAddMeeting);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('authMessage');
    
    try {
        message.textContent = 'جاري تسجيل الدخول...';
        const response = await authAPI.signIn(email, password);
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

async function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');
    
    try {
        message.textContent = 'جاري إنشاء الحساب...';
        const response = await authAPI.signUp(email, password);
        
        message.textContent = 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.';
        message.classList.remove('error');
        
        setTimeout(() => {
            document.getElementById('signupPage').classList.add('hidden');
            document.getElementById('loginPage').classList.remove('hidden');
        }, 1500);
    } catch (error) {
        message.textContent = 'خطأ في إنشاء الحساب. قد يكون البريد مستخدماً بالفعل.';
        message.classList.add('error');
    }
}

async function handleLogout() {
    await authAPI.signOut();
    currentUser = null;
    showLoginPage();
    document.getElementById('loginForm').reset();
    document.getElementById('signupForm').reset();
}

// ============================================
// PAGE SWITCHING
// ============================================

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('dashboardPage').classList.add('hidden');
}

function showDashboard() {
    const session = authAPI.getSession();
    if (session) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('dashboardPage').classList.remove('hidden');
        document.getElementById('userEmail').textContent = 'مدير النظام';
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
    } else if (section === 'meetings') {
        loadMeetings();
    }
}

// ============================================
// ACTIVITIES MANAGEMENT
// ============================================

async function loadAllData() {
    loadActivities();
    loadAnnouncements();
    loadMeetings();
}

async function loadActivities() {
    const container = document.getElementById('activitiesList');
    
    try {
        const activities = await activitiesAPI.getAll();
        
        if (activities.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد أنشطة حالياً</p>';
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="item">
                <div class="item-info">
                    <h4>${activity.title}</h4>
                    <p>📅 ${formatDate(activity.date)}</p>
                    <p>${truncateText(activity.description, 80)}</p>
                </div>
                <div class="item-actions">
                    <button class="item-edit" onclick="editActivity(${activity.id})">✏️ تعديل</button>
                    <button class="item-delete" onclick="deleteActivity(${activity.id})">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

async function handleAddActivity(e) {
    e.preventDefault();
    
    const title = document.getElementById('actTitle').value;
    const description = document.getElementById('actDesc').value;
    const date = document.getElementById('actDate').value;
    const imageFile = document.getElementById('actImage').files[0];
    
    try {
        let imageUrl = null;
        
        if (imageFile) {
            imageUrl = await storageAPI.uploadImage(imageFile);
        }
        
        await activitiesAPI.add({
            title,
            description,
            date,
            image_url: imageUrl,
        });
        
        // Reset form
        document.getElementById('addActivityForm').reset();
        
        // Reload activities
        loadActivities();
        
        alert('تم إضافة النشاط بنجاح!');
    } catch (error) {
        console.error('Error adding activity:', error);
        alert('حدث خطأ في إضافة النشاط');
    }
}

async function deleteActivity(id) {
    if (confirm('هل تريد حذف هذا النشاط؟')) {
        try {
            await activitiesAPI.delete(id);
            loadActivities();
            alert('تم حذف النشاط بنجاح!');
        } catch (error) {
            console.error('Error deleting activity:', error);
            alert('حدث خطأ في حذف النشاط');
        }
    }
}

function editActivity(id) {
    alert('ميزة التعديل ستتم إضافتها قريباً');
}

// ============================================
// ANNOUNCEMENTS MANAGEMENT
// ============================================

async function loadAnnouncements() {
    const container = document.getElementById('announcementsList');
    
    try {
        const announcements = await announcementsAPI.getAll();
        
        if (announcements.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد إعلانات حالياً</p>';
            return;
        }
        
        container.innerHTML = announcements.map(ann => `
            <div class="item">
                <div class="item-info">
                    <h4>${ann.title}</h4>
                    <p>📅 ${formatDate(ann.created_at)}</p>
                    <p>التصنيف: ${ann.category}</p>
                </div>
                <div class="item-actions">
                    <button class="item-delete" onclick="deleteAnnouncement(${ann.id})">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading announcements:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

async function handleAddAnnouncement(e) {
    e.preventDefault();
    
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const category = document.getElementById('annCategory').value;
    const fileInput = document.getElementById('annFile');
    
    try {
        let fileUrl = null;
        
        if (fileInput.files[0]) {
            fileUrl = await storageAPI.uploadImage(fileInput.files[0], 'school-files');
        }
        
        await announcementsAPI.add({
            title,
            content,
            category,
            file_url: fileUrl,
        });
        
        // Reset form
        document.getElementById('addAnnouncementForm').reset();
        
        // Reload announcements
        loadAnnouncements();
        
        alert('تم نشر الإعلان بنجاح!');
    } catch (error) {
        console.error('Error adding announcement:', error);
        alert('حدث خطأ في نشر الإعلان');
    }
}

async function deleteAnnouncement(id) {
    if (confirm('هل تريد حذف هذا الإعلان؟')) {
        try {
            await announcementsAPI.delete(id);
            loadAnnouncements();
            alert('تم حذف الإعلان بنجاح!');
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('حدث خطأ في حذف الإعلان');
        }
    }
}

// ============================================
// MEETINGS MANAGEMENT
// ============================================

async function loadMeetings() {
    const container = document.getElementById('meetingsList');
    
    try {
        const meetings = await meetingsAPI.getAll();
        
        if (meetings.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد اجتماعات مقررة حالياً</p>';
            return;
        }
        
        container.innerHTML = meetings.map(meeting => `
            <div class="item">
                <div class="item-info">
                    <h4>${meeting.subject}</h4>
                    <p>📅 ${formatDate(meeting.meeting_date)}</p>
                    <p>📍 ${meeting.location}</p>
                </div>
                <div class="item-actions">
                    <button class="item-delete" onclick="deleteMeeting(${meeting.id})">🗑️ حذف</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading meetings:', error);
        container.innerHTML = '<p class="loading">خطأ في تحميل البيانات</p>';
    }
}

async function handleAddMeeting(e) {
    e.preventDefault();
    
    const subject = document.getElementById('meetSubject').value;
    const meeting_date = document.getElementById('meetDate').value;
    const location = document.getElementById('meetLocation').value;
    const description = document.getElementById('meetDesc').value;
    
    try {
        await meetingsAPI.add({
            subject,
            meeting_date,
            location,
            description,
        });
        
        // Reset form
        document.getElementById('addMeetingForm').reset();
        
        // Reload meetings
        loadMeetings();
        
        alert('تم إضافة الاجتماع بنجاح!');
    } catch (error) {
        console.error('Error adding meeting:', error);
        alert('حدث خطأ في إضافة الاجتماع');
    }
}

async function deleteMeeting(id) {
    if (confirm('هل تريد حذف هذا الاجتماع؟')) {
        try {
            await meetingsAPI.delete(id);
            loadMeetings();
            alert('تم حذف الاجتماع بنجاح!');
        } catch (error) {
            console.error('Error deleting meeting:', error);
            alert('حدث خطأ في حذف الاجتماع');
        }
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
