# Supabase Database Setup

## Step 1: Create Database Schema

1. Go to your Supabase Dashboard: https://lkeospinkuegymbgmplt.supabase.co
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/schema.sql`
5. Click **Run** to execute the SQL

This will create:
- All necessary tables (resumes, job_applications, documents, links, contacts, recruiter_calls, learning_items, interview_prep)
- Indexes for better performance
- Row Level Security (RLS) policies
- All constraints and validations

## Step 2: Verify Tables

After running the schema, verify the tables were created:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all 8 tables listed:
   - resumes
   - job_applications
   - documents
   - links
   - contacts
   - recruiter_calls
   - learning_items
   - interview_prep

## Step 3: Test Connection

The application will automatically connect to Supabase using the credentials in `.env.local`.

## Security Notes

⚠️ **Important**: The current RLS policies allow public access (for development). 

For production, you should:
1. Enable authentication in Supabase
2. Update RLS policies to only allow authenticated users
3. Use service role key for server-side operations (never expose this in client code)

## Troubleshooting

If you encounter errors:
1. Check that `.env.local` has the correct Supabase URL and anon key
2. Verify all tables were created successfully
3. Check the Supabase logs in the Dashboard
4. Ensure RLS policies are enabled and configured correctly

