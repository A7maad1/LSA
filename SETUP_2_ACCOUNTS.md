# 🔐 2 Pre-Created Admin Accounts Setup

## Quick Summary

Your system now has **2 pre-created accounts** that can be used immediately. No account creation interface exists.

---

## Account Details

### Account 1: Main Administrator
```
Email:    admin@school.com
Password: Admin@12345
Role:     مسؤول رئيسي (Main Admin)
```

### Account 2: Teacher Administrator  
```
Email:    teacher@school.com
Password: Teacher@12345
Role:     مسؤول معلمين (Teacher Admin)
```

---

## How to Setup

### Step 1: Create Accounts in Supabase

1. **Open Supabase Dashboard** at https://app.supabase.com
2. **Navigate to**: Your Project → SQL Editor
3. **Copy and paste** the SQL from [CREATE_2_ADMIN_ACCOUNTS.sql](CREATE_2_ADMIN_ACCOUNTS.sql)
4. **Click**: "Run" button
5. **Verify**: You should see "2 rows" affected

### Step 2: Login to Dashboard

1. **Open**: [dashboard.html](dashboard.html)
2. **You'll see the 2 available accounts displayed**
3. **Enter credentials** for either account
4. **Click**: "دخول" (Login)

### Step 3: Use the Dashboard

Once logged in, you can:
- ✅ Manage Activities
- ✅ Manage Announcements
- ✅ View Certificates
- ✅ Manage Gallery
- ✅ View Contact Messages
- ✅ Logout (back to login screen)

---

## What Changed

| Item | Before | After |
|------|--------|-------|
| Account Creation | Create button on login | ❌ Removed |
| Signup Page | Visible | ❌ Hidden |
| Pre-existing Accounts | None | ✅ 2 accounts |
| User Selection | N/A | ✅ Shown on login |

---

## SQL Script Explanation

The SQL script does:

1. **Creates 2 users** in Supabase Auth schema
2. **Hashes passwords** using bcrypt encryption (`crypt` function)
3. **Sets email_confirmed_at** so accounts are active
4. **Adds metadata** (role and name in Arabic)
5. **Verifies** accounts were created correctly

---

## Troubleshooting

### Cannot Login
**Issue**: SQL script wasn't run or failed
**Solution**: Check Supabase SQL Editor for errors, run script again

### "Database error querying schema"
**Issue**: Supabase Auth tables not configured
**Solution**: Verify Supabase project is set up correctly

### Wrong Credentials  
**Issue**: Email or password incorrect
**Solution**: Check dashboard.html - credentials are shown on login page

---

## Changing Passwords (Optional)

To change a password, run this SQL:

```sql
-- Change admin@school.com password to NewPassword@123
UPDATE auth.users 
SET encrypted_password = crypt('NewPassword@123', gen_salt('bf'))
WHERE email = 'admin@school.com';

-- Change teacher@school.com password to TeacherNew@123
UPDATE auth.users 
SET encrypted_password = crypt('TeacherNew@123', gen_salt('bf'))
WHERE email = 'teacher@school.com';
```

---

## Files Changed

- ✅ [dashboard.html](dashboard.html) - Removed signup page, shows account credentials
- ✅ [javascript/dashboard.js](javascript/dashboard.js) - Removed signup handlers
- ✅ [CREATE_2_ADMIN_ACCOUNTS.sql](CREATE_2_ADMIN_ACCOUNTS.sql) - SQL script to create accounts
- ✅ [create-admin.html](create-admin.html) - No longer needed

---

## Ready to Use! 🎉

1. Run the SQL script from Supabase
2. Visit [dashboard.html](dashboard.html)
3. Login with either account
4. Start managing your school data!
