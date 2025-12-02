import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    applied: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
    "interview-scheduled": "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
    interviewed: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
    offer: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
    rejected: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    "no-response": "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300",
  };
  return colors[status] || "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300";
}

export function getResumeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "java-angular-aws": "Java + Angular + AWS",
    "java-react-aws": "Java + React + AWS",
    "pure-frontend": "Pure Frontend Developer",
    "qa-automation": "QA / Automation Testing",
    "dotnet-react-aws": ".NET + React + AWS",
    "dotnet-angular-aws": ".NET + Angular + AWS",
    "ai-ml": "AI + ML",
  };
  return labels[type] || type;
}

