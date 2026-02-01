# 🔐 Login Setup Guide

## Quick Start

Your login system is now fully operational! Follow these steps to set it up:

### Step 1: Create Admin Account

1. **Open** [create-admin.html](create-admin.html)
2. **Enter your email**: `admin@school.com` (or your preferred email)
3. **Enter password**: At least 8 characters (e.g., `Admin@12345`)
4. **Confirm password**: Re-enter the same password
5. **Click**: "إنشاء الحساب" (Create Account)

**Example Credentials:**
```
Email: admin@school.com
Password: Admin@12345
```

### Step 2: Login to Dashboard

1. **Open** [dashboard.html](dashboard.html)
2. **Email**: `admin@school.com`
3. **Password**: `Admin@12345`
4. **Click**: "دخول" (Login)

### Step 3: Use Dashboard

After login, you can:
- ✅ Manage Activities
- ✅ Manage Announcements  
- ✅ View Certificates
- ✅ Manage Gallery
- ✅ View Contact Messages

---

## 🔍 How the Login System Works

### Architecture

```
Dashboard Login (dashboard.html)
    ↓
authManager.signIn() [auth.js]
    ↓
Supabase Auth API
    ↓
Password Verification & Session Created
    ↓
Access to Dashboard Features
```

### Data Flow

1. **User enters credentials** → email + password
2. **Validation** → Email format, password length
3. **API Call** → POST to Supabase Auth endpoint
4. **Authentication** → Supabase verifies credentials
5. **Session Storage** → Token saved in localStorage
6. **Dashboard Access** → User can access admin features

### Session Management

- **Session Token**: Stored in `lsa_auth_session` (localStorage)
- **Auth Token**: Stored in `lsa_auth_token` (localStorage)
- **Duration**: 1 hour (configurable in auth.js)
- **Auto-logout**: When token expires

---

## ⚠️ Troubleshooting

### Error: "البريد الإلكتروني أو كلمة المرور غير صحيحة"
**Meaning**: Email or password is incorrect

**Solutions:**
1. ✅ Make sure you created an account first ([create-admin.html](create-admin.html))
2. ✅ Check that email matches exactly
3. ✅ Verify password is correct (case-sensitive)
4. ✅ Clear browser cache and try again

### Error: "500 Internal Server Error"
**Meaning**: Supabase Auth endpoint is not responding correctly

**Solutions:**
1. ✅ Check Supabase is running and accessible
2. ✅ Verify SUPABASE_URL and SUPABASE_ANON_KEY are correct
3. ✅ Create a new admin account

### "authManager is not defined"
**Meaning**: Scripts didn't load in correct order

**Solution**: Clear browser cache and reload dashboard.html

---

## 🛠️ File Locations

| File | Purpose |
|------|---------|
| [create-admin.html](create-admin.html) | Setup page to create first admin account |
| [dashboard.html](dashboard.html) | Main admin dashboard with login |
| [javascript/auth.js](javascript/auth.js) | Authentication logic (signIn, signUp, etc.) |
| [javascript/supabase-client.js](javascript/supabase-client.js) | Supabase client initialization |
| [javascript/dashboard.js](javascript/dashboard.js) | Dashboard UI and event handlers |

---

## 🔒 Security Notes

- ✅ Passwords are sent securely to Supabase Auth
- ✅ Session tokens expire after 1 hour
- ✅ LocalStorage is used for session persistence
- ✅ No passwords are stored in browser (only tokens)

---

## 📞 For Support

If you encounter issues:

1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Verify Supabase credentials are correct
4. Try creating a new admin account
5. Clear browser cache

---

**Status**: ✅ Login system is operational and ready to use!
