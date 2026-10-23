"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, FileText, Eye, X, Search } from "lucide-react";
import { Storage } from "@/lib/storage";
import { Note } from "@/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Note>>({
    title: "",
    content: "",
  });

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const stored = await Storage.getNotes();
      setNotes(stored);
    } catch (error) {
      console.error('Failed to load notes:', error);
      alert('Failed to load notes. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateNote(editingId, formData);
        setNotes(notes.map((note) => note.id === editingId ? updated : note));
        setEditingId(null);
      } else {
        const newNote = await Storage.setNote({
          title: formData.title || "",
          content: formData.content || "",
        });
        setNotes([...notes, newNote]);
      }
      setShowForm(false);
      setFormData({ title: "", content: "" });
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const handleEdit = (note: Note) => {
    setFormData(note);
    setEditingId(note.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await Storage.deleteNote(id);
        setNotes(notes.filter((note) => note.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (currentFiltered: Note[]) => {
    const currentFilteredIds = currentFiltered.map((n) => n.id);
    const allFilteredSelected = currentFilteredIds.length > 0 && currentFilteredIds.every((id) => selectedIds.includes(id));
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentFilteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentFilteredIds])));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (confirm(`Are you sure you want to delete ${count} selected note${count > 1 ? "s" : ""}?`)) {
      try {
        setIsDeleting(true);
        await Storage.deleteNotes(selectedIds);
        setNotes(notes.filter((note) => !selectedIds.includes(note.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete selected notes:', error);
        alert('Failed to delete selected notes. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleView = (note: Note) => {
    setViewingNote(note);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Notes</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your text notes</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", content: "" });
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Note
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 sm:p-4 transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Note" : "New Note"}
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
                placeholder="Enter note title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content *
              </label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter note content"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {editingId ? "Update" : "Add"} Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: "", content: "" });
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic Multi-Select Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {selectedIds.length === 1 ? "1 note selected" : `${selectedIds.length} notes selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-lg transition-colors"
            >
              Deselect All
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Notes Table - Mobile Card View / Desktop Table View */}
      {filteredNotes.length === 0 && notes.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            No notes found matching "{searchQuery}"
          </p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No notes added yet</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {filteredNotes.map((note) => {
              const isSelected = selectedIds.includes(note.id);
              return (
                <div
                  key={note.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 border transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(note.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        aria-label={`Select ${note.title}`}
                      />
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {note.title}
                      </h3>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleView(note)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div
                    onClick={() => handleView(note)}
                    className="text-sm text-gray-600 dark:text-gray-400 mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {truncateText(note.content, 100)}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="w-12 px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={filteredNotes.length > 0 && filteredNotes.every((n) => selectedIds.includes(n.id))}
                        ref={(el) => {
                          if (el) {
                            const allSel = filteredNotes.length > 0 && filteredNotes.every((n) => selectedIds.includes(n.id));
                            const someSel = filteredNotes.some((n) => selectedIds.includes(n.id));
                            el.indeterminate = someSel && !allSel;
                          }
                        }}
                        onChange={() => handleSelectAll(filteredNotes)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all notes"
                      />
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Content Preview
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Created Date
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Updated Date
                    </th>
                    <th className="sticky right-0 z-20 w-24 px-3.5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.4)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredNotes.map((note) => {
                    const isSelected = selectedIds.includes(note.id);
                    return (
                      <tr
                        key={note.id}
                        className={`group transition-colors ${
                          isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : "hover:bg-gray-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <td className="w-12 px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(note.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                            aria-label={`Select ${note.title}`}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {note.title}
                          </div>
                        </td>
                        <td 
                          className="px-4 lg:px-6 py-4 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          onClick={() => handleView(note)}
                          title="Click to view full content"
                        >
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                            {truncateText(note.content, 150)}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(note.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(note.updatedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td
                          className={`sticky right-0 z-10 w-24 px-3.5 py-4 whitespace-nowrap text-right text-sm font-medium border-l border-gray-200 dark:border-slate-700 shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-slate-800"
                              : "bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => handleView(note)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(note)}
                              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(note.id)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 pr-2 break-words">
                {viewingNote.title}
              </h2>
              <button
                onClick={() => setViewingNote(null)}
                className="p-2 flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Content:
                </h3>
                <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-gray-50 dark:bg-slate-900 p-3 sm:p-4 rounded-lg">
                  {viewingNote.content}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created Date:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {new Date(viewingNote.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Updated Date:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {new Date(viewingNote.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => {
                  handleEdit(viewingNote);
                  setViewingNote(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Note
              </button>
              <button
                onClick={() => setViewingNote(null)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

