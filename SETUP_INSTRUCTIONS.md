# 🚀 Complete Setup Instructions

## Prerequisites
- ✅ Supabase account created
- ✅ `.env.local` file with credentials

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Create Database Schema

1. Open your Supabase Dashboard: https://lkeospinkuegymbgmplt.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `supabase/schema.sql` from this project
5. Copy the entire SQL content
6. Paste it into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

**Expected Result:**
- ✅ 8 tables created
- ✅ Indexes created
- ✅ RLS policies enabled

## Step 3: Verify Database Setup

1. In Supabase Dashboard, go to **Table Editor**
2. You should see these tables:
   - ✅ resumes
   - ✅ job_applications
   - ✅ documents
   - ✅ links
   - ✅ contacts
   - ✅ recruiter_calls
   - ✅ learning_items
   - ✅ interview_prep

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Test the Application

1. Open http://localhost:3000
2. Try creating a resume, application, or call
3. Check Supabase Dashboard → Table Editor to see the data

## 📊 Database Schema Overview

### Tables Created:

1. **resumes** - Store resume files and metadata
2. **job_applications** - Track job applications
3. **documents** - Store important documents
4. **links** - Manage important links
5. **contacts** - Store contacts and references
6. **recruiter_calls** - Track recruiter phone calls
7. **learning_items** - Track learning progress
8. **interview_prep** - Interview preparation notes

### Features:

- ✅ UUID primary keys
- ✅ Timestamps (created_at, updated_at)
- ✅ Data validation with CHECK constraints
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Public access policies (for development)

## 🔒 Security Notes

**Current Setup (Development):**
- RLS policies allow public access
- Using anon key (safe for client-side)

**For Production:**
1. Enable Supabase Authentication
2. Update RLS policies to require authentication
3. Use service role key only on server-side
4. Never expose service role key in client code

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Restart dev server after adding env variables

### "relation does not exist"
- Run the schema.sql in Supabase SQL Editor
- Verify tables were created in Table Editor

### "new row violates row-level security policy"
- Check RLS policies in Supabase Dashboard
- Verify policies allow the operation you're trying

### Data not showing
- Check browser console for errors
- Verify data exists in Supabase Table Editor
- Check network tab for API errors

## 📝 Next Steps

After database is set up, the application will automatically:
- ✅ Connect to Supabase
- ✅ Store all data in database
- ✅ Sync across devices
- ✅ Persist data permanently

No more localStorage! Everything is now in the cloud database.

