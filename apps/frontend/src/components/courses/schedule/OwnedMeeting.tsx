import { Prisma } from "@prisma/client";

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

export default function OwnedMeeting(props: Meeting) {
  const startDate = new Date();
  startDate.setUTCHours(
    Number(props.start_time.split(":")[0]),
    Number(props.start_time.split(":")[1]),
    0,
    0
  );

  const endDate = new Date();
  endDate.setUTCHours(
    Number(props.end_time.split(":")[0]),
    Number(props.end_time.split(":")[1]),
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

  return (
    <div className="shrink-0 overflow-hidden rounded border border-gray-200">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        {props.day}
      </div>
      <div className="divide-y px-6 text-sm leading-6">
        <div className="py-4 text-gray-700">
          <p>
            {localeStartTime} - {localeEndTime}
          </p>
        </div>
      </div>
    </div>
  );
}
