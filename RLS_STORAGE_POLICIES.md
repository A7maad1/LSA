# Supabase Storage RLS Policies Setup

## QUICK FIX (Recommended for now):

If JWT token signing is giving you issues, the simplest solution is to **disable RLS** on the storage bucket:

1. Go to **Supabase Dashboard > Storage**
2. Click the **activities** bucket
3. Click the **Settings** tab
4. Toggle off **RLS (Row Level Security)**
5. Click **Save**

This will allow the anon key to upload images without needing JWT tokens. The app will continue to generate JWT tokens (for when you enable RLS later), but uploads will work immediately.

---

## ADVANCED (For Production - JWT Signature Verification):

If you want to keep RLS enabled and fix the JWT signature issue, run this SQL in your Supabase dashboard:

## Steps:

1. Go to your Supabase Dashboard
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the following SQL
5. Click **Run**

## SQL Policies

```sql
-- Allow authenticated users to upload to storage
CREATE POLICY "Allow authenticated users to upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activities');

-- Allow authenticated users to update their uploads
CREATE POLICY "Allow authenticated users to update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'activities')
WITH CHECK (bucket_id = 'activities');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated users to delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'activities');

-- Allow public read access to images
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'activities');
```

## What These Policies Do:

- **INSERT**: Authenticated users can upload images to the 'activities' bucket
- **UPDATE**: Authenticated users can modify their uploads
- **DELETE**: Authenticated users can delete their uploads
- **SELECT**: Anyone (public) can view/download the images

## After Running:

Your image uploads should now work! The app will:
1. Generate JWT tokens when users log in
2. Use these tokens to authenticate storage requests
3. Supabase will validate the JWT and allow the upload based on these policies

## If You Still Get Errors:

1. Make sure the 'activities' bucket exists in Storage
2. Verify RLS is **enabled** on the storage bucket (it should be)
3. Check that the policies were created successfully
4. Test with a fresh login (clear localStorage if needed)

