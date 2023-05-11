import { Prisma } from "@prisma/client";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { z } from "zod";
import SettingsCard from "@/components/courses/settings/SettingsCard";
import Input from "@/components/ui/Input";
import useAuthedFetch from "@/hooks/useAuthedFetch";
import { createMeetingPOST } from "@orderly/schema";

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

function getUTCTime(inputTime: string) {
  const inputHours = Number(inputTime.split(":")[0]);
  const inputMinutes = Number(inputTime.split(":")[1]);

  const myDate = new Date();
  myDate.setMilliseconds(0);
  myDate.setSeconds(0);
  myDate.setHours(inputHours);
  myDate.setMinutes(inputMinutes);

  const utcHours = myDate.getUTCHours();
  const utcMinutes = myDate.getUTCMinutes();
  return `${utcHours > 9 ? utcHours : `0${utcHours}`}:${
    utcMinutes > 9 ? utcMinutes : `0${utcMinutes}`
  }`;
}

export default function CreateMeeting({ course_id }: { course_id: string }) {
  const authedFetch = useAuthedFetch();
  const [day, setDay] = useState("Mondays");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [link, setLink] = useState("");

  async function createMeeting() {
    const requestBody = {
      day: day,
      start_time: getUTCTime(startTime),
      end_time: getUTCTime(endTime),
      link: link,
    };

    try {
      createMeetingPOST.body.parse(requestBody);
    } catch (error) {
      const zodError = error as z.ZodError;
      throw new Error(zodError.issues[0].message);
    }

    try {
      const res = await authedFetch(`/courses/${course_id}/meetings`, {
        method: "POST",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      setDay("Mondays");
      setStartTime("");
      setEndTime("");
      setLink("");
      return data;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const {
    error: mutateError,
    trigger,
    isMutating,
  } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/meetings/owned`,
    createMeeting,
    {
      revalidate: false,
      populateCache: (newMeeting: Meeting, existingMeetings: Meeting[]) => {
        return [newMeeting, ...existingMeetings];
      },
      throwOnError: false,
    }
  );

  return (
    <SettingsCard
      headerTitle="Create New Meeting"
      buttonTitle="Create"
      description="Students will be able to sign up right away"
      loading={isMutating}
      onSubmit={async (e) => {
        e.preventDefault();
        await trigger();
      }}
    >
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <div className="flex flex-col">
          <label
            htmlFor="day"
            className="block text-sm font-medium text-gray-700"
          >
            Day
          </label>
          <select
            required
            id="day"
            className="form-select mt-1 block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
            value={day}
            onChange={(e) => setDay(e.currentTarget.value)}
          >
            <option value="Mondays">Mondays</option>
            <option value="Tuesdays">Tuesdays</option>
            <option value="Wednesdays">Wednesdays</option>
            <option value="Thursdays">Thursdays</option>
            <option value="Fridays">Fridays</option>
          </select>
        </div>
        <Input
          required
          inputId="start_time"
          label="Start Time"
          type="Time"
          value={startTime}
          onChange={(e) => setStartTime(e.currentTarget.value)}
        />
        <Input
          required
          inputId="end_time"
          label="End Time"
          type="Time"
          value={endTime}
          onChange={(e) => setEndTime(e.currentTarget.value)}
        />
        <div className="col-auto sm:col-span-3">
          <Input
            required
            inputId="link"
            label="Link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.currentTarget.value)}
            placeholder="Used to join the meeting"
          />
        </div>
      </div>
      {mutateError && (
        <p className="mt-5 text-xs text-red-500">{mutateError.message}</p>
      )}
    </SettingsCard>
  );
}
