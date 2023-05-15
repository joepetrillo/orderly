import { useAuth } from "@clerk/nextjs";
import { ClockIcon } from "@heroicons/react/24/outline";
import { Prisma } from "@prisma/client";
import useSWRMutation from "swr/mutation";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import useClerkSWR from "@/hooks/useClerkSWR";
import { getTimes } from "@/lib/utils";

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
}> & {
  position: number;
};

function JoinQueueButton(props: Meeting) {
  const authedFetch = useAuthedFetch();

  async function joinMeetingQueue() {
    try {
      const res = await authedFetch(
        `/courses/${props.course_id}/meetings/${props.id}/enqueue`,
        {
          method: "POST",
        }
      );

      const updatedQueueRow = await res.json();

      if (!res.ok) {
        if (updatedQueueRow.error) throw new Error(updatedQueueRow.error);
        else throw new Error("An unknown error occurred");
      }

      return updatedQueueRow;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating, reset } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${props.course_id}/meetings`,
    joinMeetingQueue,
    {
      revalidate: false,
      populateCache: (updatedMeeting, existingMeetings: Meeting[]) => {
        return existingMeetings.map((meeting) => {
          if (meeting.id === updatedMeeting.meeting_id) {
            return { ...meeting, position: updatedMeeting.position };
          }
          return meeting;
        });
      },
      throwOnError: false,
    }
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await trigger();
      }}
    >
      <Button disabled={isMutating} type="submit" size="xs">
        <span>Join Queue</span>
        {isMutating && <Spinner small />}
      </Button>
    </form>
  );
}

function LeaveQueueButton(props: Meeting) {
  const authedFetch = useAuthedFetch();
  const { userId } = useAuth();

  async function leaveMeetingQueue() {
    try {
      const res = await authedFetch(
        `/courses/${props.course_id}/meetings/${props.id}/dequeue/${userId}`,
        {
          method: "DELETE",
        }
      );

      const deletedQueueRow = await res.json();

      if (!res.ok) {
        if (deletedQueueRow.error) throw new Error(deletedQueueRow.error);
        else throw new Error("An unknown error occurred");
      }

      return deletedQueueRow;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating, reset } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${props.course_id}/meetings`,
    leaveMeetingQueue,
    {
      revalidate: false,
      populateCache: (deletedQueueRow, existingMeetings: Meeting[]) => {
        return existingMeetings.map((meeting) => {
          if (meeting.id === deletedQueueRow.meeting_id) {
            return { ...meeting, position: -1 };
          }
          return meeting;
        });
      },
      throwOnError: false,
    }
  );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await trigger();
      }}
    >
      <Button disabled={isMutating} type="submit" size="xs" variant="danger">
        <span>Leave Queue</span>
        {isMutating && <Spinner small />}
      </Button>
    </form>
  );
}

export default function MeetingSignups({ course_id }: { course_id: string }) {
  // get each of your meetings (same route as schedule)
  const { data, error, loading } = useClerkSWR<Meeting[]>(
    `/courses/${course_id}/meetings`,
    { refreshInterval: 20000 }
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
    return <p>There are no office hours setup for this course</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((meeting) => {
        const [localeStartTime, localeEndTime] = getTimes(
          meeting.start_time,
          meeting.end_time
        );

        return (
          <div key={meeting.id} className="rounded border border-gray-200">
            <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 p-4 sm:px-6">
              <div className="font-semibold">{meeting.day}</div>
            </div>
            <div className="divide-y px-4 text-sm leading-6 text-gray-700 sm:px-6">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex shrink-0 items-center gap-2 py-4">
                  <ClockIcon className="h-[1.3em] w-[1.3em] shrink-0 text-gray-500" />
                  <span>
                    {localeStartTime} - {localeEndTime}
                  </span>
                </div>
                <div className="md:hidden">
                  {meeting.position === -1 ? (
                    <JoinQueueButton {...meeting} />
                  ) : (
                    <LeaveQueueButton {...meeting} />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 py-4">
                <p>
                  {meeting.position === -1
                    ? "You haven't joined this queue"
                    : meeting.position === 0
                    ? "You're up"
                    : meeting.position === 1
                    ? "You're next"
                    : `Position: ${meeting.position}`}
                </p>
                <div className="md:hidden">
                  {meeting.position === 0 ? (
                    <Button as="externalLink" href={meeting.link} size="xs">
                      Enter Call
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="hidden items-center justify-between gap-2 py-4 md:flex">
                {meeting.position === -1 ? (
                  <JoinQueueButton {...meeting} />
                ) : (
                  <>
                    <LeaveQueueButton {...meeting} />
                    {meeting.position === 0 ? (
                      <Button as="externalLink" href={meeting.link} size="xs">
                        Enter Call
                      </Button>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
