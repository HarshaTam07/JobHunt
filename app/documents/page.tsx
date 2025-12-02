"use client";

import { useState, useEffect } from "react";
import { Plus, Download, Trash2, FolderOpen } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Document, DocumentType } from "@/types";
import { formatDate } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType>("other");

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const fileUrl = event.target?.result as string;
        const newDoc = await Storage.setDocument({
          name: file.name,
          type: selectedType,
          fileUrl,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        });

        setDocuments([...documents, newDoc]);
        setShowUpload(false);
      } catch (error) {
        console.error('Failed to save document:', error);
        alert('Failed to save document. Please try again.');
      }
    };
    reader.readAsDataURL(file);
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
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
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
                Select File
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">{doc.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <FolderOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex gap-2">
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
    </div>
  );
}

