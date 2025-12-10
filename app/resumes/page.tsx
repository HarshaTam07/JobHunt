"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Trash2, Upload, FileText, Eye, X, Edit } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Resume, ResumeType } from "@/types";
import { formatDate, getResumeTypeLabel } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function ResumesPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<ResumeType>("java-react-aws");
  const [viewingResume, setViewingResume] = useState<Resume | null>(null);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [customName, setCustomName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Auto-generate name if not already set
    if (!customName) {
      setCustomName(`${getResumeTypeLabel(selectedType)} - ${new Date().toLocaleDateString()}`);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    if (!customName.trim()) {
      alert('Please enter a name for the resume.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileUrl = event.target?.result as string;
        const newResume = await Storage.setResume({
          name: customName.trim(),
          type: selectedType,
          fileUrl,
          fileName: selectedFile.name,
          uploadedAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        });

        setResumes([...resumes, newResume]);
        setShowUpload(false);
        setSelectedFile(null);
        setCustomName("");
      } catch (error) {
        console.error('Failed to save resume:', error);
        alert('Failed to save resume. Please try again.');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpdateName = async (resume: Resume, newName: string) => {
    if (!newName.trim()) {
      alert('Name cannot be empty.');
      setEditingResume(null);
      return;
    }
    try {
      const updated = await Storage.updateResume(resume.id, { 
        name: newName.trim(),
        lastModified: new Date().toISOString()
      });
      setResumes(resumes.map((r) => r.id === resume.id ? updated : r));
      setEditingResume(null);
    } catch (error) {
      console.error('Failed to update resume name:', error);
      alert('Failed to update resume name. Please try again.');
      setEditingResume(null);
    }
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

  const isPdf = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const handleView = (resume: Resume) => {
    if (isPdf(resume.fileName)) {
      setViewingResume(resume);
    } else {
      // Open non-PDF files in a new tab
      window.open(resume.fileUrl, '_blank');
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
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upload New Resume</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Resume Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as ResumeType);
                  // Update name if file is selected but name is auto-generated
                  if (selectedFile && customName === `${getResumeTypeLabel(selectedType)} - ${new Date().toLocaleDateString()}`) {
                    setCustomName(`${getResumeTypeLabel(e.target.value as ResumeType)} - ${new Date().toLocaleDateString()}`);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Resume Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`e.g., ${getResumeTypeLabel(selectedType)} - ${new Date().toLocaleDateString()}`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This is the display name. The original filename will be preserved separately.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select File *
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {selectedFile && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={!selectedFile || !customName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Upload Resume
              </button>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setCustomName("");
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
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
                <div className="flex-1 min-w-0">
                  {editingResume?.id === resume.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue={resume.name}
                        onBlur={(e) => {
                          if (e.target.value !== resume.name) {
                            handleUpdateName(resume, e.target.value);
                          } else {
                            setEditingResume(null);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          } else if (e.key === 'Escape') {
                            setEditingResume(null);
                          }
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 text-lg font-semibold border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-700 dark:text-gray-100"
                      />
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex-1">{resume.name}</h3>
                      <button
                        onClick={() => setEditingResume(resume)}
                        className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit name"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getResumeTypeLabel(resume.type)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p className="truncate" title={resume.fileName}>
                  <span className="font-medium">Original file:</span> {resume.fileName}
                </p>
                <p>Uploaded: {formatDate(resume.uploadedAt)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(resume)}
                  className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  title="View resume"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDownload(resume)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
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

      {/* View Resume Modal */}
      {viewingResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {viewingResume.name}
              </h2>
              <button
                onClick={() => setViewingResume(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {isPdf(viewingResume.fileName) ? (
                <iframe
                  src={viewingResume.fileUrl}
                  className="w-full h-full border-0"
                  title={viewingResume.name}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 dark:text-gray-400">
                    Preview not available for this file type. Please download to view.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

