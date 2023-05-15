import { Menu } from "@headlessui/react";
import { Prisma } from "@prisma/client";
import useSWRMutation from "swr/mutation";
import Queue from "@/components/courses/home/Queue";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import useClerkSWR from "@/hooks/useClerkSWR";
import { cn, getTimes } from "@/lib/utils";

type Meeting = Prisma.MeetingGetPayload<{
  select: {
    id: true;
    owner_id: true;
    course_id: true;
    day: true;
    start_time: true;
    end_time: true;
    link: true;
  };
}>;

function DeleteMeeting(props: Meeting) {
  const authedFetch = useAuthedFetch();

  async function deleteMeeting() {
    try {
      const res = await authedFetch(
        `/courses/${props.course_id}/meetings/${props.id}`,
        {
          method: "DELETE",
        }
      );

      const deletedMeeting = await res.json();

      if (!res.ok) {
        if (deletedMeeting.error) throw new Error(deletedMeeting.error);
        else throw new Error("An unknown error occurred");
      }

      return deletedMeeting;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating, reset } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${props.course_id}/meetings/owned`,
    deleteMeeting,
    {
      revalidate: false,
      populateCache: (deletedMeeting: Meeting, existingMeetings: Meeting[]) => {
        return existingMeetings.filter(
          (meeting) => meeting.id !== deletedMeeting.id
        );
      },
      throwOnError: false,
    }
  );

  return (
    <Menu.Item>
      {({ active, close }) => (
        <button
          disabled={isMutating}
          onClick={async (e) => {
            e.preventDefault();
            await trigger();
            close();
          }}
          className={cn(
            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
            "flex w-full items-center justify-between px-4 py-2 text-left text-sm"
          )}
        >
          <span>Delete Meeting</span>
          {isMutating && <Spinner small />}
        </button>
      )}
    </Menu.Item>
  );
}

export default function MeetingQueues({ course_id }: { course_id: string }) {
  // get each of your meetings (same route as schedule)
  const { data, error, loading } = useClerkSWR<Meeting[]>(
    `/courses/${course_id}/meetings/owned`,
    { revalidateIfStale: false }
  );

  if (error) {
    return (
      <p className="flex justify-center py-10 text-red-500">{error.message}</p>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  if (data.length === 0) {
    return <p>You have not set up any meetings</p>;
  }

  return (
    <div className="space-y-10">
      {data.map((meeting) => {
        const [localeStartTime, localeEndTime] = getTimes(
          meeting.start_time,
          meeting.end_time
        );

        return (
          <div key={meeting.id} className="rounded border border-gray-200">
            <div className="flex h-[65px] items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 p-4 sm:px-6">
              <div className="font-semibold">{meeting.day}</div>
              <span className="text-sm text-gray-700">
                {localeStartTime} - {localeEndTime}
              </span>
            </div>
            <div className="divide-y p-4 text-sm leading-6 sm:px-6">
              <Queue meeting_id={meeting.id} course_id={course_id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
