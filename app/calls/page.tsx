"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Phone, Calendar, CheckCircle, XCircle, Eye, X } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { RecruiterCall } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function CallsPage() {
  const [calls, setCalls] = useState<RecruiterCall[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingCall, setViewingCall] = useState<RecruiterCall | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<RecruiterCall>>({
    companyName: "",
    recruiterName: "",
    callDate: new Date().toISOString().split("T")[0],
    callTime: new Date().toTimeString().slice(0, 5),
    followUpHappened: false,
    followUpDate: "",
    followUpNotes: "",
    discussionNotes: "",
    recruiterPhone: "",
    recruiterEmail: "",
    position: "",
    status: "pending",
  });

  useEffect(() => {
    loadCalls();
  }, []);

  const loadCalls = async () => {
    try {
      const stored = await Storage.getRecruiterCalls();
      setCalls(stored.sort((a, b) => 
        new Date(b.callDate + "T" + b.callTime).getTime() - new Date(a.callDate + "T" + a.callTime).getTime()
      ));
    } catch (error) {
      console.error('Failed to load calls:', error);
      alert('Failed to load calls. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateRecruiterCall(editingId, formData);
        setCalls(calls.map((call) => call.id === editingId ? updated : call).sort((a, b) => 
          new Date(b.callDate + "T" + b.callTime).getTime() - new Date(a.callDate + "T" + a.callTime).getTime()
        ));
        setEditingId(null);
      } else {
        const newCall = await Storage.setRecruiterCall({
          companyName: formData.companyName || "",
          recruiterName: formData.recruiterName || undefined,
          callDate: formData.callDate || new Date().toISOString().split("T")[0],
          callTime: formData.callTime || new Date().toTimeString().slice(0, 5),
          followUpHappened: formData.followUpHappened || false,
          followUpDate: formData.followUpDate && formData.followUpDate.trim() !== "" ? formData.followUpDate : undefined,
          followUpNotes: formData.followUpNotes || undefined,
          discussionNotes: formData.discussionNotes || "",
          recruiterPhone: formData.recruiterPhone || undefined,
          recruiterEmail: formData.recruiterEmail || undefined,
          position: formData.position || undefined,
          status: (formData.followUpHappened ? "followed-up" : "pending") as RecruiterCall["status"],
        });
        setCalls([...calls, newCall].sort((a, b) => 
          new Date(b.callDate + "T" + b.callTime).getTime() - new Date(a.callDate + "T" + a.callTime).getTime()
        ));
      }
      setShowForm(false);
      setFormData({
        companyName: "",
        recruiterName: "",
        callDate: new Date().toISOString().split("T")[0],
        callTime: new Date().toTimeString().slice(0, 5),
        followUpHappened: false,
        followUpDate: "",
        followUpNotes: "",
        discussionNotes: "",
        recruiterPhone: "",
        recruiterEmail: "",
        position: "",
        status: "pending",
      });
    } catch (error) {
      console.error('Failed to save call:', error);
      alert('Failed to save call. Please try again.');
    }
  };

  const handleEdit = (call: RecruiterCall) => {
    setFormData(call);
    setEditingId(call.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this call record?")) {
      try {
        await Storage.deleteRecruiterCall(id);
        setCalls(calls.filter((call) => call.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } catch (error) {
        console.error('Failed to delete call:', error);
        alert('Failed to delete call. Please try again.');
      }
    }
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === calls.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(calls.map((c) => c.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (confirm(`Are you sure you want to delete ${count} selected call record${count > 1 ? "s" : ""}?`)) {
      try {
        setIsDeleting(true);
        await Storage.deleteRecruiterCalls(selectedIds);
        setCalls(calls.filter((call) => !selectedIds.includes(call.id)));
        setSelectedIds([]);
      } catch (error) {
        console.error('Failed to delete selected calls:', error);
        alert('Failed to delete selected calls. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleFollowUpToggle = async (id: string, happened: boolean) => {
    try {
      const updated = await Storage.updateRecruiterCall(id, {
        followUpHappened: happened,
        status: (happened ? "followed-up" : "pending") as RecruiterCall["status"],
      });
      setCalls(calls.map((call) => call.id === id ? updated : call));
    } catch (error) {
      console.error('Failed to update follow-up status:', error);
      alert('Failed to update follow-up status. Please try again.');
    }
  };

  const isAllSelected = calls.length > 0 && selectedIds.length === calls.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < calls.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Recruiter Calls</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Track all recruiter calls and follow-ups</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              companyName: "",
              recruiterName: "",
              callDate: new Date().toISOString().split("T")[0],
              callTime: new Date().toTimeString().slice(0, 5),
              followUpHappened: false,
              followUpDate: "",
              followUpNotes: "",
              discussionNotes: "",
              recruiterPhone: "",
              recruiterEmail: "",
              position: "",
              status: "pending",
            });
          }}
          className="flex items-center justify-center px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Add Call
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Call Record" : "New Call Record"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recruiter Name
                </label>
                <input
                  type="text"
                  value={formData.recruiterName || ""}
                  onChange={(e) => setFormData({ ...formData, recruiterName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Position (if mentioned)
                </label>
                <input
                  type="text"
                  value={formData.position || ""}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Call Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.callDate}
                  onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Call Time *
                </label>
                <input
                  type="time"
                  required
                  value={formData.callTime}
                  onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recruiter Phone
                </label>
                <input
                  type="tel"
                  value={formData.recruiterPhone || ""}
                  onChange={(e) => setFormData({ ...formData, recruiterPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Recruiter Email
                </label>
                <input
                  type="email"
                  value={formData.recruiterEmail || ""}
                  onChange={(e) => setFormData({ ...formData, recruiterEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What Was Discussed *
              </label>
              <textarea
                required
                value={formData.discussionNotes || ""}
                onChange={(e) => setFormData({ ...formData, discussionNotes: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="What did the recruiter discuss? Position details, next steps, etc."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="followUpHappened"
                checked={formData.followUpHappened}
                onChange={(e) => setFormData({ ...formData, followUpHappened: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="followUpHappened" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Follow-up happened
              </label>
            </div>
            {formData.followUpHappened && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate || ""}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Follow-up Notes
                  </label>
                  <textarea
                    value={formData.followUpNotes || ""}
                    onChange={(e) => setFormData({ ...formData, followUpNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="What happened in the follow-up?"
                  />
                </div>
              </>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingId ? "Update" : "Add"} Call
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

      {/* Dynamic Multi-Select Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-all animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {selectedIds.length}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {selectedIds.length === 1 ? "1 call selected" : `${selectedIds.length} calls selected`}
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

      {/* Calls Display */}
      {calls.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <Phone className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No calls recorded yet</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {calls.map((call) => {
              const isSelected = selectedIds.includes(call.id);
              return (
                <div
                  key={call.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg shadow p-4 border transition-colors ${
                    isSelected
                      ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20"
                      : "border-gray-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(call.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        aria-label={`Select ${call.companyName}`}
                      />
                      <div className="min-w-0">
                        <h3
                          onClick={() => setViewingCall(call)}
                          className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {call.companyName}
                        </h3>
                        {call.position && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                            {call.position}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setViewingCall(call)}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        title="Preview call details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(call)}
                        className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                        title="Edit call"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(call.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete call"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Recruiter: </span>
                      {call.recruiterName || "N/A"}
                      {call.recruiterPhone && <div className="text-[11px] text-gray-500">{call.recruiterPhone}</div>}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Date: </span>
                      {formatDate(call.callDate)} {call.callTime && `(${call.callTime})`}
                    </div>
                  </div>

                  {call.discussionNotes && (
                    <div
                      onClick={() => setViewingCall(call)}
                      className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700/50 p-2 rounded mb-2 line-clamp-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {call.discussionNotes}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100 dark:border-slate-700">
                    <span className="text-gray-500 dark:text-gray-400">Follow-up:</span>
                    <button
                      onClick={() => handleFollowUpToggle(call.id, !call.followUpHappened)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                        call.followUpHappened
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200"
                      }`}
                    >
                      {call.followUpHappened ? (
                        <>
                          <CheckCircle className="h-3 w-3" />
                          Yes
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          No
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors border border-gray-200 dark:border-slate-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 text-left">
                <thead className="bg-gray-50 dark:bg-slate-700/80">
                  <tr>
                    <th className="w-10 px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isSomeSelected;
                        }}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                        aria-label="Select all calls"
                      />
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Recruiter
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Call Date/Time
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Discussion
                    </th>
                    <th className="px-3.5 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th className="sticky right-0 z-20 w-28 px-3.5 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-gray-50 dark:bg-slate-700 border-l border-gray-200 dark:border-slate-600 shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.4)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {calls.map((call) => {
                    const isSelected = selectedIds.includes(call.id);
                    return (
                      <tr
                        key={call.id}
                        className={`group transition-colors ${
                          isSelected
                            ? "bg-blue-50/70 dark:bg-blue-950/30"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/60"
                        }`}
                      >
                        <td className="w-10 px-3 py-3 text-center whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(call.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-slate-600 focus:ring-blue-500 cursor-pointer"
                            aria-label={`Select ${call.companyName}`}
                          />
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div
                            onClick={() => setViewingCall(call)}
                            className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {call.companyName}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {call.recruiterName || "N/A"}
                          </div>
                          {call.recruiterPhone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{call.recruiterPhone}</div>
                          )}
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {formatDate(call.callDate)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{call.callTime}</div>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {call.position || "N/A"}
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <div
                            onClick={() => setViewingCall(call)}
                            className="text-sm text-gray-900 dark:text-gray-100 max-w-[180px] lg:max-w-xs truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Click to preview full discussion"
                          >
                            {call.discussionNotes || "N/A"}
                          </div>
                        </td>
                        <td className="px-3.5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleFollowUpToggle(call.id, !call.followUpHappened)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                                call.followUpHappened
                                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200"
                                  : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200"
                              }`}
                            >
                              {call.followUpHappened ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Yes
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3" />
                                  No
                                </>
                              )}
                            </button>
                            {call.followUpHappened && call.followUpNotes && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {call.followUpDate && formatDate(call.followUpDate)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td
                          className={`sticky right-0 z-10 w-28 px-3.5 py-3 whitespace-nowrap text-right text-sm font-medium border-l border-gray-200 dark:border-slate-700 shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.08)] dark:shadow-[-6px_0_8px_-2px_rgba(0,0,0,0.4)] transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-slate-800"
                              : "bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setViewingCall(call)}
                              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title="Preview call details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(call)}
                              className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Edit call"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(call.id)}
                              className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete call"
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

      {/* View / Preview Modal - Just like Notes */}
      {viewingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="pr-2 min-w-0">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 break-words">
                  {viewingCall.companyName}
                </h2>
                {viewingCall.position && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                    {viewingCall.position}
                  </p>
                )}
              </div>
              <button
                onClick={() => setViewingCall(null)}
                className="p-2 flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Call Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Recruiter
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {viewingCall.recruiterName || "Not specified"}
                  </p>
                  {viewingCall.recruiterPhone && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Phone: <a href={`tel:${viewingCall.recruiterPhone}`} className="text-blue-600 dark:text-blue-400 hover:underline">{viewingCall.recruiterPhone}</a>
                    </p>
                  )}
                  {viewingCall.recruiterEmail && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      Email: <a href={`mailto:${viewingCall.recruiterEmail}`} className="text-blue-600 dark:text-blue-400 hover:underline">{viewingCall.recruiterEmail}</a>
                    </p>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    Date & Time
                  </h4>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(viewingCall.callDate)} {viewingCall.callTime && `at ${viewingCall.callTime}`}
                  </p>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Follow-up:</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium ${
                        viewingCall.followUpHappened
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                      }`}
                    >
                      {viewingCall.followUpHappened ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Followed Up
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" />
                          Pending Follow-up
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Discussion Notes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What Was Discussed:
                </h3>
                <div className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words bg-gray-50 dark:bg-slate-900 p-4 rounded-lg border border-gray-100 dark:border-slate-800">
                  {viewingCall.discussionNotes || "No discussion notes recorded."}
                </div>
              </div>

              {/* Follow-up Notes if applicable */}
              {viewingCall.followUpHappened && (viewingCall.followUpDate || viewingCall.followUpNotes) && (
                <div className="bg-blue-50/70 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-900/50">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Follow-up Details {viewingCall.followUpDate && `(${formatDate(viewingCall.followUpDate)})`}
                  </h3>
                  {viewingCall.followUpNotes && (
                    <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap break-words mt-1">
                      {viewingCall.followUpNotes}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => {
                  handleEdit(viewingCall);
                  setViewingCall(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Call
              </button>
              <button
                onClick={() => setViewingCall(null)}
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

