"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, BookOpen, CheckCircle, Clock, Circle } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { LearningItem, LearningCategory } from "@/types";
import { formatDate } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function LearningPage() {
  const [items, setItems] = useState<LearningItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<LearningCategory | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "not-started" | "in-progress" | "completed">("all");
  const [formData, setFormData] = useState<Partial<LearningItem>>({
    title: "",
    category: "java",
    status: "not-started",
    notes: "",
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const stored = await Storage.getLearningItems();
      setItems(stored);
    } catch (error) {
      console.error('Failed to load learning items:', error);
      alert('Failed to load learning items. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateLearningItem(editingId, formData);
        setItems(items.map((item) => item.id === editingId ? updated : item));
        setEditingId(null);
      } else {
        const newItem = await Storage.setLearningItem({
          title: formData.title || "",
          category: formData.category || "java",
          status: formData.status || "not-started",
          notes: formData.notes,
          startedDate: formData.status === "in-progress" || formData.status === "completed"
            ? new Date().toISOString().split("T")[0]
            : undefined,
        });
        setItems([...items, newItem]);
      }
      setShowForm(false);
      setFormData({ title: "", category: "java", status: "not-started", notes: "" });
    } catch (error) {
      console.error('Failed to save learning item:', error);
      alert('Failed to save learning item. Please try again.');
    }
  };

  const handleEdit = (item: LearningItem) => {
    setFormData(item);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this learning item?")) {
      try {
        await Storage.deleteLearningItem(id);
        setItems(items.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Failed to delete learning item:', error);
        alert('Failed to delete learning item. Please try again.');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: LearningItem["status"]) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      const updates: Partial<LearningItem> = { status: newStatus };
      if (newStatus === "in-progress" && !item.startedDate) {
        updates.startedDate = new Date().toISOString().split("T")[0];
      }
      if (newStatus === "completed" && !item.completedDate) {
        updates.completedDate = new Date().toISOString().split("T")[0];
      }

      const updated = await Storage.updateLearningItem(id, updates);
      setItems(items.map((item) => item.id === id ? updated : item));
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const categories: LearningCategory[] = [
    "java",
    "react",
    "angular",
    "aws",
    "spring-boot",
    "python",
    "system-design",
    "leetcode",
    "behavioral",
    "other",
  ];

  const getCategoryLabel = (cat: LearningCategory): string => {
    return cat.charAt(0).toUpperCase() + cat.slice(1).replace("-", " ");
  };

  const getStatusIcon = (status: LearningItem["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredItems = items.filter((item) => {
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<LearningCategory, LearningItem[]>);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Learning & Interview Prep</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Track your learning progress and interview preparation</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", category: "java", status: "not-started", notes: "" });
          }}
          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Learning Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as LearningCategory | "all")}
            className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "not-started" | "in-progress" | "completed")}
            className="w-full sm:w-auto px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
            {filteredItems.length} items
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Learning Item" : "New Learning Item"}
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
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Java Collections Framework"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as LearningCategory })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as LearningItem["status"] })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Add your notes, resources, or progress updates..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {editingId ? "Update" : "Add"} Item
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No learning items added yet</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
                {getCategoryLabel(category as LearningCategory)} ({categoryItems.length})
              </h2>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{item.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            {getCategoryLabel(item.category)}
                          </span>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value as LearningItem["status"])}
                            className="px-2 py-0.5 text-xs border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded"
                          >
                            <option value="not-started">Not Started</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                        {(item.startedDate || item.completedDate) && (
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                            {item.startedDate && (
                              <span>Started: {formatDate(item.startedDate)}</span>
                            )}
                            {item.completedDate && (
                              <span className="text-green-600 dark:text-green-400">
                                Completed: {formatDate(item.completedDate)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded text-xs text-gray-700 dark:text-gray-300 line-clamp-3">
                        {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Desktop View */}
              <div className="hidden sm:block space-y-3">
                {categoryItems.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(item.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs">
                              {getCategoryLabel(item.category)}
                            </span>
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value as LearningItem["status"])}
                              className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded"
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                            {item.startedDate && (
                              <span>Started: {formatDate(item.startedDate)}</span>
                            )}
                            {item.completedDate && (
                              <span className="text-green-600 dark:text-green-400">
                                Completed: {formatDate(item.completedDate)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {item.notes && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded text-sm text-gray-700 dark:text-gray-300">
                        {item.notes}
                      </div>
                    )}
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

