"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle2, Circle, Calendar, AlertCircle, CheckSquare } from "lucide-react";
import { Storage } from "@/lib/storage";
import { Todo } from "@/types";

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
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
      } catch (error) {
        console.error('Failed to delete todo:', error);
        alert('Failed to delete todo. Please try again.');
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

  const filteredTodos = filterStatus === "all"
    ? todos
    : filterStatus === "completed"
    ? todos.filter((todo) => todo.completed)
    : todos.filter((todo) => !todo.completed);

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

      {/* Stats and Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
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

      {/* Todos List */}
      {sortedTodos.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
          <CheckSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {filterStatus === "completed" ? "No completed todos yet" : filterStatus === "active" ? "No active todos. Great job!" : "No todos added yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {sortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 border-l-4 transition-colors ${
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
                  <button
                    onClick={() => handleToggleComplete(todo.id, todo.completed)}
                    className="mt-0.5 flex-shrink-0"
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
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
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
                    <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {sortedTodos.map((todo) => (
                    <tr
                      key={todo.id}
                      className={`hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                        todo.completed ? "opacity-75" : ""
                      }`}
                    >
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleComplete(todo.id, todo.completed)}
                          className="flex-shrink-0"
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
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

