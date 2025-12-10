-- Job Hunt Manager Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Resumes Table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('java-angular-aws', 'java-react-aws', 'pure-frontend', 'qa-automation', 'dotnet-react-aws', 'dotnet-angular-aws', 'ai-ml')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Applications Table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  position TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  applied_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('applied', 'interview-scheduled', 'interviewed', 'offer', 'rejected', 'no-response')),
  follow_up_date DATE,
  notes TEXT,
  recruiter_email TEXT,
  recruiter_phone TEXT,
  job_url TEXT,
  resume_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('driving-license', 'ead', 'stem-ead', 'aws-certificate', 'linkedin-certificate', 'other')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Links Table
CREATE TABLE IF NOT EXISTS links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('job-board', 'portfolio', 'github', 'linkedin', 'certification', 'learning', 'tool', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  role TEXT,
  company TEXT,
  notes TEXT,
  is_reference BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recruiter Calls Table
CREATE TABLE IF NOT EXISTS recruiter_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  recruiter_name TEXT,
  call_date DATE NOT NULL,
  call_time TIME NOT NULL,
  follow_up_happened BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,
  follow_up_notes TEXT,
  discussion_notes TEXT NOT NULL,
  recruiter_phone TEXT,
  recruiter_email TEXT,
  position TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'followed-up', 'no-follow-up')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Items Table
CREATE TABLE IF NOT EXISTS learning_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('java', 'react', 'angular', 'aws', 'spring-boot', 'python', 'system-design', 'leetcode', 'behavioral', 'other')),
  status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')) DEFAULT 'not-started',
  notes TEXT,
  started_date DATE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Prep Table (optional, for future use)
CREATE TABLE IF NOT EXISTS interview_prep (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('mock', 'behavioral', 'system-design', 'technical')),
  date DATE NOT NULL,
  notes TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes Table (simple text entries)
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todos Table
CREATE TABLE IF NOT EXISTS todos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Questions Table
CREATE TABLE IF NOT EXISTS interview_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT,
  category TEXT NOT NULL CHECK (category IN ('behavioral', 'technical')) DEFAULT 'technical',
  technology TEXT NOT NULL CHECK (technology IN ('java', 'react', 'angular', 'aws', 'spring-boot', 'python', 'javascript', 'typescript', 'nodejs', 'sql', 'system-design', 'data-structures', 'algorithms', 'leetcode', 'behavioral', 'html-css', 'docker', 'kubernetes', 'microservices', 'other')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
  tags TEXT,
  last_practiced_date DATE,
  times_practiced INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date ON job_applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_recruiter_calls_call_date ON recruiter_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_recruiter_calls_status ON recruiter_calls(status);
CREATE INDEX IF NOT EXISTS idx_contacts_is_reference ON contacts(is_reference);
CREATE INDEX IF NOT EXISTS idx_learning_items_status ON learning_items(status);
CREATE INDEX IF NOT EXISTS idx_learning_items_category ON learning_items(category);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_interview_questions_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_interview_questions_technology ON interview_questions(technology);
CREATE INDEX IF NOT EXISTS idx_interview_questions_difficulty ON interview_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_interview_questions_created_at ON interview_questions(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiter_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_prep ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
-- For now, we'll use anon key, so we'll allow public access
-- In production, you should restrict this to authenticated users only

-- Resumes policies
CREATE POLICY "Allow all operations on resumes" ON resumes
  FOR ALL USING (true) WITH CHECK (true);

-- Job Applications policies
CREATE POLICY "Allow all operations on job_applications" ON job_applications
  FOR ALL USING (true) WITH CHECK (true);

-- Documents policies
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true) WITH CHECK (true);

-- Links policies
CREATE POLICY "Allow all operations on links" ON links
  FOR ALL USING (true) WITH CHECK (true);

-- Contacts policies
CREATE POLICY "Allow all operations on contacts" ON contacts
  FOR ALL USING (true) WITH CHECK (true);

-- Recruiter Calls policies
CREATE POLICY "Allow all operations on recruiter_calls" ON recruiter_calls
  FOR ALL USING (true) WITH CHECK (true);

-- Learning Items policies
CREATE POLICY "Allow all operations on learning_items" ON learning_items
  FOR ALL USING (true) WITH CHECK (true);

-- Interview Prep policies
CREATE POLICY "Allow all operations on interview_prep" ON interview_prep
  FOR ALL USING (true) WITH CHECK (true);

-- Notes policies
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

-- Todos policies
CREATE POLICY "Allow all operations on todos" ON todos
  FOR ALL USING (true) WITH CHECK (true);

-- Interview Questions policies
CREATE POLICY "Allow all operations on interview_questions" ON interview_questions
  FOR ALL USING (true) WITH CHECK (true);

