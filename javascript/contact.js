// ============================================
// CONTACT.JS - CONTACT PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeContactPage();
});

function initializeContactPage() {
    setupEventListeners();
}

function setupEventListeners() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

async function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    // Validation
    if (!validateForm(name, email, phone, subject, message)) {
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = e.target.querySelector('button');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';
        
        // In a real scenario, you would send this to your backend
        // For now, we'll just show a success message
        console.log('Contact form data:', {
            name,
            email,
            phone,
            subject,
            message,
            submittedAt: new Date().toISOString()
        });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // Restore button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('حدث خطأ في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    }
}

function validateForm(name, email, phone, subject, message) {
    const messageContainer = document.getElementById('formMessage');
    
    // Clear previous message
    messageContainer.innerHTML = '';
    
    // Name validation
    if (!name || name.length < 2) {
        showErrorMessage('يرجى إدخال الاسم بشكل صحيح', messageContainer);
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showErrorMessage('يرجى إدخال بريد إلكتروني صحيح', messageContainer);
        return false;
    }
    
    // Phone validation (optional, but if provided should be valid)
    if (phone && !/^\d{10,}$/.test(phone.replace(/\s/g, ''))) {
        showErrorMessage('يرجى إدخال رقم هاتف صحيح', messageContainer);
        return false;
    }
    
    // Subject validation
    if (!subject || subject.length < 3) {
        showErrorMessage('يرجى إدخال الموضوع بشكل صحيح', messageContainer);
        return false;
    }
    
    // Message validation
    if (!message || message.length < 10) {
        showErrorMessage('يرجى إدخال الرسالة بشكل صحيح (10 أحرف على الأقل)', messageContainer);
        return false;
    }
    
    return true;
}

function showErrorMessage(message, container) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message error';
    messageDiv.textContent = message;
    container.appendChild(messageDiv);
}

function showSuccessMessage() {
    const messageContainer = document.getElementById('formMessage');
    messageContainer.innerHTML = '';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'form-message success';
    messageDiv.textContent = '✓ تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.';
    messageContainer.appendChild(messageDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (messageContainer.contains(messageDiv)) {
            messageDiv.remove();
        }
    }, 5000);
}
