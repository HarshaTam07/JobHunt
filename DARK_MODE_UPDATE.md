# Dark Mode Update Guide

This document tracks the dark mode implementation across all pages.

## Completed
- ✅ Theme Context and Provider
- ✅ Navigation with dark mode toggle
- ✅ Global CSS with dark mode support
- ✅ Dashboard page
- ✅ Utils functions (getStatusColor)
- ✅ Resumes page (partial)

## Remaining Updates Needed

For each page, update these common patterns:

1. **Backgrounds:**
   - `bg-white` → `bg-white dark:bg-slate-800`
   - `bg-gray-50` → `bg-gray-50 dark:bg-slate-700`
   - `bg-gray-100` → `bg-gray-100 dark:bg-slate-700`

2. **Text Colors:**
   - `text-gray-900` → `text-gray-900 dark:text-gray-100`
   - `text-gray-600` → `text-gray-600 dark:text-gray-400`
   - `text-gray-500` → `text-gray-500 dark:text-gray-400`
   - `text-gray-700` → `text-gray-700 dark:text-gray-300`

3. **Borders:**
   - `border-gray-200` → `border-gray-200 dark:border-slate-700`
   - `border-gray-300` → `border-gray-300 dark:border-slate-600`

4. **Inputs/Selects:**
   - Add `dark:bg-slate-700 dark:text-gray-100 dark:border-slate-600`

5. **Hover States:**
   - `hover:bg-gray-50` → `hover:bg-gray-50 dark:hover:bg-slate-700`

## Pages to Update
- [ ] Resumes (in progress)
- [ ] Applications
- [ ] Documents
- [ ] Links
- [ ] Contacts
- [ ] Learning
- [ ] Activities

