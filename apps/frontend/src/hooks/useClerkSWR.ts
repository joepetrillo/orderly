import useSWR, { Fetcher } from "swr";
import { useAuth } from "@clerk/nextjs";
import { FetcherResponse, PublicConfiguration } from "swr/_internal";

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

    if (!res.ok) {
      const message = await res.json();
      const error: Error & { status?: number } = new Error(
        message.error || "An unknown error occurred while fetching data"
      );
      error.status = res.status;
      throw error;
    }

    return await res.json();
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
