import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toggleTheme(): void {
  const el = document.documentElement
  const nextIsDark = !el.classList.contains('dark')
  el.classList.toggle('dark', nextIsDark)
  localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
}
