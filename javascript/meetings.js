// ============================================
// MEETINGS.JS - PUBLIC MEETINGS PAGE
// ============================================

let allMeetings = [];

document.addEventListener('DOMContentLoaded', function () {
    initializeMeetingsPage();
});

async function initializeMeetingsPage() {
    setupEventListeners();
    await loadMeetingsData();
}

function setupEventListeners() {
}

async function loadMeetingsData() {
    const container = document.getElementById('meetingsContainer');

    try {
        container.innerHTML = '<p class="loading">جاري تحميل الاجتماعات...</p>';

        allMeetings = await API.meetings.getAll();

        // Sort by upcoming meetings first
        allMeetings.sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date));

        if (allMeetings.length === 0) {
            container.innerHTML = '<p class="loading">لا توجد اجتماعات مقررة حالياً</p>';
            return;
        }

        renderMeetings(allMeetings);
    } catch (error) {
        console.error('Error loading meetings:', error);
        container.innerHTML = '<p class="loading">حدث خطأ في تحميل البيانات</p>';
    }
}

function renderMeetings(meetings) {
    const container = document.getElementById('meetingsContainer');

    if (meetings.length === 0) {
        container.innerHTML = '<p class="loading">لا توجد اجتماعات</p>';
        return;
    }

    // Separate upcoming and past meetings
    const now = new Date();
    const upcoming = meetings.filter(m => new Date(m.meeting_date) >= now);
    const past = meetings.filter(m => new Date(m.meeting_date) < now);

    let html = '';

    if (upcoming.length > 0) {
        html += '<h3 class="meetings-section-title">الاجتماعات القادمة</h3>';
        html += upcoming.map(meeting => createMeetingCard(meeting)).join('');
    }

    if (past.length > 0) {
        html += '<h3 class="meetings-section-title">الاجتماعات السابقة</h3>';
        html += past.map(meeting => createMeetingCard(meeting, true)).join('');
    }

    container.innerHTML = html;
}

function createMeetingCard(meeting, isPast = false) {
    const meetingDate = new Date(meeting.meeting_date);
    const isToday = isDateToday(meetingDate);
    const isTomorrow = isDateTomorrow(meetingDate);

    let dateDisplay = formatDate(meeting.meeting_date);

    if (isToday) {
        dateDisplay = 'اليوم - ' + formatTime(meeting.meeting_date);
    } else if (isTomorrow) {
        dateDisplay = 'غداً - ' + formatTime(meeting.meeting_date);
    }

    return `
        <div class="meeting-card ${isPast ? 'past' : 'upcoming'}">
            <div class="meeting-card-header">
                <h3>${meeting.subject}</h3>
                ${isPast ? '<span class="past-badge">انتهى</span>' : '<span class="upcoming-badge">قادم</span>'}
            </div>
            <div class="meeting-details">
                <p><strong>📅 التاريخ والوقت:</strong> ${dateDisplay}</p>
                <p><strong>📍 المكان:</strong> ${meeting.location}</p>
                ${meeting.description ? `<p><strong>📝 الوصف:</strong> ${meeting.description}</p>` : ''}
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG-u-nu-latn', options);
}

function formatTime(dateString) {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString('ar-EG-u-nu-latn', options);
}

function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

function isDateTomorrow(date) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear();
}
