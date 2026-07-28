import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBDT(value: number) {
  return `৳${value.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`
}
