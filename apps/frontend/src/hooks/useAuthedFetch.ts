import { useAuth } from "@clerk/nextjs";

export default function useAuthedFetch() {
  const { getToken } = useAuth();

  const authedFetch = async (url: string, options?: RequestInit) => {
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  };

  return authedFetch;
}
