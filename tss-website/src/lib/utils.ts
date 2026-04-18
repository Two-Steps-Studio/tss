import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  const cls = clsx(inputs)
  if (!cls) return ""
  return twMerge(cls)
}
