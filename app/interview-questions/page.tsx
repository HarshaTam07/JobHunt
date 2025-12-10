"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, X, BookOpen, Star, Calendar, Lightbulb } from "lucide-react";
import { Storage } from "@/lib/storage";
import { InterviewQuestion, InterviewTechnology } from "@/types";

export default function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingQuestion, setViewingQuestion] = useState<InterviewQuestion | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | "behavioral" | "technical">("all");
  const [filterTechnology, setFilterTechnology] = useState<InterviewTechnology | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [practiceMode, setPracticeMode] = useState(false);
  const [currentPracticeIndex, setCurrentPracticeIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [formData, setFormData] = useState<Partial<InterviewQuestion>>({
    question: "",
    answer: "",
    category: "technical",
    technology: "java",
    difficulty: "medium",
    tags: "",
    notes: "",
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const stored = await Storage.getInterviewQuestions();
      setQuestions(stored);
    } catch (error) {
      console.error('Failed to load interview questions:', error);
      alert('Failed to load interview questions. Please refresh the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const updated = await Storage.updateInterviewQuestion(editingId, formData);
        setQuestions(questions.map((q) => q.id === editingId ? updated : q));
        setEditingId(null);
      } else {
        const newQuestion = await Storage.setInterviewQuestion({
          question: formData.question || "",
          answer: formData.answer,
          category: formData.category || "technical",
          technology: formData.technology || "java",
          difficulty: formData.difficulty || "medium",
          tags: formData.tags,
          notes: formData.notes,
          timesPracticed: 0,
        });
        setQuestions([...questions, newQuestion]);
      }
      setShowForm(false);
      setFormData({ question: "", answer: "", category: "technical", technology: "java", difficulty: "medium", tags: "", notes: "" });
    } catch (error) {
      console.error('Failed to save question:', error);
      alert('Failed to save question. Please try again.');
    }
  };

  const handleEdit = (question: InterviewQuestion) => {
    setFormData(question);
    setEditingId(question.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        await Storage.deleteInterviewQuestion(id);
        setQuestions(questions.filter((q) => q.id !== id));
      } catch (error) {
        console.error('Failed to delete question:', error);
        alert('Failed to delete question. Please try again.');
      }
    }
  };

  const handleView = (question: InterviewQuestion) => {
    setViewingQuestion(question);
  };

  const handlePractice = () => {
    const filtered = getFilteredQuestions();
    if (filtered.length === 0) {
      alert("No questions available for practice. Please add some questions first.");
      return;
    }
    setPracticeMode(true);
    setCurrentPracticeIndex(0);
    setShowAnswer(false);
  };

  const handleMarkPracticed = async (question: InterviewQuestion) => {
    try {
      const updated = await Storage.updateInterviewQuestion(question.id, {
        timesPracticed: (question.timesPracticed || 0) + 1,
        lastPracticedDate: new Date().toISOString().split("T")[0],
      });
      setQuestions(questions.map((q) => q.id === question.id ? updated : q));
      if (practiceMode && viewingQuestion?.id === question.id) {
        setViewingQuestion(updated);
      }
    } catch (error) {
      console.error('Failed to update practice:', error);
    }
  };

  const handleNextQuestion = () => {
    const filtered = getFilteredQuestions();
    if (currentPracticeIndex < filtered.length - 1) {
      setCurrentPracticeIndex(currentPracticeIndex + 1);
      setShowAnswer(false);
      if (viewingQuestion) {
        handleView(filtered[currentPracticeIndex + 1]);
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentPracticeIndex > 0) {
      setCurrentPracticeIndex(currentPracticeIndex - 1);
      setShowAnswer(false);
      const filtered = getFilteredQuestions();
      if (viewingQuestion) {
        handleView(filtered[currentPracticeIndex - 1]);
      }
    }
  };

  const getFilteredQuestions = () => {
    let filtered = questions;
    if (filterCategory !== "all") {
      filtered = filtered.filter((q) => q.category === filterCategory);
    }
    if (filterTechnology !== "all") {
      filtered = filtered.filter((q) => q.technology === filterTechnology);
    }
    if (filterDifficulty !== "all") {
      filtered = filtered.filter((q) => q.difficulty === filterDifficulty);
    }
    return filtered;
  };

  const getTechnologyLabel = (tech: InterviewTechnology): string => {
    const labels: Record<InterviewTechnology, string> = {
      java: "Java",
      react: "React",
      angular: "Angular",
      aws: "AWS",
      "spring-boot": "Spring Boot",
      python: "Python",
      javascript: "JavaScript",
      typescript: "TypeScript",
      nodejs: "Node.js",
      sql: "SQL",
      "system-design": "System Design",
      "data-structures": "Data Structures",
      algorithms: "Algorithms",
      leetcode: "LeetCode",
      behavioral: "Behavioral",
      "html-css": "HTML/CSS",
      docker: "Docker",
      kubernetes: "Kubernetes",
      microservices: "Microservices",
      other: "Other",
    };
    return labels[tech] || tech;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
    }
  };

  const technologies: InterviewTechnology[] = [
    "java", "react", "angular", "aws", "spring-boot", "python", "javascript",
    "typescript", "nodejs", "sql", "system-design", "data-structures",
    "algorithms", "leetcode", "behavioral", "html-css", "docker",
    "kubernetes", "microservices", "other"
  ];

  const filteredQuestions = getFilteredQuestions();
  const practiceQuestions = practiceMode ? filteredQuestions : [];
  const currentPracticeQuestion = practiceMode && practiceQuestions.length > 0 
    ? practiceQuestions[currentPracticeIndex] 
    : null;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Interview Prep Questions</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">Practice questions for multiple technologies</p>
        </div>
        <div className="flex gap-2">
          {!practiceMode && (
            <button
              onClick={handlePractice}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600 text-sm sm:text-base"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Practice Mode
            </button>
          )}
          {practiceMode && (
            <button
              onClick={() => {
                setPracticeMode(false);
                setViewingQuestion(null);
                setShowAnswer(false);
              }}
              className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors dark:bg-gray-500 dark:hover:bg-gray-600 text-sm sm:text-base"
            >
              Exit Practice
            </button>
          )}
          {!practiceMode && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ question: "", answer: "", technology: "java", difficulty: "medium", tags: "", notes: "" });
              }}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Question
            </button>
          )}
        </div>
      </div>

      {/* Practice Mode */}
      {practiceMode && currentPracticeQuestion && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Question {currentPracticeIndex + 1} of {practiceQuestions.length}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs ${
                  currentPracticeQuestion.category === "behavioral" 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                }`}>
                  {currentPracticeQuestion.category === "behavioral" ? "Behavioral" : "Technical"}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(currentPracticeQuestion.difficulty)}`}>
                  {currentPracticeQuestion.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {getTechnologyLabel(currentPracticeQuestion.technology)}
                </span>
              </div>
            </div>
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {currentPracticeQuestion.question}
            </h2>
            {showAnswer && currentPracticeQuestion.answer && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Answer:</h3>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {currentPracticeQuestion.answer}
                </p>
              </div>
            )}
            {!showAnswer && (
              <button
                onClick={() => setShowAnswer(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Show Answer
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="flex gap-2">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentPracticeIndex === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={currentPracticeIndex === practiceQuestions.length - 1}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <button
              onClick={() => handleMarkPracticed(currentPracticeQuestion)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600 flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Mark as Practiced
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {!practiceMode && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 transition-colors">
          <div className="flex flex-col gap-4">
            {/* Category Filter - Prominent */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterCategory === "all"
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCategory("behavioral")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterCategory === "behavioral"
                      ? "bg-purple-600 text-white dark:bg-purple-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  Behavioral
                </button>
                <button
                  onClick={() => setFilterCategory("technical")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterCategory === "technical"
                      ? "bg-green-600 text-white dark:bg-green-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  Technical
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Technology
                </label>
                <select
                  value={filterTechnology}
                  onChange={(e) => setFilterTechnology(e.target.value as InterviewTechnology | "all")}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Technologies</option>
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {getTechnologyLabel(tech)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Filter by Difficulty
                </label>
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value as "all" | "easy" | "medium" | "hard")}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="flex items-end">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && !practiceMode && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6 transition-colors">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {editingId ? "Edit Question" : "New Question"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Question *
              </label>
              <textarea
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the interview question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Answer (Your practice answer)
              </label>
              <textarea
                value={formData.answer || ""}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Write your answer here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: "behavioral" })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.category === "behavioral"
                      ? "bg-purple-600 text-white dark:bg-purple-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  Behavioral
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: "technical" })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    formData.category === "technical"
                      ? "bg-green-600 text-white dark:bg-green-500"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                  }`}
                >
                  Technical
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Technology *
                </label>
                <select
                  required
                  value={formData.technology}
                  onChange={(e) => setFormData({ ...formData, technology: e.target.value as InterviewTechnology })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {technologies.map((tech) => (
                    <option key={tech} value={tech}>
                      {getTechnologyLabel(tech)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty *
                </label>
                <select
                  required
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as "easy" | "medium" | "hard" })}
                  className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags || ""}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., arrays, recursion, oop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes or tips..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {editingId ? "Update" : "Add"} Question
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ question: "", answer: "", category: "technical", technology: "java", difficulty: "medium", tags: "", notes: "" });
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions List */}
      {!practiceMode && (
        <>
          {filteredQuestions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 sm:p-12 text-center transition-colors">
              <Lightbulb className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No questions added yet</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-3">
                {filteredQuestions.map((question) => (
                  <div
                    key={question.id}
                    className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-gray-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                          {question.question}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            question.category === "behavioral" 
                              ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                              : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          }`}>
                            {question.category === "behavioral" ? "Behavioral" : "Technical"}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {getTechnologyLabel(question.technology)}
                          </span>
                          {question.timesPracticed > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {question.timesPracticed}x
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <button
                          onClick={() => handleView(question)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(question)}
                          className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id)}
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
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Question
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Technology
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                          Difficulty
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                          Practiced
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {filteredQuestions.map((question) => (
                        <tr
                          key={question.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <td className="px-4 lg:px-6 py-4">
                            <div
                              onClick={() => handleView(question)}
                              className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors max-w-md truncate"
                              title="Click to view full question"
                            >
                              {question.question}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                question.category === "behavioral" 
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                                  : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                              }`}>
                                {question.category === "behavioral" ? "Behavioral" : "Technical"}
                              </span>
                              <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                {getTechnologyLabel(question.technology)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              {question.timesPracticed > 0 ? (
                                <>
                                  <BookOpen className="h-4 w-4" />
                                  {question.timesPracticed}x
                                  {question.lastPracticedDate && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                      ({new Date(question.lastPracticedDate).toLocaleDateString()})
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500">Never</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1 sm:gap-2">
                              <button
                                onClick={() => handleView(question)}
                                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(question)}
                                className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(question.id)}
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
        </>
      )}

      {/* View Modal */}
      {viewingQuestion && !practiceMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-1 rounded text-xs ${
                  viewingQuestion.category === "behavioral" 
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                    : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                }`}>
                  {viewingQuestion.category === "behavioral" ? "Behavioral" : "Technical"}
                </span>
                <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(viewingQuestion.difficulty)}`}>
                  {viewingQuestion.difficulty}
                </span>
                <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {getTechnologyLabel(viewingQuestion.technology)}
                </span>
                {viewingQuestion.timesPracticed > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Practiced {viewingQuestion.timesPracticed} time{viewingQuestion.timesPracticed !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <button
                onClick={() => setViewingQuestion(null)}
                className="p-2 flex-shrink-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Question:
                </h3>
                <div className="text-base sm:text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-gray-50 dark:bg-slate-900 p-3 sm:p-4 rounded-lg">
                  {viewingQuestion.question}
                </div>
              </div>
              {viewingQuestion.answer && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Your Answer:
                  </h3>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg">
                    {viewingQuestion.answer}
                  </div>
                </div>
              )}
              {viewingQuestion.notes && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Notes:
                  </h3>
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words bg-yellow-50 dark:bg-yellow-900/20 p-3 sm:p-4 rounded-lg">
                    {viewingQuestion.notes}
                  </div>
                </div>
              )}
              {viewingQuestion.tags && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingQuestion.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Created:
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {new Date(viewingQuestion.createdAt).toLocaleString()}
                  </p>
                </div>
                {viewingQuestion.lastPracticedDate && (
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Last Practiced:
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      {new Date(viewingQuestion.lastPracticedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 sm:p-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => handleMarkPracticed(viewingQuestion)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors dark:bg-green-500 dark:hover:bg-green-600 flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Mark as Practiced
              </button>
              <button
                onClick={() => {
                  handleEdit(viewingQuestion);
                  setViewingQuestion(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Question
              </button>
              <button
                onClick={() => setViewingQuestion(null)}
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

