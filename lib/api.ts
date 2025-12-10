import { supabase } from './supabase';
import { 
  Resume, 
  JobApplication, 
  Document, 
  Link, 
  Contact, 
  RecruiterCall, 
  LearningItem, 
  Note,
  Todo
} from '@/types';

// Helper function to transform database row to app format
const transformResume = (row: any): Resume => ({
  id: row.id,
  name: row.name,
  type: row.type,
  fileUrl: row.file_url,
  fileName: row.file_name,
  uploadedAt: row.uploaded_at,
  lastModified: row.last_modified || row.updated_at,
});

const transformJobApplication = (row: any): JobApplication => ({
  id: row.id,
  companyName: row.company_name,
  position: row.position,
  contactPerson: row.contact_person,
  contactEmail: row.contact_email,
  contactPhone: row.contact_phone,
  appliedDate: row.applied_date,
  status: row.status,
  followUpDate: row.follow_up_date,
  notes: row.notes || '',
  recruiterEmail: row.recruiter_email,
  recruiterPhone: row.recruiter_phone,
  jobUrl: row.job_url,
  resumeUsed: row.resume_used,
});

const transformDocument = (row: any): Document => ({
  id: row.id,
  name: row.name,
  type: row.type,
  fileUrl: row.file_url,
  fileName: row.file_name,
  uploadedAt: row.uploaded_at,
});

const transformLink = (row: any): Link => ({
  id: row.id,
  title: row.title,
  url: row.url,
  category: row.category,
  description: row.description,
});

const transformContact = (row: any): Contact => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  linkedinUrl: row.linkedin_url,
  role: row.role,
  company: row.company,
  notes: row.notes,
  isReference: row.is_reference,
});

const transformRecruiterCall = (row: any): RecruiterCall => ({
  id: row.id,
  companyName: row.company_name,
  recruiterName: row.recruiter_name,
  callDate: row.call_date,
  callTime: row.call_time,
  followUpHappened: row.follow_up_happened,
  followUpDate: row.follow_up_date,
  followUpNotes: row.follow_up_notes,
  discussionNotes: row.discussion_notes,
  recruiterPhone: row.recruiter_phone,
  recruiterEmail: row.recruiter_email,
  position: row.position,
  status: row.status,
});

const transformLearningItem = (row: any): LearningItem => ({
  id: row.id,
  title: row.title,
  category: row.category,
  status: row.status,
  notes: row.notes,
  startedDate: row.started_date,
  completedDate: row.completed_date,
});

const transformNote = (row: any): Note => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const transformTodo = (row: any): Todo => ({
  id: row.id,
  title: row.title,
  description: row.description,
  completed: row.completed,
  priority: row.priority,
  dueDate: row.due_date,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Resume APIs
export const resumeApi = {
  getAll: async (): Promise<Resume[]> => {
    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformResume);
  },

  create: async (resume: Omit<Resume, 'id'>): Promise<Resume> => {
    const { data, error } = await supabase
      .from('resumes')
      .insert({
        name: resume.name,
        type: resume.type,
        file_url: resume.fileUrl,
        file_name: resume.fileName,
        uploaded_at: resume.uploadedAt,
        last_modified: resume.lastModified,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformResume(data);
  },

  update: async (id: string, updates: Partial<Resume>): Promise<Resume> => {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.type) updateData.type = updates.type;
    if (updates.fileUrl) updateData.file_url = updates.fileUrl;
    if (updates.fileName) updateData.file_name = updates.fileName;
    if (updates.lastModified) updateData.last_modified = updates.lastModified;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformResume(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Job Application APIs
export const jobApplicationApi = {
  getAll: async (): Promise<JobApplication[]> => {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .order('applied_date', { ascending: false });
    
    if (error) throw error;
    return data.map(transformJobApplication);
  },

  create: async (application: Omit<JobApplication, 'id'>): Promise<JobApplication> => {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        company_name: application.companyName,
        position: application.position,
        contact_person: application.contactPerson,
        contact_email: application.contactEmail,
        contact_phone: application.contactPhone,
        applied_date: application.appliedDate,
        status: application.status,
        follow_up_date: application.followUpDate && application.followUpDate.trim() !== "" ? application.followUpDate : null,
        notes: application.notes,
        recruiter_email: application.recruiterEmail,
        recruiter_phone: application.recruiterPhone,
        job_url: application.jobUrl,
        resume_used: application.resumeUsed,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformJobApplication(data);
  },

  update: async (id: string, updates: Partial<JobApplication>): Promise<JobApplication> => {
    const updateData: any = {};
    if (updates.companyName) updateData.company_name = updates.companyName;
    if (updates.position) updateData.position = updates.position;
    if (updates.contactPerson) updateData.contact_person = updates.contactPerson;
    if (updates.contactEmail) updateData.contact_email = updates.contactEmail;
    if (updates.contactPhone !== undefined) updateData.contact_phone = updates.contactPhone;
    if (updates.appliedDate) updateData.applied_date = updates.appliedDate;
    if (updates.status) updateData.status = updates.status;
    if (updates.followUpDate !== undefined) {
      updateData.follow_up_date = updates.followUpDate && updates.followUpDate.trim() !== "" ? updates.followUpDate : null;
    }
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.recruiterEmail !== undefined) updateData.recruiter_email = updates.recruiterEmail;
    if (updates.recruiterPhone !== undefined) updateData.recruiter_phone = updates.recruiterPhone;
    if (updates.jobUrl !== undefined) updateData.job_url = updates.jobUrl;
    if (updates.resumeUsed !== undefined) updateData.resume_used = updates.resumeUsed;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformJobApplication(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('job_applications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Document APIs
export const documentApi = {
  getAll: async (): Promise<Document[]> => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformDocument);
  },

  create: async (document: Omit<Document, 'id'>): Promise<Document> => {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        name: document.name,
        type: document.type,
        file_url: document.fileUrl,
        file_name: document.fileName,
        uploaded_at: document.uploadedAt,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformDocument(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Link APIs
export const linkApi = {
  getAll: async (): Promise<Link[]> => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformLink);
  },

  create: async (link: Omit<Link, 'id'>): Promise<Link> => {
    const { data, error } = await supabase
      .from('links')
      .insert({
        title: link.title,
        url: link.url,
        category: link.category,
        description: link.description,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformLink(data);
  },

  update: async (id: string, updates: Partial<Link>): Promise<Link> => {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.url) updateData.url = updates.url;
    if (updates.category) updateData.category = updates.category;
    if (updates.description !== undefined) updateData.description = updates.description;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('links')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformLink(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Contact APIs
export const contactApi = {
  getAll: async (): Promise<Contact[]> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformContact);
  },

  create: async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        linkedin_url: contact.linkedinUrl,
        role: contact.role,
        company: contact.company,
        notes: contact.notes,
        is_reference: contact.isReference,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformContact(data);
  },

  update: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.linkedinUrl !== undefined) updateData.linkedin_url = updates.linkedinUrl;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.company !== undefined) updateData.company = updates.company;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.isReference !== undefined) updateData.is_reference = updates.isReference;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformContact(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Recruiter Call APIs
export const recruiterCallApi = {
  getAll: async (): Promise<RecruiterCall[]> => {
    const { data, error } = await supabase
      .from('recruiter_calls')
      .select('*')
      .order('call_date', { ascending: false })
      .order('call_time', { ascending: false });
    
    if (error) throw error;
    return data.map(transformRecruiterCall);
  },

  create: async (call: Omit<RecruiterCall, 'id'>): Promise<RecruiterCall> => {
    const { data, error } = await supabase
      .from('recruiter_calls')
      .insert({
        company_name: call.companyName,
        recruiter_name: call.recruiterName || null,
        call_date: call.callDate,
        call_time: call.callTime,
        follow_up_happened: call.followUpHappened,
        follow_up_date: call.followUpDate && call.followUpDate.trim() !== "" ? call.followUpDate : null,
        follow_up_notes: call.followUpNotes || null,
        discussion_notes: call.discussionNotes,
        recruiter_phone: call.recruiterPhone || null,
        recruiter_email: call.recruiterEmail || null,
        position: call.position || null,
        status: call.status,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformRecruiterCall(data);
  },

  update: async (id: string, updates: Partial<RecruiterCall>): Promise<RecruiterCall> => {
    const updateData: any = {};
    if (updates.companyName) updateData.company_name = updates.companyName;
    if (updates.recruiterName !== undefined) updateData.recruiter_name = updates.recruiterName || null;
    if (updates.callDate) updateData.call_date = updates.callDate;
    if (updates.callTime) updateData.call_time = updates.callTime;
    if (updates.followUpHappened !== undefined) updateData.follow_up_happened = updates.followUpHappened;
    if (updates.followUpDate !== undefined) {
      updateData.follow_up_date = updates.followUpDate && updates.followUpDate.trim() !== "" ? updates.followUpDate : null;
    }
    if (updates.followUpNotes !== undefined) updateData.follow_up_notes = updates.followUpNotes || null;
    if (updates.discussionNotes) updateData.discussion_notes = updates.discussionNotes;
    if (updates.recruiterPhone !== undefined) updateData.recruiter_phone = updates.recruiterPhone || null;
    if (updates.recruiterEmail !== undefined) updateData.recruiter_email = updates.recruiterEmail || null;
    if (updates.position !== undefined) updateData.position = updates.position || null;
    if (updates.status) updateData.status = updates.status;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('recruiter_calls')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformRecruiterCall(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('recruiter_calls')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Learning Item APIs
export const learningItemApi = {
  getAll: async (): Promise<LearningItem[]> => {
    const { data, error } = await supabase
      .from('learning_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformLearningItem);
  },

  create: async (item: Omit<LearningItem, 'id'>): Promise<LearningItem> => {
    const { data, error } = await supabase
      .from('learning_items')
      .insert({
        title: item.title,
        category: item.category,
        status: item.status,
        notes: item.notes,
        started_date: item.startedDate && item.startedDate.trim() !== "" ? item.startedDate : null,
        completed_date: item.completedDate && item.completedDate.trim() !== "" ? item.completedDate : null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformLearningItem(data);
  },

  update: async (id: string, updates: Partial<LearningItem>): Promise<LearningItem> => {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.category) updateData.category = updates.category;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.startedDate !== undefined) {
      updateData.started_date = updates.startedDate && updates.startedDate.trim() !== "" ? updates.startedDate : null;
    }
    if (updates.completedDate !== undefined) {
      updateData.completed_date = updates.completedDate && updates.completedDate.trim() !== "" ? updates.completedDate : null;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('learning_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformLearningItem(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('learning_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Note APIs
export const noteApi = {
  getAll: async (): Promise<Note[]> => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformNote);
  },

  create: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        title: note.title,
        content: note.content,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformNote(data);
  },

  update: async (id: string, updates: Partial<Note>): Promise<Note> => {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.content) updateData.content = updates.content;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformNote(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Todo APIs
export const todoApi = {
  getAll: async (): Promise<Todo[]> => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(transformTodo);
  },

  create: async (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> => {
    const { data, error } = await supabase
      .from('todos')
      .insert({
        title: todo.title,
        description: todo.description || null,
        completed: todo.completed || false,
        priority: todo.priority || 'medium',
        due_date: todo.dueDate && todo.dueDate.trim() !== "" ? todo.dueDate : null,
      })
      .select()
      .single();
    
    if (error) throw error;
    return transformTodo(data);
  },

  update: async (id: string, updates: Partial<Todo>): Promise<Todo> => {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.completed !== undefined) updateData.completed = updates.completed;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.dueDate !== undefined) {
      updateData.due_date = updates.dueDate && updates.dueDate.trim() !== "" ? updates.dueDate : null;
    }
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return transformTodo(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

