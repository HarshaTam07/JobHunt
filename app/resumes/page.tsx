"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Trash2, Upload, FileText } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Resume, ResumeType } from "@/types";
import { formatDate, getResumeTypeLabel } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<ResumeType>("java-react-aws");

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const stored = await Storage.getResumes();
      setResumes(stored);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      alert('Failed to load resumes. Please refresh the page.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileUrl = event.target?.result as string;
        const newResume = await Storage.setResume({
          name: `${getResumeTypeLabel(selectedType)} - ${new Date().toLocaleDateString()}`,
          type: selectedType,
          fileUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        });

        setResumes([...resumes, newResume]);
        setShowUpload(false);
      } catch (error) {
        console.error('Failed to save resume:', error);
        alert('Failed to save resume. Please try again.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (resume: Resume) => {
    const link = document.createElement("a");
    link.href = resume.fileUrl;
    link.download = resume.fileName;
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await Storage.deleteResume(id);
        setResumes(resumes.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Failed to delete resume:', error);
        alert('Failed to delete resume. Please try again.');
      }
    }
  };

  const resumeTypes: ResumeType[] = [
    "java-angular-aws",
    "java-react-aws",
    "pure-frontend",
    "qa-automation",
    "dotnet-react-aws",
    "dotnet-angular-aws",
    "ai-ml",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 dark:text-gray-100">Resume Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 dark:text-gray-400">Manage all your resume versions</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Resume
        </button>
      </div>

      {showUpload && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 dark:text-gray-100">Upload New Resume</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ResumeType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {resumeTypes.map((type) => (
                  <option key={type} value={type}>
                    {getResumeTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select File
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">No resumes uploaded yet</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Your First Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <div key={resume.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 dark:text-gray-100">{resume.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mt-1">
                    {getResumeTypeLabel(resume.type)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 dark:text-blue-400" />
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 dark:text-gray-400 mb-4">
                <p>File: {resume.fileName}</p>
                <p>Uploaded: {formatDate(resume.uploadedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(resume)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => handleDelete(resume.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

