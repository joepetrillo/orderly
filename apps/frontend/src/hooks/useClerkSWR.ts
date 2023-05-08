import { FetcherResponse, PublicConfiguration } from "swr/_internal";
import useSWR, { Fetcher } from "swr";
import { useAuth } from "@clerk/nextjs";

export default function useClerkSWR<Data>(
  url: string | null,
  options?: Partial<
    PublicConfiguration<
      Data,
      Error & { status?: number },
      (arg: string) => FetcherResponse<Data>
    >
  >
) {
  const { getToken, isLoaded } = useAuth();

  const fetcher: Fetcher<Data, string> = async (...args) => {
    const res = await fetch(...args, {
      headers: { Authorization: `Bearer ${await getToken()}` },
    });

    const data = await res.json();

    if (!res.ok) {
      const error: Error & { status?: number } = new Error(
        data.error || "An unknown error occurred while fetching data"
      );
      error.status = res.status;
      throw error;
    }

    return data;
  };

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Data,
    Error & { status?: number },
    string | null
  >(
    isLoaded && url !== null
      ? `${process.env.NEXT_PUBLIC_API_URL}${url}`
      : null,
    fetcher,
    {
      shouldRetryOnError: (error) => {
        if (error.status === 403) return false;
        return true;
      },
      ...options,
    }
  );

  const loading = !isLoaded || isLoading;

  return { data, error, loading, isValidating, mutate };
}
