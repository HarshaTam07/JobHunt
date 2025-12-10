"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Trash2, FolderOpen, Eye, X, Edit } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Document, DocumentType } from "@/types";
import { formatDate } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("other");
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [customName, setCustomName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const stored = await Storage.getDocuments();
      setDocuments(stored);
    } catch (error) {
      console.error('Failed to load documents:', error);
      alert('Failed to load documents. Please refresh the page.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // Auto-generate name if not already set
    if (!customName) {
      const baseName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setCustomName(baseName || getTypeLabel(selectedType));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }
    if (!customName.trim()) {
      alert('Please enter a name for the document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileUrl = event.target?.result as string;
        const newDoc = await Storage.setDocument({
          name: customName.trim(),
          type: selectedType,
          fileUrl,
          fileName: selectedFile.name,
          uploadedAt: new Date().toISOString(),
        });

        setDocuments([...documents, newDoc]);
        setShowUpload(false);
        setSelectedFile(null);
        setCustomName("");
      } catch (error) {
        console.error('Failed to save document:', error);
        alert('Failed to save document. Please try again.');
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpdateName = async (doc: Document, newName: string) => {
    if (!newName.trim()) {
      alert('Name cannot be empty.');
      setEditingDocument(null);
      return;
    }
    try {
      const updated = await Storage.updateDocument(doc.id, { name: newName.trim() });
      setDocuments(documents.map((d) => d.id === doc.id ? updated : d));
      setEditingDocument(null);
    } catch (error) {
      console.error('Failed to update document name:', error);
      alert('Failed to update document name. Please try again.');
      setEditingDocument(null);
    }
  };

  const handleDownload = (doc: Document) => {
    const link = document.createElement("a");
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.click();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await Storage.deleteDocument(id);
        setDocuments(documents.filter((d) => d.id !== id));
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

  const isPdf = (fileName: string): boolean => {
    return fileName.toLowerCase().endsWith('.pdf');
  };

  const handleView = (doc: Document) => {
    if (isPdf(doc.fileName)) {
      setViewingDocument(doc);
    } else {
      // Open non-PDF files in a new tab
      window.open(doc.fileUrl, '_blank');
    }
  };

  const documentTypes: DocumentType[] = [
    "driving-license",
    "ead",
    "stem-ead",
    "aws-certificate",
    "linkedin-certificate",
    "other",
  ];

  const getTypeLabel = (type: DocumentType): string => {
    const labels: Record<DocumentType, string> = {
      "driving-license": "Driving License",
      ead: "EAD",
      "stem-ead": "STEM EAD",
      "aws-certificate": "AWS Certificate",
      "linkedin-certificate": "LinkedIn Certificate",
      other: "Other",
    };
    return labels[type];
  };

  const groupedDocs = documents.reduce((acc, doc) => {
    if (!acc[doc.type]) acc[doc.type] = [];
    acc[doc.type].push(doc);
    return acc;
  }, {} as Record<DocumentType, Document[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Store and manage all your important documents</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload Document
        </button>
      </div>

      {showUpload && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Upload New Document</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as DocumentType);
                  // Update name if file is selected but name is auto-generated
                  if (selectedFile && customName === selectedFile.name.replace(/\.[^/.]+$/, "")) {
                    setCustomName(selectedFile.name.replace(/\.[^/.]+$/, "") || getTypeLabel(e.target.value as DocumentType));
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Name *
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Enter document name"
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                Upload Document
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

      {documents.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <FolderOpen className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">No documents uploaded yet</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Upload Your First Document
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocs).map(([type, docs]) => (
            <div key={type} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">{getTypeLabel(type as DocumentType)}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        {editingDocument?.id === doc.id ? (
                          <input
                            type="text"
                            defaultValue={doc.name}
                            onBlur={(e) => {
                              if (e.target.value !== doc.name) {
                                handleUpdateName(doc, e.target.value);
                              } else {
                                setEditingDocument(null);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              } else if (e.key === 'Escape') {
                                setEditingDocument(null);
                              }
                            }}
                            autoFocus
                            className="w-full px-2 py-1 font-medium border border-blue-500 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-slate-700 dark:text-gray-100"
                          />
                        ) : (
                          <div className="flex items-start gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1">{doc.name}</h3>
                            <button
                              onClick={() => setEditingDocument(doc)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors flex-shrink-0"
                              title="Edit name"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={doc.fileName}>
                          Original: {doc.fileName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(doc)}
                        className="px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                        title="View document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Document Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {viewingDocument.name}
              </h2>
              <button
                onClick={() => setViewingDocument(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {isPdf(viewingDocument.fileName) ? (
                <iframe
                  src={viewingDocument.fileUrl}
                  className="w-full h-full border-0"
                  title={viewingDocument.name}
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

