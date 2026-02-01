# 🔐 Create Admin Accounts - Complete Guide

## ⚡ QUICKEST METHOD: Supabase Dashboard

### Step 1: Open Supabase
1. Go to: https://app.supabase.com
2. Click your project
3. Go to: **Authentication** → **Users** (left sidebar)

### Step 2: Create First Account
1. Click **"Add user"** button (top right, green button)
2. Fill in:
   - **Email**: `admin@school.com`
   - **Password**: `Admin@12345`
   - **Confirm Password**: `Admin@12345`
3. Click **"Create user"**

### Step 3: Create Second Account  
1. Click **"Add user"** again
2. Fill in:
   - **Email**: `teacher@school.com`
   - **Password**: `Teacher@12345`
   - **Confirm Password**: `Teacher@12345`
3. Click **"Create user"**

### Step 4: Test Login
1. Open [dashboard.html](dashboard.html)
2. You'll see the 2 account credentials displayed
3. Try logging in with `admin@school.com` / `Admin@12345`
4. Should work now! ✅

---

## 🔧 ALTERNATIVE: SQL Method (If dashboard doesn't work)

### Step 1: Go to SQL Editor
1. In Supabase: **SQL Editor** (left sidebar)
2. Click **"New Query"**

### Step 2: Copy and Paste SQL
Copy the SQL from [CREATE_2_ADMIN_ACCOUNTS.sql](CREATE_2_ADMIN_ACCOUNTS.sql)
- Use only the **SQL section** (after "ALTERNATIVE: Use SQL")
- Paste into the editor

### Step 3: Run the Query
1. Click **"Run"** button
2. Should show: 2 rows created

### Step 4: Test Login
1. Open [dashboard.html](dashboard.html)
2. Try logging in with:
   - `admin@school.com` / `Admin@12345`
   - `teacher@school.com` / `Teacher@12345`

---

## ✅ Verify Accounts Were Created

After creating accounts, verify in Supabase:
1. Go to **Authentication** → **Users**
2. You should see both:
   - `admin@school.com` ✓
   - `teacher@school.com` ✓

Both should have a green checkmark (email confirmed).

---

## 🚀 Login Flow

Once accounts are created:

```
Visit dashboard.html
        ↓
See login page with credentials displayed
        ↓
Enter: admin@school.com / Admin@12345
        ↓
Click "دخول"
        ↓
✅ Access dashboard!
```

---

## ⚠️ Troubleshooting

### "Email already exists" error
- Delete the old accounts first in Supabase → Authentication → Users
- Click the trash icon to delete them
- Then create new ones

### Still getting 500 error
- **Clear browser cache** (Ctrl+Shift+Delete)
- **Refresh page** (Ctrl+F5)
- Wait 30 seconds and try again

### Can't see the Users section
- Make sure you're in the right Supabase project
- Click **Authentication** in left sidebar
- Look for **Users** tab

---

## 📝 Account Details Cheat Sheet

**Admin Account:**
```
Email:    admin@school.com
Password: Admin@12345
Role:     Main Administrator
```

**Teacher Account:**
```
Email:    teacher@school.com  
Password: Teacher@12345
Role:     Teacher Administrator
```

---

## 🎉 Ready!

After accounts are created and verified:
1. Visit [dashboard.html](dashboard.html)
2. Login with either account
3. You'll have full access to the dashboard!

**Recommended first test**: Login with `admin@school.com`
