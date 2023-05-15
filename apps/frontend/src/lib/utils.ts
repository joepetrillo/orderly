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

export function getTimes(start_time: string, end_time: string) {
  const startDate = new Date();
  startDate.setUTCHours(
    Number(start_time.split(":")[0]),
    Number(start_time.split(":")[1]),
    0,
    0
  );

  const endDate = new Date();
  endDate.setUTCHours(
    Number(end_time.split(":")[0]),
    Number(end_time.split(":")[1]),
    0,
    0
  );

  // Get the local time in the user's timezone as a string in HH:MM format
  const localeStartTime = startDate.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });

  const localeEndTime = endDate.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });

  return [localeStartTime, localeEndTime];
}
