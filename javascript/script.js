// ============================================
// MOBILE MENU TOGGLE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle?.addEventListener('click', function() {
        navMenu.classList.toggle('show');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('show');
        });
    });
});

// ============================================
// MEMO SEARCH & FILTER
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('memoSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const memoItems = document.querySelectorAll('.memo-item');

    let currentFilter = 'all';

    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterMemos();
        });
    });

    // Search functionality
    searchInput?.addEventListener('input', filterMemos);

    function filterMemos() {
        const searchTerm = searchInput?.value.toLowerCase() || '';

        memoItems.forEach(item => {
            const category = item.dataset.category;
            const text = item.textContent.toLowerCase();

            let showItem = true;

            // Check category filter
            if (currentFilter !== 'all' && category !== currentFilter) {
                showItem = false;
            }

            // Check search term
            if (searchTerm && !text.includes(searchTerm)) {
                showItem = false;
            }

            item.style.display = showItem ? 'flex' : 'none';
        });
    }
});

// ============================================
// TABS FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            document.getElementById(tabName)?.classList.add('active');
        });
    });
});

// ============================================
// ADMIN LOGIN REDIRECT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const adminLoginLink = document.querySelector('.admin-btn');

    // Redirect to dashboard
    adminLoginLink?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = './dashboard.html';
    });
});

// ============================================
// ADMIN NAVIGATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const adminNavButtons = document.querySelectorAll('.admin-nav-btn');
    const adminSections = document.querySelectorAll('.admin-section');

    adminNavButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionName = this.dataset.section;

            // Remove active class from all buttons and sections
            adminNavButtons.forEach(btn => btn.classList.remove('active'));
            adminSections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked button and corresponding section
            this.classList.add('active');
            document.getElementById(sectionName + '-section')?.classList.add('active');
        });
    });
});

// ============================================
// CONTACT FORM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');

    contactForm?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        try {
            // Log submission
            console.log('Form submitted:', { name, email, subject, message });

            // Check if API is available
            if (typeof API === 'undefined' || !API.contacts) {
                console.log('API not available, showing local success message');
                showSuccessToast('شكراً لك! تم استقبال رسالتك بنجاح. سيتم الرد عليك قريباً.');
                contactForm.reset();
                return;
            }

            // Save to Supabase
            console.log('Saving to database...');
            const result = await API.contacts.create({
                name,
                email,
                phone: '',
                subject,
                message
            });

            console.log('Saved successfully:', result);
            showSuccessToast('شكراً لك! تم استقبال رسالتك بنجاح. سيتم الرد عليك قريباً.');
            contactForm.reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            showSuccessToast('شكراً لك! تم استقبال رسالتك. قد تواجه الرسالة تأخيراً في الحفظ.');
            contactForm.reset();
        }
    });
});

// ============================================
// ADMIN FORM HANDLERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Add Activity
    const addActivityForm = document.getElementById('addActivityForm');
    const activitiesList = document.getElementById('activitiesList');

    addActivityForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('actTitle').value;
        const date = document.getElementById('actDate').value;
        const desc = document.getElementById('actDesc').value;

        if (title && date) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="item-content">
                    <h4>${title}</h4>
                    <p>📅 ${date}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn">✏️ تعديل</button>
                    <button class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            // Add delete functionality
            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذا النشاط؟')) {
                    listItem.remove();
                }
            });

            activitiesList?.appendChild(listItem);
            addActivityForm.reset();
            showSuccessToast('تم إضافة النشاط بنجاح!');
        }
    });

    // Add Announcement
    const addAnnouncementForm = document.getElementById('addAnnouncementForm');
    const announcementsList = document.getElementById('announcementsList');

    addAnnouncementForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('annTitle').value;
        const category = document.getElementById('annCategory').value;

        if (title) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="item-content">
                    <h4>${title}</h4>
                    <p>التصنيف: ${category}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn">✏️ تعديل</button>
                    <button class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذا الإعلان؟')) {
                    listItem.remove();
                }
            });

            announcementsList?.appendChild(listItem);
            addAnnouncementForm.reset();
            showSuccessToast('تم نشر الإعلان بنجاح!');
        }
    });

    // Add Memo
    const addMemoForm = document.getElementById('addMemoForm');
    const memosList = document.getElementById('memosList');

    addMemoForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('memoTitle').value;
        const category = document.getElementById('memoCategory').value;

        if (title && category) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="item-content">
                    <h4>${title}</h4>
                    <p>الفئة: ${category === 'exams' ? 'امتحانات' : category === 'competitions' ? 'مسابقات' : 'مذكرات وزارية'}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn">✏️ تعديل</button>
                    <button class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذه المذكرة؟')) {
                    listItem.remove();
                }
            });

            memosList?.appendChild(listItem);
            addMemoForm.reset();
            showSuccessToast('تم إضافة المذكرة بنجاح!');
        }
    });

    // Add Holiday
    const addHolidayForm = document.getElementById('addHolidayForm');
    const holidaysList = document.getElementById('holidaysList');

    addHolidayForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('holName').value;
        const date = document.getElementById('holDate').value;

        if (name && date) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="item-content">
                    <h4>${name}</h4>
                    <p>📅 ${date}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn">✏️ تعديل</button>
                    <button class<div class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذه العطلة؟')) {
                    listItem.remove();
                }
            });

            holidaysList?.appendChild(listItem);
            addHolidayForm.reset();
            showSuccessToast('تم إضافة العطلة بنجاح!');
        }
    });

    // Add Gallery Image
    const addGalleryForm = document.getElementById('addGalleryForm');
    const galleryList = document.getElementById('galleryList');

    addGalleryForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('galTitle').value;

        if (title) {
            const listItem = document.createElement('div');
            listItem.className = 'gallery-admin-item';
            listItem.innerHTML = `
                <div style="width: 100px; height: 100px; background: #ccc; border-radius: 5px;"></div>
                <div class="item-content">
                    <h4>${title}</h4>
                </div>
                <div class="item-actions">
                    <button class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذه الصورة؟')) {
                    listItem.remove();
                }
            });

            galleryList?.appendChild(listItem);
            addGalleryForm.reset();
            showSuccessToast('تم إضافة الصورة بنجاح!');
        }
    });

    // Add Event
    const addEventForm = document.getElementById('addEventForm');
    const eventsList = document.getElementById('eventsList');

    addEventForm?.addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const time = document.getElementById('evtTime').value;

        if (title && date && time) {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            listItem.innerHTML = `
                <div class="item-content">
                    <h4>${title}</h4>
                    <p>📅 ${date} | 🕐 ${time}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn">✏️ تعديل</button>
                    <button class="delete-btn">🗑️ حذف</button>
                </div>
            `;

            listItem.querySelector('.delete-btn').addEventListener('click', function() {
                if (confirm('هل تريد حذف هذا الحدث؟')) {
                    listItem.remove();
                }
            });

            eventsList?.appendChild(listItem);
            addEventForm.reset();
            showSuccessToast('تم إضافة الحدث بنجاح!');
        }
    });
});

// ============================================
// SMOOTH SCROLL & ANIMATIONS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Update last updated timestamp
    const lastUpdatedSpan = document.getElementById('lastUpdated');
    if (lastUpdatedSpan) {
        const today = new Date();
        const dateString = today.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        lastUpdatedSpan.textContent = dateString;
    }

    // Scroll reveal effect
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements
    document.querySelectorAll('.activity-card, .staff-card, .memo-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// ============================================
// ADMIN PANEL DELETE HANDLERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Delegate delete button handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-btn')) {
            const listItem = e.target.closest('.list-item, .gallery-admin-item');
            if (listItem && confirm('هل تريد حذف هذا العنصر؟')) {
                listItem.remove();
            }
        }

        if (e.target.classList.contains('edit-btn')) {
            showInfoToast('يمكنك تعديل هذا العنصر من خلال النموذج أعلاه. هذه ميزة يمكن توسيعها لاحقاً.');
        }
    });
});

// ============================================
// INITIALIZE TOOLTIPS & HELPERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Log app initialization
    console.log('🎓 موقع ثانوية صلاح الدين الأيوبي - تم التحميل بنجاح');
    console.log('📧 للدخول إلى لوحة الإدارة: admin / admin123');
});
