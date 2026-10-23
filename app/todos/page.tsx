"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, Circle, Calendar, AlertCircle, CheckSquare, Search } from "lucide-react";
import { Storage } from "@/lib/storage";
import { Todo } from "@/types";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Todo>>({
    title: "",
    description: "",
    completed: false,
    priority: "medium",
    dueDate: "",
  });

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const stored = await Storage.getTodos();
      setTodos(stored);
    } catch (error) {
      console.error('Failed to load todos:', error);
      alert('Failed to load todos. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateTodo(editingId, formData);
        setTodos(todos.map((todo) => todo.id === editingId ? updated : todo));
        setEditingId(null);
      } else {
        const newTodo = await Storage.setTodo({
          title: formData.title || "",
          description: formData.description,
          completed: formData.completed || false,
          priority: formData.priority || "medium",
          dueDate: formData.dueDate,
        });
        setTodos([...todos, newTodo]);
      }
      setShowForm(false);
      setFormData({ title: "", description: "", completed: false, priority: "medium", dueDate: "" });
    } catch (error) {
      console.error('Failed to save todo:', error);
      alert('Failed to save todo. Please try again.');
    }
  };

  const handleEdit = (todo: Todo) => {
    setFormData(todo);
    setEditingId(todo.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this todo?")) {
      try {
        await Storage.deleteTodo(id);
        setTodos(todos.filter((todo) => todo.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Failed to delete todo. Please try again.');
      }
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (currentTodos: Todo[]) => {
    const currentIds = currentTodos.map((t) => t.id);
    const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (confirm(`Are you sure you want to delete ${count} selected todo${count > 1 ? "s" : ""}?`)) {
      try {
        setIsDeleting(true);
        await Storage.deleteTodos(selectedIds);
        setTodos(todos.filter((todo) => !selectedIds.includes(todo.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete selected todos:', error);
        alert('Failed to delete selected todos. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleToggleComplete = async (id: string, completed: boolean) => {
    try {
      const updated = await Storage.updateTodo(id, { completed: !completed });
      setTodos(todos.map((todo) => todo.id === id ? updated : todo));
    } catch (error) {
      console.error('Failed to update todo:', error);
      alert('Failed to update todo. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "low":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <Circle className="h-4 w-4" />;
      case "low":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Filter todos by status
  const statusFilteredTodos = filterStatus === "all"
    ? todos
    : filterStatus === "completed"
    ? todos.filter((todo) => todo.completed)
    : todos.filter((todo) => !todo.completed);

  // Filter todos based on search query
  const filteredTodos = statusFilteredTodos.filter((todo) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      (todo.description && todo.description.toLowerCase().includes(query))
    );
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    // Sort by: completed status, priority, due date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Todos</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage your tasks and todos</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ title: "", description: "", completed: false, priority: "medium", dueDate: "" });
          }}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 text-sm sm:text-base"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Todo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-3 sm:p-4 transition-colors">
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos by title or description..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-2 text-base sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
          />
        </div>
        {searchQuery && (
          <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Found {filteredTodos.length} todo{filteredTodos.length !== 1 ? 's' : ''}
          </p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Total: <span className="font-semibold text-gray-900 dark:text-gray-100">{todos.length}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Active: <span className="font-semibold text-blue-600 dark:text-blue-400">{activeCount}</span>
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Completed: <span className="font-semibold text-green-600 dark:text-green-400">{completedCount}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterStatus === "all"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterStatus === "active"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterStatus === "completed"
                  ? "bg-blue-600 text-white dark:bg-blue-500"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              }`}
            >
              Completed
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Todo" : "New Todo"}
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
                placeholder="Enter todo title"
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
                placeholder="Enter description (optional)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Todo["priority"] })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {editingId && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed || false}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="completed" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Mark as completed
                </label>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {editingId ? "Update" : "Add"} Todo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ title: "", description: "", completed: false, priority: "medium", dueDate: "" });
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
              {selectedIds.length === 1 ? "1 todo selected" : `${selectedIds.length} todos selected`}
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

      {/* Todos List */}
      {sortedTodos.length === 0 && todos.length > 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {searchQuery ? `No todos found matching "${searchQuery}"` : filterStatus === "completed" ? "No completed todos yet" : filterStatus === "active" ? "No active todos. Great job!" : "No todos added yet"}
          </p>
        </div>
      ) : sortedTodos.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <CheckSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            No todos added yet
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {sortedTodos.map((todo) => {
              const isSelected = selectedIds.includes(todo.id);
              return (
                <div
                  key={todo.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 transition-colors ${
                    isSelected
                      ? "ring-2 ring-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
                      : ""
                  } ${
                    todo.completed
                      ? "border-gray-300 dark:border-gray-600 opacity-75"
                      : todo.priority === "high"
                      ? "border-red-500"
                      : todo.priority === "medium"
                      ? "border-yellow-500"
                      : "border-green-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(todo.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                      aria-label={`Select ${todo.title}`}
                    />
                    <button
                      onClick={() => handleToggleComplete(todo.id, todo.completed)}
                      className="mt-0.5 flex-shrink-0"
                      aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${todo.completed ? "line-through" : ""}`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${getPriorityColor(todo.priority)}`}>
                          {getPriorityIcon(todo.priority)}
                          {todo.priority}
                        </span>
                        {todo.dueDate && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(todo)}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(todo.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                        checked={sortedTodos.length > 0 && sortedTodos.every((t) => selectedIds.includes(t.id))}
                        ref={(el) => {
                          if (el) {
                            const allSel = sortedTodos.length > 0 && sortedTodos.every((t) => selectedIds.includes(t.id));
                            const someSel = sortedTodos.some((t) => selectedIds.includes(t.id));
                            el.indeterminate = someSel && !allSel;
                          }
                        }}
                        onChange={() => handleSelectAll(sortedTodos)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all todos"
                      />
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                      Description
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                      Due Date
                    </th>
                    <th className="sticky right-0 z-20 w-24 px-3.5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.4)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {sortedTodos.map((todo) => {
                    const isSelected = selectedIds.includes(todo.id);
                    return (
                      <tr
                        key={todo.id}
                        className={`group transition-colors ${
                          isSelected ? "bg-blue-50/60 dark:bg-blue-950/30" : "hover:bg-gray-50 dark:hover:bg-slate-700/60"
                        } ${todo.completed ? "opacity-75" : ""}`}
                      >
                        <td className="w-12 px-4 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(todo.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                            aria-label={`Select ${todo.title}`}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleComplete(todo.id, todo.completed)}
                            className="flex-shrink-0"
                            aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
                          >
                            {todo.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className={`text-sm font-medium text-gray-900 dark:text-gray-100 ${todo.completed ? "line-through" : ""}`}>
                            {todo.title}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 hidden md:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                            {todo.description || "-"}
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${getPriorityColor(todo.priority)}`}>
                            {getPriorityIcon(todo.priority)}
                            {todo.priority}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            {todo.dueDate ? (
                              <>
                                <Calendar className="h-4 w-4" />
                                {new Date(todo.dueDate).toLocaleDateString()}
                              </>
                            ) : (
                              "-"
                            )}
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
                              onClick={() => handleEdit(todo)}
                              className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
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
    </div>
  );
}

