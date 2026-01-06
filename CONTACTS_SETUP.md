# إعداد نظام رسائل التواصل - Setup Contact Messages System

## خطوات الإعداد / Setup Steps

### 1. إنشاء جدول Contacts في Supabase / Create Contacts Table in Supabase

اتبع الخطوات التالية:
Follow these steps:

1. اذهب إلى **Supabase Dashboard** → اختر مشروعك
2. انقر على **SQL Editor** من الشريط الجانبي
3. انقر على **+ New Query**
4. انسخ والصق الكود التالي:

```sql
-- ============================================
-- CONTACTS TABLE
-- ============================================

-- Drop existing table if it exists
DROP TABLE IF EXISTS contacts CASCADE;

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);

-- Disable Row Level Security for testing
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
```

5. انقر على **Run** (الزر الأزرق)
6. يجب أن تظهر رسالة بأن الجدول تم إنشاؤه بنجاح

### 2. التحقق من أن الميزة تعمل / Verify the Feature Works

بعد إنشاء الجدول:

1. اذهب إلى **اختبار النظام**: `test-contacts.html`
   - هذه صفحة خاصة لاختبار أن كل شيء يعمل
   - جرب جميع الاختبارات الموجودة هناك
   - إذا فشل أي اختبار، ستحصل على رسالة خطأ واضحة

2. بعد تجاوز الاختبارات، جرب النظام الحقيقي:
   - اذهب إلى صفحة **اتصل بنا** (Contact Us) على الموقع
   - املأ النموذج وأرسل رسالة
   - اذهب إلى **لوحة الإدارة** (Dashboard) وتسجيل الدخول
   - انقر على **✉️ رسائل التواصل**
   - يجب أن تظهر رسالتك هناك

### 3. ميزات إدارة الرسائل / Message Management Features

في قسم رسائل التواصل، يمكنك:

- ✓ **عرض جميع الرسائل** - View all contact messages
- ✓ **وضع علامة "مقروء"** - Mark messages as read
- ✓ **تصفية الرسائل** - Filter by read/unread status
- ✓ **وضع علامة على الكل** - Mark all as read
- ✓ **حذف الرسائل** - Delete messages

### 4. معلومات تقنية / Technical Information

**الملفات المتعلقة:**
- `contact.html` - نموذج التواصل / Contact form
- `javascript/contact.js` - معالج النموذج / Form handler
- `javascript/dashboard.js` - إدارة الرسائل في لوحة الإدارة / Dashboard message management
- `javascript/supabase-client.js` - اتصال قاعدة البيانات / Database connection
- `css/dashboard.css` - تصميم قسم الرسائل / Message section styling
- `test-contacts.html` - صفحة اختبار النظام / System testing page

**مكان تخزين الرسائل:**
جدول `contacts` في Supabase مع الحقول:
- `id` - معرّف فريد / Unique ID
- `name` - اسم المُرسل / Sender's name
- `email` - بريد إلكتروني / Email address
- `phone` - رقم الهاتف (اختياري) / Phone number (optional)
- `subject` - الموضوع / Message subject
- `message` - نص الرسالة / Message text
- `is_read` - هل تم قراءة الرسالة / Read status
- `created_at` - التاريخ والوقت / Date and time

### 5. استكشاف الأخطاء / Troubleshooting

#### المشكلة: رسائل المتصل لا تظهر في لوحة التحكم
**Problem: Contact messages don't appear in dashboard**

**الحلول المحتملة:**

1. **تحقق من إنشاء الجدول:**
   ```
   ✓ اذهب إلى Supabase → Tables
   ✓ ابحث عن جدول "contacts"
   ✓ إذا لم تجده، قم بتشغيل الأمر SQL أعلاه
   ```

2. **استخدم صفحة الاختبار:**
   ```
   ✓ افتح: test-contacts.html
   ✓ اضغط على جميع الاختبارات بالترتيب
   ✓ اقرأ الأخطاء إن وجدت
   ```

3. **تحقق من متصفح أدوات المطور:**
   ```
   ✓ اضغط F12 (أو Ctrl+Shift+I)
   ✓ انقر على تبويب "Console"
   ✓ أرسل رسالة من صفحة التواصل
   ✓ ابحث عن أي رسائل خطأ باللون الأحمر
   ```

4. **تحقق من صلاحيات الجدول:**
   ```
   ✓ اذهب إلى Supabase → Authentication
   ✓ تأكد من أن Row Level Security (RLS) معطلة للجدول contacts
   ```

5. **إعادة تحميل الصفحة:**
   ```
   ✓ اضغط F5 لتحديث الصفحة
   ✓ تسجيل الخروج وتسجيل الدخول مرة أخرى
   ✓ حاول في متصفح مختلف
   ```

#### رسائل الخطأ الشائعة / Common Error Messages

| الخطأ | السبب | الحل |
|------|------|------|
| `Table "contacts" does not exist` | جدول contacts لم يتم إنشاؤه | شغل أمر SQL في Supabase |
| `relation "contacts" does not exist` | نفس الخطأ أعلاه | شغل أمر SQL في Supabase |
| `API.contacts is undefined` | ملفات JavaScript لم تحمّل بشكل صحيح | أعد تحميل الصفحة (F5) |
| `CORS error` | مشكلة في اتصال المجال | تحقق من إعدادات Supabase CORS |
| `401 Unauthorized` | مشكلة في المفتاح (API Key) | تحقق من SUPABASE_ANON_KEY |

### 6. خطوات التصحيح السريعة / Quick Fix Steps

إذا لم تظهر الرسائل:

1. **افتح** `test-contacts.html` وأكمل جميع الاختبارات
2. **تحقق** من سجل الخطأ في متصفح أدوات المطور (F12)
3. **أعد تحميل** الصفحة (F5)
4. **تأكد** من أن جدول contacts موجود في Supabase
5. **جرب** على متصفح مختلف أو وضع incognito/private

### 7. معلومات للمطورين / Developer Information

**كيفية إضافة رسائل التواصل:**
```javascript
// في contact.html
await API.contacts.insert({
    name: "اسم المستخدم",
    email: "email@example.com",
    phone: "0123456789",
    subject: "موضوع الرسالة",
    message: "نص الرسالة"
});
```

**كيفية استرجاع الرسائل:**
```javascript
// في dashboard.js
const messages = await API.contacts.getAll();
```

**كيفية تحديث حالة الرسالة:**
```javascript
await API.contacts.update(messageId, {
    is_read: true
});
```

**كيفية حذف رسالة:**
```javascript
await API.contacts.delete(messageId);
```

