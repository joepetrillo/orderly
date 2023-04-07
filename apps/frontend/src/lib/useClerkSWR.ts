import useSWR, { Fetcher } from "swr";
import { useAuth } from "@clerk/nextjs";

export default function useClerkSWR<Data>(url: string) {
  const { getToken, isLoaded } = useAuth();

  const fetcher: Fetcher<Data, string> = async (...args) => {
    const res = await fetch(...args, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    if (!res.ok) {
      const message = await res.json();
      throw new Error(message["error"]);
    }

    return res.json();
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<Data, Error>(
    isLoaded ? url : null,
    fetcher
  );

  const loading = !isLoaded || isLoading;

  return { data, error, isValidating, mutate, loading };
}
