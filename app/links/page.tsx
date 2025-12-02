"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Link, LinkCategory } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function LinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<LinkCategory | "all">("all");
  const [formData, setFormData] = useState<Partial<Link>>({
    title: "",
    url: "",
    category: "other",
    description: "",
  });

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const stored = await Storage.getLinks();
      setLinks(stored);
    } catch (error) {
      console.error('Failed to load links:', error);
      alert('Failed to load links. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateLink(editingId, formData);
        setLinks(links.map((link) => link.id === editingId ? updated : link));
        setEditingId(null);
      } else {
        const newLink = await Storage.setLink({
          title: formData.title || "",
          url: formData.url || "",
          category: formData.category || "other",
          description: formData.description,
        });
        setLinks([...links, newLink]);
      }
      setShowForm(false);
      setFormData({ title: "", url: "", category: "other", description: "" });
    } catch (error) {
      console.error('Failed to save link:', error);
      alert('Failed to save link. Please try again.');
    }
  };

  const handleEdit = (link: Link) => {
    setFormData(link);
    setEditingId(link.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      try {
        await Storage.deleteLink(id);
        setLinks(links.filter((l) => l.id !== id));
      } catch (error) {
        console.error('Failed to delete link:', error);
        alert('Failed to delete link. Please try again.');
      }
    }
  };

  const categories: LinkCategory[] = [
    "job-board",
    "portfolio",
    "github",
    "linkedin",
    "certification",
    "learning",
    "tool",
    "other",
  ];

  const getCategoryLabel = (cat: LinkCategory): string => {
    const labels: Record<LinkCategory, string> = {
      "job-board": "Job Board",
      portfolio: "Portfolio",
      github: "GitHub",
      linkedin: "LinkedIn",
      certification: "Certification",
      learning: "Learning",
      tool: "Tool",
      other: "Other",
    };
    return labels[cat];
  };

  const filteredLinks = filterCategory === "all"
    ? links
    : links.filter((link) => link.category === filterCategory);

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) acc[link.category] = [];
    acc[link.category].push(link);
    return acc;
  }, {} as Record<LinkCategory, Link[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Links & Resources</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage all your important links</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", url: "", category: "other", description: "" });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Link
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
        <div className="flex items-center gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as LinkCategory | "all")}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredLinks.length} links
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Link" : "New Link"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL *
              </label>
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as LinkCategory })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"} Link
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

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <LinkIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No links added yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedLinks).map(([category, categoryLinks]) => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {getCategoryLabel(category as LinkCategory)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryLinks.map((link) => (
                  <div key={link.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{link.title}</h3>
                        {link.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{link.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(link)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {link.url.length > 50 ? link.url.substring(0, 50) + "..." : link.url}
                    </a>
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

