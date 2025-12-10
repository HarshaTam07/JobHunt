"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Github, FolderOpen, FileText, ExternalLink, Download } from "lucide-react";
import { Storage } from "@/lib/storage";
import { Project, ProjectFile } from "@/types";
import { formatDate } from "@/lib/utils";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Partial<Project>>({
    name: "",
    description: "",
    problemStatement: "",
    githubLink: "",
    files: [],
    metadata: {},
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const stored = await Storage.getProjects();
      setProjects(stored);
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects. Please refresh the page.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const processFiles = async (files: File[]): Promise<ProjectFile[]> => {
    const processedFiles: ProjectFile[] = [];
    
    for (const file of files) {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      processedFiles.push({
        name: file.name,
        url: fileData,
        size: file.size,
        type: file.type,
      });
    }
    
    return processedFiles;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.githubLink?.trim()) {
      alert('Project name and GitHub link are required.');
      return;
    }

    try {
      let files: ProjectFile[] = formData.files || [];
      
      // Process new files if any
      if (selectedFiles.length > 0) {
        const newFiles = await processFiles(selectedFiles);
        files = editingId ? [...files, ...newFiles] : newFiles;
      }

      if (editingId) {
        const updated = await Storage.updateProject(editingId, {
          ...formData,
          files,
        });
        setProjects(projects.map((p) => p.id === editingId ? updated : p));
        setEditingId(null);
      } else {
        const newProject = await Storage.setProject({
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          problemStatement: formData.problemStatement?.trim() || undefined,
          githubLink: formData.githubLink.trim(),
          files,
          metadata: formData.metadata || {},
        });
        setProjects([newProject, ...projects]);
      }
      
      setShowForm(false);
      setFormData({ name: "", description: "", problemStatement: "", githubLink: "", files: [], metadata: {} });
      setSelectedFiles([]);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleEdit = (project: Project) => {
    setFormData(project);
    setEditingId(project.id);
    setSelectedFiles([]);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await Storage.deleteProject(id);
        setProjects(projects.filter((p) => p.id !== id));
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleView = (project: Project) => {
    setViewingProject(project);
  };

  const handleRemoveFile = (projectId: string, fileIndex: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const updatedFiles = project.files.filter((_, index) => index !== fileIndex);
    Storage.updateProject(projectId, { files: updatedFiles })
      .then((updated) => {
        setProjects(projects.map((p) => p.id === projectId ? updated : p));
      })
      .catch((error) => {
        console.error('Failed to remove file:', error);
        alert('Failed to remove file. Please try again.');
      });
  };

  const handleDownloadFile = (file: ProjectFile) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">My Projects</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Showcase your portfolio projects</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ name: "", description: "", problemStatement: "", githubLink: "", files: [], metadata: {} });
            setSelectedFiles([]);
          }}
          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Project" : "New Project"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., E-Commerce Platform"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub Link *
              </label>
              <input
                type="url"
                required
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/username/project"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of your project..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Problem Statement
              </label>
              <textarea
                value={formData.problemStatement || ""}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What problem does this project solve?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Files (Optional)
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {selectedFiles.length > 0 && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
              {editingId && formData.files && formData.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Existing files:</p>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-slate-700 p-2 rounded">
                      <span className="truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedFiles = formData.files?.filter((_, i) => i !== index) || [];
                          setFormData({ ...formData, files: updatedFiles });
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 ml-2"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? "Update" : "Add"} Project
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", description: "", problemStatement: "", githubLink: "", files: [], metadata: {} });
                  setSelectedFiles([]);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <FolderOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4">No projects added yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors hover:shadow-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {project.name}
                  </h3>
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </a>
                </div>
                <div className="flex gap-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => handleView(project)}
                    className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="View details"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(project)}
                    className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {project.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {project.description}
                </p>
              )}
              
              {project.files && project.files.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {project.files.length} file(s) attached
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created: {formatDate(project.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* View Project Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {viewingProject.name}
              </h2>
              <button
                onClick={() => setViewingProject(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GitHub Repository</h3>
                <a
                  href={viewingProject.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Github className="h-5 w-5" />
                  <span className="break-all">{viewingProject.githubLink}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              {viewingProject.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {viewingProject.description}
                  </p>
                </div>
              )}
              
              {viewingProject.problemStatement && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Problem Statement</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {viewingProject.problemStatement}
                  </p>
                </div>
              )}
              
              {viewingProject.files && viewingProject.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attached Files</h3>
                  <div className="space-y-2">
                    {viewingProject.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                          {file.size && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveFile(viewingProject.id, index)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created: {formatDate(viewingProject.createdAt)} | Updated: {formatDate(viewingProject.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

