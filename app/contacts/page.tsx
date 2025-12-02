"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, Mail, Phone, Linkedin } from "lucide-react";
import { Storage, STORAGE_KEYS } from "@/lib/storage";
import { Contact } from "@/types";
import { v4 as uuidv4 } from "uuid";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterReference, setFilterReference] = useState<"all" | "references" | "contacts">("all");
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    role: "",
    company: "",
    notes: "",
    isReference: false,
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const stored = await Storage.getContacts();
      setContacts(stored);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      alert('Failed to load contacts. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateContact(editingId, formData);
        setContacts(contacts.map((contact) => contact.id === editingId ? updated : contact));
        setEditingId(null);
      } else {
        const newContact = await Storage.setContact({
          name: formData.name || "",
          email: formData.email,
          phone: formData.phone,
          linkedinUrl: formData.linkedinUrl,
          role: formData.role,
          company: formData.company,
          notes: formData.notes,
          isReference: formData.isReference || false,
        });
        setContacts([...contacts, newContact]);
      }
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        role: "",
        company: "",
        notes: "",
        isReference: false,
      });
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert('Failed to save contact. Please try again.');
    }
  };

  const handleEdit = (contact: Contact) => {
    setFormData(contact);
    setEditingId(contact.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      try {
        await Storage.deleteContact(id);
        setContacts(contacts.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const filteredContacts = filterReference === "all"
    ? contacts
    : filterReference === "references"
    ? contacts.filter((c) => c.isReference)
    : contacts.filter((c) => !c.isReference);

  const references = contacts.filter((c) => c.isReference);
  const regularContacts = contacts.filter((c) => !c.isReference);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contacts & References</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage your professional network</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              name: "",
              email: "",
              phone: "",
              linkedinUrl: "",
              role: "",
              company: "",
              notes: "",
              isReference: false,
            });
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Contact
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
        <div className="flex items-center gap-4">
          <select
            value={filterReference}
            onChange={(e) => setFilterReference(e.target.value as "all" | "references" | "contacts")}
            className="px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Contacts</option>
            <option value="references">References Only</option>
            <option value="contacts">Regular Contacts</option>
          </select>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {filteredContacts.length} contacts
          </span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Contact" : "New Contact"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ""}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isReference"
                checked={formData.isReference}
                onChange={(e) => setFormData({ ...formData, isReference: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isReference" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                This is a reference contact
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingId ? "Update" : "Add"} Contact
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

      {/* Contacts List */}
      {filteredContacts.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-12 text-center transition-colors">
          <User className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No contacts added yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filterReference === "all" && references.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">References ({references.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {references.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
          {filterReference === "all" && regularContacts.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Contacts ({regularContacts.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
          {filterReference !== "all" && (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 transition-colors">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                {filterReference === "references" ? "References" : "Contacts"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ContactCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{contact.name}</h3>
            {contact.isReference && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded">
                Reference
              </span>
            )}
          </div>
          {contact.role && contact.company && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {contact.role} at {contact.company}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(contact)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        {contact.email && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4 mr-2" />
            <a href={`mailto:${contact.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {contact.email}
            </a>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Phone className="h-4 w-4 mr-2" />
            <a href={`tel:${contact.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {contact.phone}
            </a>
          </div>
        )}
        {contact.linkedinUrl && (
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Linkedin className="h-4 w-4 mr-2" />
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              LinkedIn Profile
            </a>
          </div>
        )}
        {contact.notes && (
          <div className="mt-2 p-2 bg-gray-50 dark:bg-slate-700 rounded text-xs text-gray-700 dark:text-gray-300">
            {contact.notes}
          </div>
        )}
      </div>
    </div>
  );
}

