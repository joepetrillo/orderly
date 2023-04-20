import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function doubleFilter<T>(
  arr: Array<T> | undefined,
  callback: (item: T) => boolean
) {
  const truthy = [];
  const falsy = [];

  if (arr) {
    for (const arrItem of arr) {
      callback(arrItem) ? truthy.push(arrItem) : falsy.push(arrItem);
    }
  }

  return [truthy, falsy];
}
