"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Briefcase, FolderOpen, Link as LinkIcon, Users, BookOpen, Phone } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { JobApplication, Resume, Document, Contact, RecruiterCall } from "@/types";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    resumes: 0,
    applications: 0,
    documents: 0,
    links: 0,
    contacts: 0,
    calls: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [resumes, applications, documents, links, contacts, calls] = await Promise.all([
          Storage.getResumes(),
          Storage.getJobApplications(),
          Storage.getDocuments(),
          Storage.getLinks(),
          Storage.getContacts(),
          Storage.getRecruiterCalls(),
        ]);

        setStats({
          resumes: resumes.length,
          applications: applications.length,
          documents: documents.length,
          links: links.length,
          contacts: contacts.length,
          calls: calls.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your Job Hunt Manager</p>
      </div>


      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatBox
          icon={<FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
          title="Resumes"
          value={stats.resumes}
          href="/resumes"
          color="blue"
        />
        <StatBox
          icon={<Briefcase className="h-8 w-8 text-green-600 dark:text-green-400" />}
          title="Applications"
          value={stats.applications}
          href="/applications"
          color="green"
        />
        <StatBox
          icon={<FolderOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
          title="Documents"
          value={stats.documents}
          href="/documents"
          color="purple"
        />
        <StatBox
          icon={<Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />}
          title="Contacts"
          value={stats.contacts}
          href="/contacts"
          color="orange"
        />
        <StatBox
          icon={<Phone className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
          title="Recruiter Calls"
          value={stats.calls}
          href="/calls"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionLink href="/resumes" icon={<FileText />} label="Upload Resume" />
          <QuickActionLink href="/applications" icon={<Briefcase />} label="Add Application" />
          <QuickActionLink href="/calls" icon={<Phone />} label="Add Call" />
          <QuickActionLink href="/learning" icon={<BookOpen />} label="Add Learning Item" />
        </div>
      </div>

      {/* Recent Applications */}
      <RecentApplications />
      
      {/* Recent Calls */}
      <RecentCalls />
    </div>
  );
}

function StatBox({
  icon,
  title,
  value,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 hover:shadow-lg transition-all cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{value}</p>
          </div>
          <div>{icon}</div>
        </div>
      </div>
    </Link>
  );
}

function QuickActionLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
    >
      <div className="text-gray-600 dark:text-gray-400 mr-3">{icon}</div>
      <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
    </Link>
  );
}

function RecentApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([]);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const apps = await Storage.getJobApplications();
        setApplications(apps.slice(0, 5).sort((a, b) => 
          new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
        ));
      } catch (error) {
        console.error('Failed to load applications:', error);
      }
    };
    loadApplications();
  }, []);

  if (applications.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Applications</h2>
        <p className="text-gray-500 dark:text-gray-400">No applications yet. Start applying!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Applications</h2>
        <Link href="/applications" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{app.companyName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{app.position}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(app.status)}`}>
                {app.status.replace("-", " ")}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(app.appliedDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    applied: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    "interview-scheduled": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    interviewed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    offer: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    "no-response": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
  };
  return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
}

function RecentCalls() {
  const [calls, setCalls] = useState<RecruiterCall[]>([]);

  useEffect(() => {
    const loadCalls = async () => {
      try {
        const allCalls = await Storage.getRecruiterCalls();
        setCalls(allCalls.slice(0, 5).sort((a, b) => 
          new Date(b.callDate + "T" + b.callTime).getTime() - new Date(a.callDate + "T" + a.callTime).getTime()
        ));
      } catch (error) {
        console.error('Failed to load calls:', error);
      }
    };
    loadCalls();
  }, []);

  if (calls.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Recent Recruiter Calls</h2>
        <p className="text-gray-500 dark:text-gray-400">No calls recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Recruiter Calls</h2>
        <Link href="/calls" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {calls.map((call) => (
          <div key={call.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-gray-100">{call.companyName}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {call.recruiterName && `${call.recruiterName} • `}
                {formatDate(call.callDate)} at {call.callTime}
              </p>
              {call.discussionNotes && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {call.discussionNotes}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <span className={`px-2 py-1 rounded text-xs ${
                call.followUpHappened
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
              }`}>
                {call.followUpHappened ? "Followed Up" : "Pending"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

