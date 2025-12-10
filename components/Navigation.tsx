"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Briefcase, Link as LinkIcon, FolderOpen, BookOpen, Phone, Users, Home, Menu, X, Sun, Moon, StickyNote, CheckSquare } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/resumes", icon: FileText, label: "Resumes" },
    { href: "/applications", icon: Briefcase, label: "Applications" },
    { href: "/documents", icon: FolderOpen, label: "Documents" },
    { href: "/links", icon: LinkIcon, label: "Links" },
    { href: "/contacts", icon: Users, label: "Contacts" },
    { href: "/learning", icon: BookOpen, label: "Learning" },
    { href: "/calls", icon: Phone, label: "Calls" },
    { href: "/notes", icon: StickyNote, label: "Notes" },
    { href: "/todos", icon: CheckSquare, label: "Todos" },
  ];

  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex flex-1 min-w-0">
            <div className="flex-shrink-0 flex items-center">
              <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 dark:text-blue-400" />
              <span className="ml-1 sm:ml-2 text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-gray-100 hidden xl:inline">Job Hunt Manager</span>
            </div>
            <div className="hidden sm:ml-2 md:ml-3 sm:flex sm:space-x-1 md:space-x-2 lg:space-x-3 flex-1 min-w-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <NavLink key={item.href} href={item.href} icon={<Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} isActive={isActive}>
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
            <div className="sm:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 dark:border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  icon={<Icon className="h-5 w-5" />}
                  isActive={isActive}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({
  href,
  icon,
  children,
  isActive,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center px-0.5 sm:px-1 pt-1 text-[10px] sm:text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 ${
        isActive
          ? "text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400"
          : "text-gray-700 dark:text-gray-300 border-transparent hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 dark:hover:border-blue-400"
      }`}
    >
      <span className="mr-0.5 sm:mr-1">{icon}</span>
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  children,
  isActive,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-gray-100"
      }`}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </Link>
  );
}

