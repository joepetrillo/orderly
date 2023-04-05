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

  return useSWR<Data, Error>(isLoaded ? url : null, fetcher);
}
