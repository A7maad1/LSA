// ============================================
// CONTACT.JS - CONTACT PAGE FUNCTIONALITY
// Handles contact form submission and validation
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeContactPage();
});

/**
 * Initialize contact page
 */
function initializeContactPage() {
    setupEventListeners();
}

/**
 * Setup event listeners for contact page
 */
function setupEventListeners() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
}

/**
 * Handle contact form submission
 * @param {Event} e - Form submission event
 */
async function handleContactFormSubmit(e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('contactName')?.value.trim() || '';
    const email = document.getElementById('contactEmail')?.value.trim() || '';
    const phone = document.getElementById('contactPhone')?.value.trim() || '';
    const subject = document.getElementById('contactSubject')?.value.trim() || '';
    const message = document.getElementById('contactMessage')?.value.trim() || '';

    // Validate form using ValidationUtils
    const rules = {
        name: {
            required: true,
            minLength: AppConfig.validation.name.minLength,
            maxLength: AppConfig.validation.name.maxLength
        },
        email: {
            required: true,
            type: 'email',
            maxLength: AppConfig.validation.email.maxLength
        },
        phone: {
            required: false,
            type: 'phone'
        },
        subject: {
            required: true,
            minLength: 3,
            maxLength: AppConfig.validation.title.maxLength
        },
        message: {
            required: true,
            minLength: AppConfig.validation.message.minLength,
            maxLength: AppConfig.validation.message.maxLength
        }
    };

    const { isValid, errors } = ValidationUtils.validateForm(
        { name, email, phone, subject, message },
        rules
    );

    if (!isValid) {
        const errorMsg = ValidationUtils.getErrorMessage(errors);
        new Toast(errorMsg, 'error');
        displayValidationErrors(errors);
        return;
    }

    await submitContactForm(e.target, { name, email, phone, subject, message });
}

/**
 * Submit contact form to API
 * @param {HTMLFormElement} form - Form element
 * @param {object} contactData - Contact form data
 */
async function submitContactForm(form, contactData) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري الإرسال...';

        // Check if API is available
        if (typeof API === 'undefined' || !API.contacts) {
            throw new Error('نظام الرسائل غير متاح في الوقت الحالي');
        }

        // Save to Supabase
        const result = await API.contacts.create(contactData);

        if (result) {
            // Show success message
            new Toast('تم إرسال الرسالة بنجاح! سنتواصل معك قريباً.', 'success');

            // Reset form
            form.reset();
        } else {
            throw new Error('لم يتم حفظ الرسالة');
        }

    } catch (error) {
        console.error('Error submitting contact form:', error);
        const errorMessage = error.message || AppConfig.getErrorMessage('networkError');
        new Toast(errorMessage, 'error');
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Display validation errors under form fields
 * @param {object} errors - Validation errors
 */
function displayValidationErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.remove());

    // Display new errors
    for (const [field, message] of Object.entries(errors)) {
        const input = document.getElementById(`contact${field.charAt(0).toUpperCase() + field.slice(1)}`);
        if (input) {
            const errorEl = document.createElement('div');
            errorEl.className = 'form-error';
            errorEl.textContent = message;
            errorEl.style.color = 'var(--error-color, #E74C3C)';
            errorEl.style.fontSize = '12px';
            errorEl.style.marginTop = '4px';
            input.parentElement?.appendChild(errorEl);
        }
    }
}

/**
 * Validate contact form (deprecated - use ValidationUtils instead)
 * @deprecated Use ValidationUtils.validateForm instead
 */
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
