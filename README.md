# Job Hunt Manager

A comprehensive Next.js application to manage your entire job search process, from resume management to daily activity tracking.

## Features

### 📄 Resume Management
- Upload and manage multiple resume versions:
  - Java + Angular + AWS
  - Java + React + AWS
  - Pure Frontend Developer
  - QA / Automation Testing
  - .NET + React/Angular + AWS
  - AI + ML
- Download resumes anytime
- Organize by type

### 💼 Job Application Tracker
- Track all job applications with detailed information
- Filter by status (Applied, Interview Scheduled, Interviewed, Offer, Rejected, No Response)
- Store contact information, recruiter details, and notes
- Track follow-up dates

### 📁 Document Storage
- Store important documents:
  - Driving License
  - EAD / STEM EAD
  - AWS Certificates
  - LinkedIn Certificates
  - Other documents
- Organize by category
- Easy download access

### 🔗 Links & Resources
- Manage all important links:
  - Job Boards (LinkedIn, Indeed, Dice, Glassdoor)
  - Portfolio links
  - GitHub profile
  - Learning resources
  - Tools and certifications
- Categorized for easy access

### 👥 Contacts & References
- Manage professional network
- Separate references from regular contacts
- Store contact information, LinkedIn profiles, and notes
- Quick access to emails and phone numbers

### 📚 Learning & Interview Prep
- Track learning progress by category:
  - Java, React, Angular, AWS
  - Spring Boot, Python
  - System Design, LeetCode
  - Behavioral questions
- Status tracking (Not Started, In Progress, Completed)
- Add notes and resources

### 📊 Daily Activity Tracker
- Log daily activities:
  - Hours applying jobs (Target: 4h)
  - Hours learning (Target: 4h)
  - Hours interview prep (Target: 2h)
- Weekly summary statistics
- Progress visualization
- Total daily target: 10 hours

### 🎯 Dashboard
- Overview of all activities
- Quick statistics
- Recent applications
- Today's progress tracking

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Data Storage

Currently, the application uses browser localStorage to store all data. This means:
- Data persists in your browser
- Data is local to your device
- For production use, consider migrating to a database

## Project Structure

```
JobHunt/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── layout.tsx         # Main layout with navigation
│   ├── resumes/           # Resume management
│   ├── applications/      # Job application tracker
│   ├── documents/         # Document storage
│   ├── links/             # Links & resources
│   ├── contacts/          # Contacts & references
│   ├── learning/          # Learning & interview prep
│   └── activities/        # Daily activity tracker
├── lib/
│   ├── storage.ts         # LocalStorage utilities
│   └── utils.ts           # Helper functions
├── types/
│   └── index.ts           # TypeScript type definitions
└── public/                # Static assets
```

## Usage Tips

1. **Daily Routine**: Log your activities daily to track progress toward your 10-hour daily goal
2. **Resume Management**: Upload all resume versions and use the appropriate one for each application
3. **Application Tracking**: Add applications immediately after applying to maintain accurate records
4. **Learning Progress**: Update learning items as you progress to track your skill development
5. **Contacts**: Mark important contacts as references for easy access during applications

## Future Enhancements

- Database integration for cloud storage
- Export data to Excel/CSV
- Email integration for automatic application tracking
- Resume ATS checker integration
- Interview scheduling calendar
- Reminder notifications
- Data backup/restore functionality

## License

This project is for personal use.



lkeospinkuegymbgmplt
## Supabase Configuration

Supabase credentials are stored in `.env.local` file:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key

**Note:** Never commit `.env.local` to version control. It's already included in `.gitignore`.