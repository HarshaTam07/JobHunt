"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Phone, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { RecruiterCall } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function CallsPage() {
  const [calls, setCalls] = useState<RecruiterCall[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      } catch (error) {
        console.error('Failed to delete call:', error);
        alert('Failed to delete call. Please try again.');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Recruiter Calls</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Track all recruiter calls and follow-ups</p>
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
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Call
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
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
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"} Call
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Calls Table */}
      {calls.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <Phone className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No calls recorded yet</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recruiter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Call Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Discussion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Follow-up
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {calls.map((call) => (
                  <tr key={call.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {call.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {call.recruiterName || "N/A"}
                      </div>
                      {call.recruiterPhone && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">{call.recruiterPhone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(call.callDate)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{call.callTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">
                        {call.position || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {call.discussionNotes || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleFollowUpToggle(call.id, !call.followUpHappened)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            call.followUpHappened
                              ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(call)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(call.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
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
      )}
    </div>
  );
}

