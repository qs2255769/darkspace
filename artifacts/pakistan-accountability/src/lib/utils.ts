import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColorClass(score: number): string {
  if (score < 30) return "text-risk-low border-risk-low/20 bg-risk-low/10";
  if (score < 60) return "text-risk-medium border-risk-medium/20 bg-risk-medium/10";
  if (score < 80) return "text-risk-high border-risk-high/20 bg-risk-high/10";
  return "text-risk-critical border-risk-critical/20 bg-risk-critical/10";
}

export function getRiskColorHex(score: number): string {
  if (score < 30) return "#118c4f"; // low
  if (score < 60) return "#facc15"; // medium
  if (score < 80) return "#f97316"; // high
  return "#ef4444"; // critical
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value;
  if (isNaN(num)) return typeof value === 'string' ? value : "PKR 0";
  
  if (num >= 1000000000) {
    return `PKR ${(num / 1000000000).toFixed(2)}B`;
  }
  if (num >= 1000000) {
    return `PKR ${(num / 1000000).toFixed(2)}M`;
  }
  return `PKR ${num.toLocaleString()}`;
}
