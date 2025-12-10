// Storage utilities - Now using Supabase instead of localStorage
import {
  resumeApi,
  jobApplicationApi,
  documentApi,
  linkApi,
  contactApi,
  recruiterCallApi,
  learningItemApi,
  noteApi,
  todoApi,
  interviewQuestionApi,
} from './api';
import {
  Resume,
  JobApplication,
  Document,
  Link,
  Contact,
  RecruiterCall,
  LearningItem,
  Note,
  Todo,
  InterviewQuestion,
} from '@/types';

// Storage keys (kept for backward compatibility, but now using Supabase)
export const STORAGE_KEYS = {
  RESUMES: "resumes",
  JOB_APPLICATIONS: "job_applications",
  DOCUMENTS: "documents",
  LINKS: "links",
  CONTACTS: "contacts",
  RECRUITER_CALLS: "recruiter_calls",
  LEARNING_ITEMS: "learning_items",
  INTERVIEW_PREP: "interview_prep",
  NOTES: "notes",
  TODOS: "todos",
  INTERVIEW_QUESTIONS: "interview_questions",
} as const;

// Cache for storing data to reduce API calls
const cache: {
  resumes?: Resume[];
  job_applications?: JobApplication[];
  documents?: Document[];
  links?: Link[];
  contacts?: Contact[];
  recruiter_calls?: RecruiterCall[];
  learning_items?: LearningItem[];
  notes?: Note[];
  todos?: Todo[];
  interview_questions?: InterviewQuestion[];
} = {};

export class Storage {
  private static prefix = "jobhunt_";

  // Resume operations
  static async getResumes(): Promise<Resume[]> {
    try {
      if (!cache.resumes) {
        cache.resumes = await resumeApi.getAll();
      }
      return cache.resumes;
    } catch (error) {
      console.error('Error fetching resumes:', error);
      return [];
    }
  }

  static async setResume(resume: Omit<Resume, 'id'>): Promise<Resume> {
    try {
      const newResume = await resumeApi.create(resume);
      cache.resumes = undefined; // Clear cache
      return newResume;
    } catch (error) {
      console.error('Error creating resume:', error);
      throw error;
    }
  }

  static async updateResume(id: string, updates: Partial<Resume>): Promise<Resume> {
    try {
      const updated = await resumeApi.update(id, updates);
      cache.resumes = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  static async deleteResume(id: string): Promise<void> {
    try {
      await resumeApi.delete(id);
      cache.resumes = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  // Job Application operations
  static async getJobApplications(): Promise<JobApplication[]> {
    try {
      if (!cache.job_applications) {
        cache.job_applications = await jobApplicationApi.getAll();
      }
      return cache.job_applications;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      return [];
    }
  }

  static async setJobApplication(application: Omit<JobApplication, 'id'>): Promise<JobApplication> {
    try {
      const newApp = await jobApplicationApi.create(application);
      cache.job_applications = undefined; // Clear cache
      return newApp;
    } catch (error) {
      console.error('Error creating job application:', error);
      throw error;
    }
  }

  static async updateJobApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    try {
      const updated = await jobApplicationApi.update(id, updates);
      cache.job_applications = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating job application:', error);
      throw error;
    }
  }

  static async deleteJobApplication(id: string): Promise<void> {
    try {
      await jobApplicationApi.delete(id);
      cache.job_applications = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting job application:', error);
      throw error;
    }
  }

  // Document operations
  static async getDocuments(): Promise<Document[]> {
    try {
      if (!cache.documents) {
        cache.documents = await documentApi.getAll();
      }
      return cache.documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  static async setDocument(document: Omit<Document, 'id'>): Promise<Document> {
    try {
      const newDoc = await documentApi.create(document);
      cache.documents = undefined; // Clear cache
      return newDoc;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  static async deleteDocument(id: string): Promise<void> {
    try {
      await documentApi.delete(id);
      cache.documents = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Link operations
  static async getLinks(): Promise<Link[]> {
    try {
      if (!cache.links) {
        cache.links = await linkApi.getAll();
      }
      return cache.links;
    } catch (error) {
      console.error('Error fetching links:', error);
      return [];
    }
  }

  static async setLink(link: Omit<Link, 'id'>): Promise<Link> {
    try {
      const newLink = await linkApi.create(link);
      cache.links = undefined; // Clear cache
      return newLink;
    } catch (error) {
      console.error('Error creating link:', error);
      throw error;
    }
  }

  static async updateLink(id: string, updates: Partial<Link>): Promise<Link> {
    try {
      const updated = await linkApi.update(id, updates);
      cache.links = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating link:', error);
      throw error;
    }
  }

  static async deleteLink(id: string): Promise<void> {
    try {
      await linkApi.delete(id);
      cache.links = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting link:', error);
      throw error;
    }
  }

  // Contact operations
  static async getContacts(): Promise<Contact[]> {
    try {
      if (!cache.contacts) {
        cache.contacts = await contactApi.getAll();
      }
      return cache.contacts;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return [];
    }
  }

  static async setContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
    try {
      const newContact = await contactApi.create(contact);
      cache.contacts = undefined; // Clear cache
      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    try {
      const updated = await contactApi.update(id, updates);
      cache.contacts = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  static async deleteContact(id: string): Promise<void> {
    try {
      await contactApi.delete(id);
      cache.contacts = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  // Recruiter Call operations
  static async getRecruiterCalls(): Promise<RecruiterCall[]> {
    try {
      if (!cache.recruiter_calls) {
        cache.recruiter_calls = await recruiterCallApi.getAll();
      }
      return cache.recruiter_calls;
    } catch (error) {
      console.error('Error fetching recruiter calls:', error);
      return [];
    }
  }

  static async setRecruiterCall(call: Omit<RecruiterCall, 'id'>): Promise<RecruiterCall> {
    try {
      const newCall = await recruiterCallApi.create(call);
      cache.recruiter_calls = undefined; // Clear cache
      return newCall;
    } catch (error) {
      console.error('Error creating recruiter call:', error);
      throw error;
    }
  }

  static async updateRecruiterCall(id: string, updates: Partial<RecruiterCall>): Promise<RecruiterCall> {
    try {
      const updated = await recruiterCallApi.update(id, updates);
      cache.recruiter_calls = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating recruiter call:', error);
      throw error;
    }
  }

  static async deleteRecruiterCall(id: string): Promise<void> {
    try {
      await recruiterCallApi.delete(id);
      cache.recruiter_calls = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting recruiter call:', error);
      throw error;
    }
  }

  // Learning Item operations
  static async getLearningItems(): Promise<LearningItem[]> {
    try {
      if (!cache.learning_items) {
        cache.learning_items = await learningItemApi.getAll();
      }
      return cache.learning_items;
    } catch (error) {
      console.error('Error fetching learning items:', error);
      return [];
    }
  }

  static async setLearningItem(item: Omit<LearningItem, 'id'>): Promise<LearningItem> {
    try {
      const newItem = await learningItemApi.create(item);
      cache.learning_items = undefined; // Clear cache
      return newItem;
    } catch (error) {
      console.error('Error creating learning item:', error);
      throw error;
    }
  }

  static async updateLearningItem(id: string, updates: Partial<LearningItem>): Promise<LearningItem> {
    try {
      const updated = await learningItemApi.update(id, updates);
      cache.learning_items = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating learning item:', error);
      throw error;
    }
  }

  static async deleteLearningItem(id: string): Promise<void> {
    try {
      await learningItemApi.delete(id);
      cache.learning_items = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting learning item:', error);
      throw error;
    }
  }

  // Note operations
  static async getNotes(): Promise<Note[]> {
    try {
      if (!cache.notes) {
        cache.notes = await noteApi.getAll();
      }
      return cache.notes;
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }

  static async setNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const newNote = await noteApi.create(note);
      cache.notes = undefined; // Clear cache
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  static async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    try {
      const updated = await noteApi.update(id, updates);
      cache.notes = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  static async deleteNote(id: string): Promise<void> {
    try {
      await noteApi.delete(id);
      cache.notes = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }

  // Todo operations
  static async getTodos(): Promise<Todo[]> {
    try {
      if (!cache.todos) {
        cache.todos = await todoApi.getAll();
      }
      return cache.todos;
    } catch (error) {
      console.error('Error fetching todos:', error);
      return [];
    }
  }

  static async setTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>): Promise<Todo> {
    try {
      const newTodo = await todoApi.create(todo);
      cache.todos = undefined; // Clear cache
      return newTodo;
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  static async updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
    try {
      const updated = await todoApi.update(id, updates);
      cache.todos = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating todo:', error);
      throw error;
    }
  }

  static async deleteTodo(id: string): Promise<void> {
    try {
      await todoApi.delete(id);
      cache.todos = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting todo:', error);
      throw error;
    }
  }

  // Interview Question operations
  static async getInterviewQuestions(): Promise<InterviewQuestion[]> {
    try {
      if (!cache.interview_questions) {
        cache.interview_questions = await interviewQuestionApi.getAll();
      }
      return cache.interview_questions;
    } catch (error) {
      console.error('Error fetching interview questions:', error);
      return [];
    }
  }

  static async setInterviewQuestion(question: Omit<InterviewQuestion, 'id' | 'createdAt' | 'updatedAt'>): Promise<InterviewQuestion> {
    try {
      const newQuestion = await interviewQuestionApi.create(question);
      cache.interview_questions = undefined; // Clear cache
      return newQuestion;
    } catch (error) {
      console.error('Error creating interview question:', error);
      throw error;
    }
  }

  static async updateInterviewQuestion(id: string, updates: Partial<InterviewQuestion>): Promise<InterviewQuestion> {
    try {
      const updated = await interviewQuestionApi.update(id, updates);
      cache.interview_questions = undefined; // Clear cache
      return updated;
    } catch (error) {
      console.error('Error updating interview question:', error);
      throw error;
    }
  }

  static async deleteInterviewQuestion(id: string): Promise<void> {
    try {
      await interviewQuestionApi.delete(id);
      cache.interview_questions = undefined; // Clear cache
    } catch (error) {
      console.error('Error deleting interview question:', error);
      throw error;
    }
  }

  // Legacy localStorage methods (for backward compatibility during migration)
  // These will be removed once all pages are updated
  static get<T>(key: string): T | null {
    console.warn('Storage.get() is deprecated. Use specific get methods instead.');
    return null;
  }

  static set<T>(key: string, value: T): void {
    console.warn('Storage.set() is deprecated. Use specific set methods instead.');
  }

  static remove(key: string): void {
    console.warn('Storage.remove() is deprecated. Use specific delete methods instead.');
  }

  static clear(): void {
    console.warn('Storage.clear() is deprecated.');
    // Clear all caches
    Object.keys(cache).forEach(key => {
      delete cache[key as keyof typeof cache];
    });
  }
}
