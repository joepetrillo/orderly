import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";

export default function JoinCourse() {
  const { getToken } = useAuth();

  return (
    <button
      className="rounded border-[1px] border-blue-400 bg-blue-100 px-6 py-2 font-medium transition-all duration-100 hover:bg-blue-200"
      onClick={async () => {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await getToken()}`,
          },
          body: JSON.stringify({ name: "CS 497S" }),
        };
        // send a request to the API to update the data
        await fetch("http://localhost:3001/course", requestOptions);
        // update the local data immediately and revalidate (refetch)
        mutate("http://localhost:3001/course");
      }}
    >
      Join Existing Course
    </button>
  );
}
