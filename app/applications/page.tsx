"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink, Filter } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { JobApplication, ApplicationStatus } from "@/types";
import { formatDate, getStatusColor } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
  const [formData, setFormData] = useState<Partial<JobApplication>>({
    companyName: "",
    position: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
    appliedDate: new Date().toISOString().split("T")[0],
    status: "applied",
    notes: "",
    recruiterEmail: "",
    recruiterPhone: "",
    jobUrl: "",
  });

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const stored = await Storage.getJobApplications();
      setApplications(stored);
    } catch (error) {
      console.error('Failed to load applications:', error);
      alert('Failed to load applications. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateJobApplication(editingId, formData);
        setApplications(applications.map((app) => app.id === editingId ? updated : app));
        setEditingId(null);
      } else {
        const newApp = await Storage.setJobApplication({
          companyName: formData.companyName || "",
          position: formData.position || "",
          contactPerson: formData.contactPerson || "",
          contactEmail: formData.contactEmail || "",
          contactPhone: formData.contactPhone,
          appliedDate: formData.appliedDate || new Date().toISOString().split("T")[0],
          status: formData.status || "applied",
          followUpDate: formData.followUpDate,
          notes: formData.notes || "",
          recruiterEmail: formData.recruiterEmail,
          recruiterPhone: formData.recruiterPhone,
          jobUrl: formData.jobUrl,
          resumeUsed: formData.resumeUsed,
        });
        setApplications([...applications, newApp]);
      }
      setShowForm(false);
      setFormData({
        companyName: "",
        position: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        appliedDate: new Date().toISOString().split("T")[0],
        status: "applied",
        notes: "",
        recruiterEmail: "",
        recruiterPhone: "",
        jobUrl: "",
      });
    } catch (error) {
      console.error('Failed to save application:', error);
      alert('Failed to save application. Please try again.');
    }
  };

  const handleEdit = (app: JobApplication) => {
    setFormData(app);
    setEditingId(app.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this application?")) {
      try {
        await Storage.deleteJobApplication(id);
        setApplications(applications.filter((app) => app.id !== id));
      } catch (error) {
        console.error('Failed to delete application:', error);
        alert('Failed to delete application. Please try again.');
      }
    }
  };

  const filteredApplications = filterStatus === "all"
    ? applications
    : applications.filter((app) => app.status === filterStatus);

  const statusOptions: ApplicationStatus[] = [
    "applied",
    "interview-scheduled",
    "interviewed",
    "offer",
    "rejected",
    "no-response",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Job Applications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track all your job applications</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              companyName: "",
              position: "",
              contactPerson: "",
              contactEmail: "",
              contactPhone: "",
              appliedDate: new Date().toISOString().split("T")[0],
              status: "applied",
              notes: "",
              recruiterEmail: "",
              recruiterPhone: "",
              jobUrl: "",
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Application
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | "all")}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("-", " ").toUpperCase()}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredApplications.length} of {applications.length} applications
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Application" : "New Application"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position *
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Applied Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ApplicationStatus })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("-", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone || ""}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job URL
                </label>
                <input
                  type="url"
                  value={formData.jobUrl || ""}
                  onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recruiter Email
                </label>
                <input
                  type="email"
                  value={formData.recruiterEmail || ""}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recruiter Phone
                </label>
                <input
                  type="tel"
                  value={formData.recruiterPhone || ""}
                  onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"} Application
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <p className="text-gray-600 dark:text-gray-400">No applications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => (
            <div key={app.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{app.companyName}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{app.position}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(app)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-2 py-1 rounded text-sm mt-1 ${getStatusColor(app.status)}`}>
                    {app.status.replace("-", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Applied Date</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(app.appliedDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Contact</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{app.contactPerson}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{app.contactEmail}</p>
                </div>
              </div>
              {app.jobUrl && (
                <div className="mb-2">
                  <a
                    href={app.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Job Posting
                  </a>
                </div>
              )}
              {app.notes && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{app.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

