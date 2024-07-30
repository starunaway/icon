import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function redirect(path: string) {
  window.location.href = `/icon${path}`;
}

export const copyText = async (val:string) => {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(val)
  } else {
    const input = document.createElement('textarea');
    input.value = val;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }
}


