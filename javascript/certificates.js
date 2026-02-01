// ============================================
// CERTIFICATE SUBMISSION HANDLER
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const certificateForm = document.getElementById('certificateForm');
    
    if (certificateForm) {
        certificateForm.addEventListener('submit', handleCertificateSubmit);
    }
});

async function handleCertificateSubmit(e) {
    e.preventDefault();
    
    const messageDiv = document.getElementById('certMessage');
    const form = e.target;
    
    // Get form data
    const formData = {
        first_name: document.getElementById('certFirstName').value,
        last_name: document.getElementById('certLastName').value,
        massar_number: document.getElementById('certMassarNumber').value,
        submission_date: document.getElementById('certDate').value,
        birth_date: document.getElementById('certBirthDate').value,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    try {
        messageDiv.textContent = 'جاري معالجة الطلب...';
        messageDiv.classList.remove('error', 'success');
        messageDiv.style.display = 'block';
        
        // Create certificate request
        const result = await API.certificates.create(formData);
        
        console.log('Certificate creation result:', result);
        
        // If no error was thrown, it's a success
        messageDiv.textContent = '✅ تم إرسال الطلب بنجاح! سيتم مراجعتك قريباً من قبل الإدارة.';
        messageDiv.classList.add('success');
        messageDiv.classList.remove('error');
        
        // Reset form
        form.reset();
    } catch (error) {
        console.error('Certificate submission error:', error);
        messageDiv.textContent = '❌ حدث خطأ في إرسال الطلب. يرجى المحاولة مرة أخرى.';
        messageDiv.classList.add('error');
        messageDiv.classList.remove('success');
        messageDiv.style.display = 'block';
    }
}
