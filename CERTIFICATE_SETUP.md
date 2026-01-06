# Setup Guide - Certificate Requests Feature

## Overview
This document outlines the changes made to add a Certificate Requests system to the school website.

## Changes Made

### 1. **Removed Sections**
- ❌ Teachers/Staff list section completely removed
- ❌ Timetables/Schedules section removed
- ✅ Removed navigation link to #teachers section

### 2. **Updated Activities Section**
Replaced 6 generic activities with 3 main activity categories:
1. **Technology Team Activities** - Digital projects, programming, robotics, website development
2. **Arabic Language Competition** - Scheduled for December 2025
3. **Qur'an Recitation Competition** - Scheduled for Ramadan 1446 (2026)

### 3. **New Certificate Submission Section**
Created a new "Certificate Submission" section (id="certificates") with:
- Public form for students/parents to submit certificate requests
- Clean, modern design consistent with website theme
- Form fields:
  - Student name
  - Student ID
  - Class level
  - Certificate type (5 options)
  - Parent name
  - Parent phone
  - Email
  - Request reason
  - Terms agreement

### 4. **Admin Dashboard Integration**
Added certificate management to admin dashboard:
- New "طلبات الشهادات" (Certificate Requests) tab
- View all certificate requests with details
- Filter by status (pending, approved, rejected, completed)
- Update request status
- Delete requests

## Files Modified

### HTML Files
- **index.html**
  - Removed Teachers link from navigation
  - Added Certificates link to navigation
  - Updated activities section with new content
  - Replaced Teachers & Schedule section with Certificate form
  - Added certificates.js script

- **dashboard.html**
  - Added Certificates tab to admin navigation
  - Added certificates management section

### JavaScript Files
- **javascript/supabase-client.js**
  - Added `API.certificates` object with CRUD operations
  - Methods: getAll(), create(), update(), delete()

- **javascript/certificates.js** (NEW)
  - Handles certificate form submission
  - Sends data to Supabase via API
  - Shows success/error messages

- **javascript/dashboard.js**
  - Added loadCertificateRequests() function
  - Added updateCertificateStatus() function
  - Added deleteCertificateRequest() function
  - Added getStatusLabel() helper function
  - Integrated certificates into switchSection()

### CSS Files
- **css/styles.css**
  - Added complete styling for certificate section
  - Added styling for certificate form
  - Added styling for info cards
  - Responsive design for mobile
  - Added certificate request card styling in dashboard

### Database Files
- **DATABASE_SETUP.sql** (UPDATED)
  - Added `certificate_requests` table schema
  - Table columns: id, student_name, student_id, class, certificate_type, parent_name, parent_phone, email, reason, status, notes, created_at, updated_at
  - Proper indexes and Row Level Security (RLS) policies

## Database Setup

Run this SQL in Supabase SQL Editor to create the certificate_requests table:

```sql
CREATE TABLE certificate_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  student_id TEXT NOT NULL,
  class TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cert_requests_email ON certificate_requests(email);
CREATE INDEX idx_cert_requests_status ON certificate_requests(status);
CREATE INDEX idx_cert_requests_student_id ON certificate_requests(student_id);

ALTER TABLE certificate_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert certificate requests" ON certificate_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select for all" ON certificate_requests
  FOR SELECT USING (true);
```

## Features

### Public-Facing
- Certificate request form in main website
- Professional form design
- Real-time validation
- Success/error messages
- Auto-generated request IDs

### Admin Dashboard
- View all certificate requests
- Filter by status
- Update request status (pending → approved → completed)
- Add internal notes
- Delete requests

### Colors & Design
- Kept existing color scheme: Blue (#1A73E8), Green (#2ECC71)
- Consistent with overall website design
- Responsive mobile-friendly layout
- Professional card-based design

## Testing Steps

1. **Test Certificate Form**
   - Navigate to certificate section on main site
   - Fill in all required fields
   - Submit form
   - Verify success message
   - Check Supabase for new entry

2. **Test Admin Dashboard**
   - Login to admin dashboard
   - Navigate to "طلبات الشهادات" tab
   - Verify certificate requests display
   - Test status updates
   - Test deletion

3. **Test Responsive Design**
   - View on mobile (< 768px)
   - Verify form layout
   - Verify button positioning

## Notes

- Form submissions go directly to Supabase `certificate_requests` table
- No email notifications configured yet (can be added later)
- Status transitions: pending → approved/rejected → completed
- All dates stored in ISO format
- Admin can add notes to each request

## Future Enhancements

- Email notifications to parents
- PDF certificate generation
- Email status updates to students
- Bulk export of requests
- Advanced filters and search
- Request tracking number for parents
