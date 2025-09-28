import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "approved":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "draft":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};
