import Image from "next/image";
import Spinner from "@/components/ui/Spinner";
import useClerkSWR from "@/hooks/useClerkSWR";
import { Member } from "@orderly/schema";

type QueueMember = Omit<Member, "emailAddress" | "role">;

export default function Queue({
  meeting_id,
  course_id,
}: {
  meeting_id: number;
  course_id: string;
}) {
  const { data, error, loading } = useClerkSWR<QueueMember[]>(
    `/courses/${course_id}/meetings/${meeting_id}/queue`
  );

  if (error) {
    return (
      <p className="flex justify-center py-4 text-red-500">{error.message}</p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  if (data.length === 0) {
    return (
      <p className="flex justify-center py-4">No students have signed up</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-4">
      {data?.map((user, index) => {
        return (
          <div key={user.id} className="flex items-center">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
              <Image
                className="object-cover"
                fill={true}
                sizes="2.5rem"
                src={user.profileImageUrl}
                alt="avatar"
              />
            </div>
            <div className="ml-4">
              <div className="min-w-0 truncate font-medium">{user.name}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
// grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
