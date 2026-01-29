"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, X, Trash2 } from "lucide-react";
import { Storage } from "@/lib/storage";
import { Habit } from "@/types";

export default function HabitTrackerPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [loading, setLoading] = useState(true);

  // Load habits from database
  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const stored = await Storage.getHabits();
      setHabits(stored);
    } catch (error) {
      console.error('Failed to load habits:', error);
      alert('Failed to load habits. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Format date as YYYY-MM-DD
  const formatDateKey = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper: Get checked days for current month view
  const getCheckedDaysForMonth = (habit: Habit, year: number, month: number): Set<number> => {
    const checkedDays = new Set<number>();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      if (habit.checkedDays[dateKey]) {
        checkedDays.add(day);
      }
    }
    
    return checkedDays;
  };

  // Get current date for highlighting
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                         currentDate.getFullYear() === today.getFullYear();
  const currentDay = today.getDate();

  // Get days in current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  // Format month and year
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthYear = `${monthNames[month]} ${year}`;

  // Add habit
  const handleAddHabit = async () => {
    if (newHabitName.trim()) {
      try {
        const newHabit = await Storage.setHabit({
          name: newHabitName.trim(),
          checkedDays: {},
        });
        setHabits([...habits, newHabit]);
        setNewHabitName("");
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to create habit:', error);
        alert('Failed to create habit. Please try again.');
      }
    }
  };

  // Delete habit
  const handleDeleteHabit = async (id: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      try {
        await Storage.deleteHabit(id);
        setHabits(habits.filter(h => h.id !== id));
      } catch (error) {
        console.error('Failed to delete habit:', error);
        alert('Failed to delete habit. Please try again.');
      }
    }
  };

  // Toggle checkbox
  const handleToggleDay = async (habitId: string, day: number) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const dateKey = formatDateKey(year, month, day);
    const isChecked = habit.checkedDays[dateKey] || false;
    const newCheckedDays = { ...habit.checkedDays };
    
    if (isChecked) {
      delete newCheckedDays[dateKey];
    } else {
      newCheckedDays[dateKey] = true;
    }

    try {
      const updated = await Storage.updateHabit(habitId, {
        checkedDays: newCheckedDays,
      });
      setHabits(habits.map(h => h.id === habitId ? updated : h));
    } catch (error) {
      console.error('Failed to update habit:', error);
      alert('Failed to update habit. Please try again.');
    }
  };

  // Get day suffix (1st, 2nd, 3rd, etc.)
  const getDaySuffix = (day: number): string => {
    if (day >= 11 && day <= 13) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Habit Tracker
            </h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </button>
          </div>
        </div>

        {/* Sticky Month Navigation & Days Header */}
        <div className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900 pb-3 sm:pb-4 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-2">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex items-center gap-2 flex-1 justify-center">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {monthYear}
                </h2>
                {!isCurrentMonth && (
                  <button
                    onClick={goToCurrentMonth}
                    className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 touch-manipulation"
                  >
                    Today
                  </button>
                )}
              </div>
              <button
                onClick={goToNextMonth}
                className="p-2.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-manipulation"
                aria-label="Next month"
              >
                <ChevronRight className="h-6 w-6 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Days Header - Desktop */}
            <div className="hidden sm:grid grid-cols-7 gap-2">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = isCurrentMonth && day === currentDay;
                return (
                  <div
                    key={day}
                    className={`text-center py-2 px-1 text-xs sm:text-sm font-medium rounded ${
                      isToday
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {day}{getDaySuffix(day)}
                  </div>
                );
              })}
            </div>

            {/* Days Header - Mobile (Scrollable) */}
            <div className="sm:hidden overflow-x-auto pb-2 -mx-1 px-1">
              <div className="flex gap-1.5 min-w-max">
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const isToday = isCurrentMonth && day === currentDay;
                  return (
                    <div
                      key={day}
                      className={`text-center py-2 px-2.5 min-w-[3.5rem] text-xs font-medium rounded flex-shrink-0 ${
                        isToday
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                          : "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-700"
                      }`}
                    >
                      {day}{getDaySuffix(day)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              Loading habits...
            </p>
          </div>
        ) : habits.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              No habits yet. Click "Add Habit" to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const checkedDaysForMonth = getCheckedDaysForMonth(habit, year, month);
              return (
                <div
                  key={habit.id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-3 sm:p-4 md:p-6"
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 pr-2">
                      {habit.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="p-2.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors touch-manipulation flex-shrink-0"
                      aria-label="Delete habit"
                    >
                      <Trash2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    </button>
                  </div>

                  {/* Checkboxes - Desktop */}
                  <div className="hidden sm:grid grid-cols-7 gap-2">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                      const isChecked = checkedDaysForMonth.has(day);
                      const isToday = isCurrentMonth && day === currentDay;
                    return (
                      <label
                        key={day}
                        className={`flex items-center justify-center p-2 border-2 rounded-lg cursor-pointer transition-all ${
                          isToday
                            ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500"
                        } ${
                          isChecked
                            ? "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400"
                            : "bg-white dark:bg-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleDay(habit.id, day)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isChecked
                              ? "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500"
                              : "border-gray-400 dark:border-slate-500"
                          }`}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>

                  {/* Checkboxes - Mobile (Scrollable) */}
                  <div className="sm:hidden overflow-x-auto pb-2 -mx-1 px-1">
                    <div className="flex gap-2 min-w-max">
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                        const isChecked = checkedDaysForMonth.has(day);
                        const isToday = isCurrentMonth && day === currentDay;
                      return (
                        <label
                          key={day}
                          className={`flex items-center justify-center p-3 min-w-[3.5rem] border-2 rounded-lg cursor-pointer transition-all flex-shrink-0 touch-manipulation active:scale-95 ${
                            isToday
                              ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-300 dark:border-slate-600"
                          } ${
                            isChecked
                              ? "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-400"
                              : "bg-white dark:bg-slate-700"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDay(habit.id, day)}
                            className="sr-only"
                          />
                          <div
                            className={`w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center ${
                              isChecked
                                ? "bg-green-500 dark:bg-green-600 border-green-600 dark:border-green-500"
                                : "border-gray-400 dark:border-slate-500"
                            }`}
                          >
                            {isChecked && (
                              <svg className="w-4 h-4 sm:w-3 sm:h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </label>
                      );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Habit Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Add New Habit
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewHabitName("");
                  }}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 touch-manipulation"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-5 sm:mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddHabit();
                    }
                  }}
                  placeholder="e.g., Exercise, Read, Meditate"
                  className="w-full px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewHabitName("");
                  }}
                  className="px-5 py-2.5 sm:px-4 sm:py-2 text-base sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHabit}
                  disabled={!newHabitName.trim()}
                  className="px-5 py-2.5 sm:px-4 sm:py-2 text-base sm:text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  Add Habit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

