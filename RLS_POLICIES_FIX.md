# Supabase RLS Policies - Delete Buttons Fix

## Problem
Delete buttons in Activities, Announcements, and Meetings sections are not working because Supabase Row-Level Security (RLS) policies are preventing anonymous users from deleting rows.

## Solution
Enable public DELETE permissions on the tables by adding RLS policies to Supabase.

### Steps to Fix:

1. **Go to Supabase Dashboard**
   - Navigate to: https://app.supabase.com
   - Select your project
   - Go to **Authentication > Policies**

2. **For each table (activities, announcements, meetings):**

   a. **Click on the table** in the left sidebar under "SQL Editor"
   
   b. **Enable RLS** (if not already enabled):
      - Click the table name
      - Go to "Authentication" tab
      - Toggle "Enable RLS" ON
   
   c. **Add DELETE Policy**:
      - Click "New Policy" or the (+) icon
      - Select "For DELETE to any"
      - Choose "Allow public access"
      - Or paste this SQL:

```sql
-- For activities table
CREATE POLICY "Allow public delete on activities"
ON activities
FOR DELETE
USING (true);

-- For announcements table
CREATE POLICY "Allow public delete on announcements"
ON announcements
FOR DELETE
USING (true);

-- For meetings table
CREATE POLICY "Allow public delete on meetings"
ON meetings
FOR DELETE
USING (true);
```

3. **Also add SELECT policy** (for reading data):

```sql
-- For activities table
CREATE POLICY "Allow public select on activities"
ON activities
FOR SELECT
USING (true);

-- For announcements table
CREATE POLICY "Allow public select on announcements"
ON announcements
FOR SELECT
USING (true);

-- For meetings table
CREATE POLICY "Allow public select on meetings"
ON meetings
FOR SELECT
USING (true);
```

4. **Also add INSERT and UPDATE policies** (for adding and editing):

```sql
-- For activities table
CREATE POLICY "Allow public insert on activities"
ON activities
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update on activities"
ON activities
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Same for announcements and meetings tables
```

## After Adding Policies:
- Delete buttons should work immediately
- Edit buttons will still show "Feature coming soon" alert (intentional)
- Reload the dashboard page in your browser (Ctrl+R or Cmd+R)

## If Still Not Working:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try deleting an item
4. Look for error messages with detailed information
5. Check Supabase logs: **Analytics > Error logs**

## Alternative: Disable RLS (Not Recommended for Production)
If you want to temporarily disable RLS for testing:
1. Go to table in Supabase Dashboard
2. Click the table name
3. Go to "Authentication" tab
4. Toggle "Enable RLS" OFF
5. **Re-enable it after testing** for security

---

**Note:** After fixing RLS, the delete buttons will work for all users. If you want to restrict deletion to authenticated admin users only, update the policies to check for user authentication instead of `true`.
