import useSWR, { Fetcher } from "swr";
import { useAuth } from "@clerk/nextjs";

export default function useClerkSWR<Data>(url: string | null) {
  const { getToken, isLoaded } = useAuth();

  const fetcher: Fetcher<Data, string> = async (...args) => {
    const res = await fetch(...args, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    if (!res.ok) {
      const message = await res.json();
      throw new Error(
        message["error"] || "An error occurred while fetching data"
      );
    }

    return res.json();
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<Data, Error>(
    isLoaded && url !== null
      ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
      : null,
    fetcher
  );

  const loading = !isLoaded || isLoading;

  return { data, error, isValidating, mutate, loading };
}
