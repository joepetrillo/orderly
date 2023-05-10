import { useState } from "react";
import useSWRMutation from "swr/mutation";
import SettingsCard from "@/components/courses/settings/SettingsCard";
import Input from "@/components/ui/Input";
import useAuthedFetch from "@/hooks/useAuthedFetch";

export default function CreateMeeting({
  course_id,
  user_id,
}: {
  course_id: string;
  user_id: string | null | undefined;
}) {
  const authedFetch = useAuthedFetch();
  const [name, setName] = useState("");

  async function createMeeting() {
    const requestBody = {
      name: name.replace(/\s{2,}/g, " ").trim(),
    };

    try {
      const res = await authedFetch(`/courses/${course_id}/name`, {
        method: "PATCH",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error) throw new Error(data.error);
        else throw new Error("An unknown error occurred");
      }

      setName("");
      return data.name;
    } catch (error) {
      if (error instanceof Error) throw new Error(error.message);
      else throw new Error("An unknown error occurred");
    }
  }

  const { error, trigger, isMutating } = useSWRMutation(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${course_id}/users/${user_id}/meetings`,
    createMeeting,
    {
      revalidate: false,
      populateCache: (newMeeting, existingMeetings) => {
        // Meeting and Meeting[]
        existingMeetings.push(newMeeting);
        return existingMeetings;
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
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 ">
        <select name="Day" id="meeting_day" className="form-select">
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
        </select>
        <Input
          label="Start Time"
          type="Time"
          required
          onChange={(e) => console.log(e.currentTarget.value)}
          inputId="meeting_start_time"
        />
        <Input
          label="End Time"
          type="Time"
          required
          onChange={(e) => console.log(e.currentTarget.value)}
          inputId="meeting_end_time"
        />
        <div className="col-span-3">
          <Input
            label="Link"
            type="url"
            required
            placeholder="The link to join this meeting"
            onChange={(e) => console.log(e.currentTarget.value)}
            inputId="meeting_link"
          />
        </div>
      </div>
    </SettingsCard>
  );
}
