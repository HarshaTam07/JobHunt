# Database Migration Guide

## ✅ Completed Setup

1. ✅ Database schema created (`supabase/schema.sql`)
2. ✅ Supabase client configured (`lib/supabase.ts`)
3. ✅ API layer created (`lib/api.ts`)
4. ✅ Storage layer updated (`lib/storage.ts`)

## 📋 Next Steps

### Step 1: Run Database Schema

1. Go to Supabase Dashboard: https://lkeospinkuegymbgmplt.supabase.co
2. Navigate to **SQL Editor**
3. Copy contents of `supabase/schema.sql`
4. Paste and **Run** the SQL

### Step 2: Update Pages to Use Async Storage

All pages need to be updated to use async methods. Here's the pattern:

**Before (localStorage):**
```typescript
const loadResumes = () => {
  const stored = Storage.get<Resume[]>(STORAGE_KEYS.RESUMES) || [];
  setResumes(stored);
};

const handleFileUpload = () => {
  const updated = [...resumes, newResume];
  Storage.set(STORAGE_KEYS.RESUMES, updated);
  setResumes(updated);
};
```

**After (Supabase):**
```typescript
const loadResumes = async () => {
  try {
    const stored = await Storage.getResumes();
    setResumes(stored);
  } catch (error) {
    console.error('Failed to load resumes:', error);
  }
};

const handleFileUpload = async () => {
  try {
    const newResume = await Storage.setResume({
      name: resume.name,
      type: resume.type,
      fileUrl: resume.fileUrl,
      fileName: resume.fileName,
      uploadedAt: resume.uploadedAt,
      lastModified: resume.lastModified,
    });
    setResumes([...resumes, newResume]);
  } catch (error) {
    console.error('Failed to save resume:', error);
    alert('Failed to save resume. Please try again.');
  }
};
```

### Step 3: Pages to Update

- [ ] `app/page.tsx` (Dashboard)
- [ ] `app/resumes/page.tsx`
- [ ] `app/applications/page.tsx`
- [ ] `app/documents/page.tsx`
- [ ] `app/links/page.tsx`
- [ ] `app/contacts/page.tsx`
- [ ] `app/calls/page.tsx`
- [ ] `app/learning/page.tsx`

## 🔄 Migration Pattern

For each page:

1. Change `useEffect` to async:
   ```typescript
   useEffect(() => {
     loadData();
   }, []);
   
   const loadData = async () => {
     const data = await Storage.getXxx();
     setData(data);
   };
   ```

2. Update create handlers:
   ```typescript
   const handleCreate = async (newItem) => {
     try {
       const created = await Storage.setXxx(newItem);
       setItems([...items, created]);
     } catch (error) {
       alert('Failed to create. Please try again.');
     }
   };
   ```

3. Update update handlers:
   ```typescript
   const handleUpdate = async (id, updates) => {
     try {
       const updated = await Storage.updateXxx(id, updates);
       setItems(items.map(item => item.id === id ? updated : item));
     } catch (error) {
       alert('Failed to update. Please try again.');
     }
   };
   ```

4. Update delete handlers:
   ```typescript
   const handleDelete = async (id) => {
     if (confirm('Are you sure?')) {
       try {
         await Storage.deleteXxx(id);
         setItems(items.filter(item => item.id !== id));
       } catch (error) {
         alert('Failed to delete. Please try again.');
       }
     }
   };
   ```

## 🧪 Testing

After migration:
1. Test creating new items
2. Test updating existing items
3. Test deleting items
4. Verify data persists after page refresh
5. Check Supabase dashboard to see data in tables

## 🐛 Troubleshooting

- **Connection errors**: Check `.env.local` has correct credentials
- **RLS errors**: Verify policies are set correctly in Supabase
- **Type errors**: Ensure database column names match transformations in `lib/api.ts`

