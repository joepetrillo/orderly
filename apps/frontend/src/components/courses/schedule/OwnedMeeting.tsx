import { Menu, Transition } from "@headlessui/react";
import { LinkIcon } from "@heroicons/react/20/solid";
import { ClockIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { Prisma } from "@prisma/client";
import { Fragment } from "react";
import useSWRMutation from "swr/mutation";
import Spinner from "@/components/ui/Spinner";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import { cn } from "@/lib/utils";

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

function getTimes(start_time: string, end_time: string) {
  const startDate = new Date();
  startDate.setUTCHours(
    Number(start_time.split(":")[0]),
    Number(start_time.split(":")[1]),
    0,
    0
  );

  const endDate = new Date();
  endDate.setUTCHours(
    Number(end_time.split(":")[0]),
    Number(end_time.split(":")[1]),
    0,
    0
  );

  // Get the local time in the user's timezone as a string in HH:MM format
  const localeStartTime = startDate.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });

  const localeEndTime = endDate.toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });

  return [localeStartTime, localeEndTime];
}

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

function MeetingOptions(props: Meeting) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="-mr-1 flex items-center rounded p-1 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
          <span className="sr-only">Open options</span>
          <EllipsisHorizontalIcon className="h-6 w-6" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 min-w-[14rem] origin-top-right rounded bg-white shadow-lg ring-1 ring-black/5  focus:outline-none">
          <div className="py-1">
            <DeleteMeeting {...props} />
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}

export default function OwnedMeeting(props: Meeting) {
  const [localeStartTime, localeEndTime] = getTimes(
    props.start_time,
    props.end_time
  );

  return (
    <div className="rounded border border-gray-200">
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-gray-50 p-4 sm:px-6">
        <div className="font-semibold">{props.day}</div>
        <MeetingOptions {...props} />
      </div>
      <div className="divide-y px-4 text-sm leading-6 text-gray-700 sm:px-6">
        <div className="flex items-center gap-2 py-4">
          <ClockIcon className="h-[1.3em] w-[1.3em] shrink-0 text-gray-500" />
          <span>
            {localeStartTime} - {localeEndTime}
          </span>
        </div>
        <div className="flex items-center gap-2 py-4">
          <LinkIcon className="h-[1.3em] w-[1.3em] shrink-0 text-gray-500" />
          <span className="truncate">{props.link}</span>
        </div>
      </div>
    </div>
  );
}
